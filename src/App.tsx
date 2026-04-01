import { useState, useEffect, useCallback, useMemo } from 'react';
import './styles/tokens.css';
import './styles/global.css';
import { DEFAULT_CAPITAL, BRANCHES } from './data/branches';
import { computeYield } from './data/yield-engine';
import type { YieldResult } from './data/yield-engine';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { DeploymentPlan } from './components/DeploymentPlan';
import { RevenueReplay } from './components/RevenueReplay';
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
  const [totalCapital, setTotalCapital] = useState(DEFAULT_CAPITAL);
  const [incentiveShare, setIncentiveShare] = useState(0); // 0 = DAO gets 25%, 1 = all to LPs
  const [posture, setPosture] = useState(0.5); // 0 = conservative, 1 = aggressive
  const [branchStates, setBranchStates] = useState<Record<string, BranchState>>(
    Object.fromEntries(BRANCHES.map(b => [b.id, {
      weight: b.defaultWeight,
      cr: b.defaultCR,
      rate: b.interestRate,
    }]))
  );

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
  const branchAllocations = BRANCHES.map(b => ({
    id: b.id,
    weight: branchStates[b.id].weight,
    cr: branchStates[b.id].cr,
    rate: branchStates[b.id].rate,
  }));

  // Compute yield once, share between DeploymentPlan and RevenueReplay
  const yieldResult: YieldResult = useMemo(
    () => computeYield(totalCapital, branchAllocations, incentiveShare),
    [totalCapital, branchAllocations, incentiveShare]
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
      />
      <RevenueReplay
        totalCapital={totalCapital}
        branches={branchAllocations}
        incentiveShare={incentiveShare}
        yieldResult={yieldResult}
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
