import { useState, useEffect, useCallback } from 'react';
import './styles/tokens.css';
import './styles/global.css';
import { DEFAULT_CAPITAL, BRANCHES } from './data/branches';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { DeploymentPlan } from './components/DeploymentPlan';
import { RevenueReplay } from './components/RevenueReplay';
import { Layer2Section } from './components/Layer2Section';

import { CohortSection } from './components/CohortSection';

import { GrowthTimeline } from './components/GrowthTimeline';
import { GovernanceSection } from './components/GovernanceSection';
import { Footer } from './components/Footer';

export interface BranchState {
  weight: number;
  cr: number;
  rate: number;
}

function App() {
  const [totalCapital, setTotalCapital] = useState(DEFAULT_CAPITAL);
  const [incentivesToLps, setIncentivesToLps] = useState(false);
  const [branchStates, setBranchStates] = useState<Record<string, BranchState>>(
    Object.fromEntries(BRANCHES.map(b => [b.id, {
      weight: b.defaultWeight,
      cr: b.defaultCR,
      rate: b.interestRate,
    }]))
  );

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
        incentivesToLps={incentivesToLps}
        onToggleIncentives={setIncentivesToLps}
      />
      <RevenueReplay
        totalCapital={totalCapital}
        branches={branchAllocations}
        incentivesToLps={incentivesToLps}
      />
      <Layer2Section />
      <CohortSection />

      <GrowthTimeline />
      <GovernanceSection />

      <Footer />
    </>
  );
}

export default App;
