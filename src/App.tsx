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
const POSTURE_RANGES: Record<string, { conservativeCR: number; aggressiveCR: number; conservativeRate: number; aggressiveRate: number }> = {
  sdai:   { conservativeCR: 2.00, aggressiveCR: 1.40, conservativeRate: 0.020, aggressiveRate: 0.050 },
  gno:    { conservativeCR: 2.50, aggressiveCR: 1.60, conservativeRate: 0.025, aggressiveRate: 0.065 },
  wsteth: { conservativeCR: 2.20, aggressiveCR: 1.50, conservativeRate: 0.025, aggressiveRate: 0.060 },
  wxdai:  { conservativeCR: 1.60, aggressiveCR: 1.15, conservativeRate: 0.015, aggressiveRate: 0.045 },
  wbtc:   { conservativeCR: 2.50, aggressiveCR: 1.50, conservativeRate: 0.030, aggressiveRate: 0.070 },
  osgno:  { conservativeCR: 2.50, aggressiveCR: 1.60, conservativeRate: 0.025, aggressiveRate: 0.060 },
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
    const pst = params.get('pst');
    return pst ? Math.max(0, Math.min(1, Number(pst))) : 0.5;
  });
  
  const [lpName] = useState(() => {
    if (typeof window === 'undefined') return 'Gnosis';
    const params = new URLSearchParams(window.location.search);
    return params.get('lp') || 'Gnosis';
  });

  const [branchStates, setBranchStates] = useState<Record<string, BranchState>>(() => 
    Object.fromEntries(BRANCHES.map(b => [b.id, {
      weight: b.defaultWeight,
      cr: b.defaultCR,
      rate: b.interestRate,
    }]))
  );

  const [l2Shares, setL2Shares] = useState<L2Shares>(DEFAULT_L2_SHARES);

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
      const others = keys.filter(k => k !== key);
      const prevOthersSum = others.reduce((s, k) => s + prev[k], 0);
      const next = { ...prev, [key]: t };
      const remaining = 1 - t;
      if (prevOthersSum <= 1e-12) {
        const each = remaining / 3;
        others.forEach(k => { next[k] = each; });
      } else {
        others.forEach(k => { next[k] = (prev[k] / prevOthersSum) * remaining; });
      }
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
