import { useState, useMemo } from 'react';
import './styles/tokens.css';
import './styles/global.css';
import { BRANCHES, DEFAULT_CAPITAL, calculateDeployment } from './data/branches';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { Simulator } from './components/Simulator';
import { RiskSection } from './components/RiskSection';
import { CohortSection } from './components/CohortSection';
import { GrowthTimeline } from './components/GrowthTimeline';
import { KPISection } from './components/KPISection';
import { Footer } from './components/Footer';

function App() {
  const [totalCapital, setTotalCapital] = useState(DEFAULT_CAPITAL);
  const [weights] = useState<Record<string, number>>(
    Object.fromEntries(BRANCHES.map(b => [b.id, b.defaultWeight]))
  );
  const [crs] = useState<Record<string, number>>(
    Object.fromEntries(BRANCHES.map(b => [b.id, b.defaultCR]))
  );

  const calculations = useMemo(
    () => calculateDeployment(totalCapital, weights, crs),
    [totalCapital, weights, crs]
  );

  return (
    <>
      <div className="grain" />
      <div className="blueprint-grid" />

      <Hero />
      <Problem />
      <Simulator
        totalCapital={totalCapital}
        onCapitalChange={setTotalCapital}
        calculations={calculations}
      />
      <RiskSection />
      <CohortSection />
      <GrowthTimeline />
      <KPISection />
      <Footer />
    </>
  );
}

export default App;
