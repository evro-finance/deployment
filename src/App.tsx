import { useState, useMemo, useEffect } from 'react';
import './styles/tokens.css';
import './styles/global.css';
import { BRANCHES, DEFAULT_CAPITAL, calculateDeployment } from './data/branches';
import { Hero } from './components/Hero';
import { Problem } from './components/Problem';
import { Simulator } from './components/Simulator';
import { Layer2Section } from './components/Layer2Section';
import { RiskSection } from './components/RiskSection';
import { CohortSection } from './components/CohortSection';
import { SustainabilitySection } from './components/SustainabilitySection';
import { GrowthTimeline } from './components/GrowthTimeline';
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
      <Simulator
        totalCapital={totalCapital}
        onCapitalChange={setTotalCapital}
        calculations={calculations}
      />
      <Layer2Section />
      <RiskSection />
      <CohortSection />
      <SustainabilitySection />
      <GrowthTimeline />
      <Footer />
    </>
  );
}

export default App;
