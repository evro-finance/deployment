const phases = [
  {
    number: 'Phase 1',
    title: 'Genesis Deployment',
    target: '€5M',
    desc: 'Initial capital deployment across six branches. Stability Pool liquidity established. Borrower demand activated through rate arbitrage. MEV-protected settlement live.',
  },
  {
    number: 'Phase 2',
    title: 'Demand Amplification',
    target: '€10–15M',
    desc: 'EVRO listing on Aave/Spark Gnosis opens leveraged demand. Contango integration enables automated looping — each €1 of protocol capital generates up to €3-4 in circulating EVRO. Active engagement with Contango founder in progress.',
  },
  {
    number: 'Phase 3',
    title: 'Ecosystem Integration',
    target: '€15–20M',
    desc: 'DAO treasury migrations begin. Cross-chain bridge deployments to Ethereum mainnet. Institutional DeFi discovery phase — EVRO becomes a credible Euro yield primitive.',
  },
  {
    number: 'Phase 4',
    title: 'Retail Access',
    target: '€20–25M+',
    desc: 'Community-built Idle Zero integration connects EVRO yield to Gnosis Pay spend. Protocol-owned liquidity deepens. EVRO approaches self-sustaining flywheel status.',
  },
];

export function GrowthTimeline() {
  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Growth Trajectory</div>
      <h2 className="heading-lg" style={{ marginBottom: '32px' }}>
        Phased Scaling
      </h2>
      <div className="phase-timeline">
        {phases.map(phase => (
          <div key={phase.number} className="phase-item">
            <div>
              <div className="phase-number">{phase.number}</div>
              <div className="label-sm" style={{ marginTop: '4px' }}>{phase.target}</div>
            </div>
            <div className="phase-dot" />
            <div className="phase-content">
              <div className="phase-title">{phase.title}</div>
              <div className="phase-desc">{phase.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
