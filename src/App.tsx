import { useState, useEffect, useCallback, useMemo } from 'react';
import './styles/tokens.css';
import './styles/global.css';
import { DEFAULT_CAPITAL, BRANCHES, DEFAULT_L2_SHARES, type L2Shares } from './data/branches';
import { computeYield } from './data/yield-engine';
import type { YieldResult } from './data/yield-engine';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { DeploymentPlan } from './components/DeploymentPlan';
import { Layer2Section } from './components/Layer2Section';

import { CohortSection } from './components/CohortSection';

import { GrowthTimeline } from './components/GrowthTimeline';
import { GovernanceSection } from './components/GovernanceSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

export interface BranchState {
  weight: number;
  cr: number;
  rate: number;
}

// Posture ranges — healthy buffers above minMCR, never kissing the minimum
// CR ranges: data-derived from engine drawdown analysis (drawdown-implied safe floor + buffer)
// Rate ranges: Conservative = HIGH rate (redemption protection, set-and-forget)
//              Aggressive   = LOW rate  (competitive borrowing, actively monitored)
// Source: 365-day price engine + EUR/USD forex risk + CDP market benchmarks
const POSTURE_RANGES: Record<string, { conservativeCR: number; aggressiveCR: number; conservativeRate: number; aggressiveRate: number }> = {
  sdai:   { conservativeCR: 2.20, aggressiveCR: 1.55, conservativeRate: 0.055, aggressiveRate: 0.025 },
  gno:    { conservativeCR: 3.60, aggressiveCR: 2.30, conservativeRate: 0.065, aggressiveRate: 0.035 },
  wsteth: { conservativeCR: 3.30, aggressiveCR: 2.55, conservativeRate: 0.060, aggressiveRate: 0.030 },
  wxdai:  { conservativeCR: 1.85, aggressiveCR: 1.30, conservativeRate: 0.055, aggressiveRate: 0.025 },
  wbtc:   { conservativeCR: 2.60, aggressiveCR: 1.70, conservativeRate: 0.060, aggressiveRate: 0.030 },
  osgno:  { conservativeCR: 3.60, aggressiveCR: 2.30, conservativeRate: 0.065, aggressiveRate: 0.035 },
};

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function App() {
  const [totalCapital, setTotalCapital] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_CAPITAL;
    const params = new URLSearchParams(window.location.search);
    const cap = params.get('cap');
    return cap ? Number(cap) : DEFAULT_CAPITAL;
  });

  const [incentiveShare, setIncentiveShare] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const params = new URLSearchParams(window.location.search);
    const inc = params.get('inc');
    return inc ? Math.max(0, Math.min(1, Number(inc))) : 0;
  });

  const [posture, setPosture] = useState(() => {
    if (typeof window === 'undefined') return 0.5;
    const params = new URLSearchParams(window.location.search);
    // Legacy: explicit pst param takes priority
    const pst = params.get('pst');
    if (pst) return Math.max(0, Math.min(1, Number(pst)));
    // Infer posture from explicit per-branch CR/rate params by inverting the lerp.
    // We sample all branches that have explicit values and average the inferred t.
    const samples: number[] = [];
    for (const b of BRANCHES) {
      const r = POSTURE_RANGES[b.id];
      if (!r) continue;
      const urlC = params.get(`${b.id}_c`);
      const urlR = params.get(`${b.id}_r`);
      if (urlC != null) {
        const cr = Number(urlC) / 100;
        const tCr = (cr - r.conservativeCR) / (r.aggressiveCR - r.conservativeCR);
        samples.push(Math.max(0, Math.min(1, tCr)));
      }
      if (urlR != null) {
        const rate = Number(urlR) / 1000;
        const tRate = (rate - r.conservativeRate) / (r.aggressiveRate - r.conservativeRate);
        samples.push(Math.max(0, Math.min(1, tRate)));
      }
    }
    if (samples.length > 0) return samples.reduce((a, b) => a + b, 0) / samples.length;
    return 0.5;
  });
  
  const [lpName] = useState(() => {
    if (typeof window === 'undefined') return 'Gnosis';
    const params = new URLSearchParams(window.location.search);
    return params.get('lp') || 'Gnosis';
  });

  const [branchStates, setBranchStates] = useState<Record<string, BranchState>>(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    return Object.fromEntries(BRANCHES.map(b => {
      const urlW  = params?.get(b.id);
      const urlC  = params?.get(`${b.id}_c`); // explicit CR (×100, e.g. 155 = 1.55)
      const urlR  = params?.get(`${b.id}_r`); // explicit rate (×1000, e.g. 25 = 2.5%)
      return [b.id, {
        weight: urlW != null ? Number(urlW) / 100 : b.defaultWeight,
        cr:     urlC != null ? Number(urlC) / 100 : b.defaultCR,
        rate:   urlR != null ? Number(urlR) / 1000 : b.interestRate,
      }];
    }));
  });

  const [l2Shares, setL2Shares] = useState<L2Shares>(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (!params?.get('sp')) return DEFAULT_L2_SHARES;
    return {
      sp: Number(params.get('sp') || 40) / 100,
      anchor: Number(params.get('anchor') || 35) / 100,
      bridge: Number(params.get('bridge') || 20) / 100,
      reserve: Number(params.get('reserve') || 5) / 100,
    };
  });

  // Lock state — which control sections are frozen
  const [locks, setLocks] = useState<Record<string, boolean>>({
    controls: false, branches: false, l2: false,
  });

  const toggleLock = useCallback((key: string) => {
    setLocks(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetAll = useCallback(() => {
    setTotalCapital(DEFAULT_CAPITAL);
    setPosture(0.5);
    setIncentiveShare(0);
    setBranchStates(Object.fromEntries(BRANCHES.map(b => [b.id, {
      weight: b.defaultWeight, cr: b.defaultCR, rate: b.interestRate,
    }])));
    setL2Shares(DEFAULT_L2_SHARES);
    setLocks({ capital: false, posture: false, branches: false, l2: false, router: false });
  }, []);

  // When posture changes, recompute all CRs and rates
  const applyPosture = useCallback((p: number) => {
    setPosture(p);
    setBranchStates(prev => {
      const next: Record<string, BranchState> = {};
      for (const b of BRANCHES) {
        const r = POSTURE_RANGES[b.id];
        next[b.id] = {
          weight: prev[b.id].weight, // weights stay untouched
          cr: Math.round(lerp(r.conservativeCR, r.aggressiveCR, p) * 20) / 20, // round to 0.05
          rate: Math.round(lerp(r.conservativeRate, r.aggressiveRate, p) * 200) / 200, // round to 0.005
        };
      }
      return next;
    });
  }, []);

  // One-time effect: if we have a custom 'pst' in URL, apply corresponding branch params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pst = params.get('pst');
    if (pst) {
      applyPosture(Math.max(0, Math.min(1, Number(pst))));
    }
  }, [applyPosture]);

  const onAdjustL2Shares = useCallback((key: keyof L2Shares, target: number) => {
    const t = Math.max(0, Math.min(1, target));
    setL2Shares(prev => {
      const keys: (keyof L2Shares)[] = ['sp', 'anchor', 'bridge', 'reserve'];
      const next = { ...prev };
      let diff = t - prev[key];
      next[key] = t;

      const idx = keys.indexOf(key);
      let step = 1;

      if (diff > 0) {
        // Taking from subsequent venues
        while (diff > 1e-9 && step < keys.length) {
          const nextKey = keys[(idx + step) % keys.length];
          const available = next[nextKey];
          const take = Math.min(available, diff);
          next[nextKey] -= take;
          diff -= take;
          step++;
        }
      } else if (diff < -1e-9) {
        // Giving back entirely to the immediate next venue
        const nextKey = keys[(idx + 1) % keys.length];
        next[nextKey] += Math.abs(diff);
      }

      // Cleanup floating point artifacts
      keys.forEach(k => {
        next[k] = Math.max(0, Math.min(1, next[k]));
      });

      return next;
    });
  }, []);

  const updateBranch = useCallback((id: string, field: keyof BranchState, delta: number) => {
    setBranchStates(prev => {
      const cur = prev[id];
      let newVal = cur[field] + delta;
      if (field === 'weight') newVal = Math.max(0, Math.min(1, newVal));
      if (field === 'cr') newVal = Math.max(1.05, Math.min(5, newVal));
      if (field === 'rate') newVal = Math.max(0, Math.min(0.20, newVal));
      return { ...prev, [id]: { ...cur, [field]: newVal } };
    });
  }, []);

  // Build branch allocations array for yield engine
  // useMemo here is critical: without it, a new array reference is created every render,
  // causing the yieldResult memo below to re-run on every scroll/hover even when nothing changed.
  const branchAllocations = useMemo(
    () => BRANCHES.map(b => ({
      id: b.id,
      weight: branchStates[b.id].weight,
      cr: branchStates[b.id].cr,
      rate: branchStates[b.id].rate,
    })),
    [branchStates]
  );

  // Compute yield once, share between DeploymentPlan and RevenueReplay
  const yieldResult: YieldResult = useMemo(
    () => computeYield(totalCapital, branchAllocations, incentiveShare, l2Shares),
    [totalCapital, branchAllocations, incentiveShare, l2Shares]
  );

  // Build share URL — all state serialised explicitly (no abstract posture shorthand)
  const shareUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://deployment.evro.finance';
    const p = new URLSearchParams();
    p.set('lp', lpName);
    p.set('cap', String(totalCapital));
    p.set('inc', String(incentiveShare));
    for (const b of BRANCHES) {
      const bs = branchStates[b.id];
      p.set(b.id, String(Math.round(bs.weight * 100)));         // weight %
      p.set(`${b.id}_c`, String(Math.round(bs.cr * 100)));      // CR ×100
      p.set(`${b.id}_r`, String(Math.round(bs.rate * 1000)));   // rate ×1000
    }
    p.set('sp', String(Math.round(l2Shares.sp * 100)));
    p.set('anchor', String(Math.round(l2Shares.anchor * 100)));
    p.set('bridge', String(Math.round(l2Shares.bridge * 100)));
    p.set('reserve', String(Math.round(l2Shares.reserve * 100)));
    return `${base}?${p.toString()}`;
  }, [lpName, totalCapital, incentiveShare, branchStates, l2Shares]);

  // Sync the current state back to the browser's address bar seamlessly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', shareUrl);
    }
  }, [shareUrl]);

  useEffect(() => {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    sections.forEach((section, i) => {
      if (i === 0) {
        section.classList.add('revealed');
      } else {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="grain" />
      <div className="blueprint-grid" />

      <Hero />
      <Problem />
      <DeploymentPlan
        totalCapital={totalCapital}
        onCapitalChange={setTotalCapital}
        branchStates={branchStates}
        onUpdateBranch={updateBranch}
        incentiveShare={incentiveShare}
        onIncentiveChange={setIncentiveShare}
        posture={posture}
        onPostureChange={applyPosture}
        yieldTotals={yieldResult.totals}
        yieldResult={yieldResult}
        l2Shares={l2Shares}
        onAdjustL2Shares={onAdjustL2Shares}
        lpName={lpName}
        shareUrl={shareUrl}
        locks={locks}
        onToggleLock={toggleLock}
        onReset={resetAll}
      />
      <Layer2Section />
      <CohortSection />

      <GrowthTimeline />
      <GovernanceSection />
      <CTASection />
      <Footer />
    </>
  );
}

export default App;
