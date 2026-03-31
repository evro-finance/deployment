const kpis = [
  { label: 'Total Value Locked', target: '€5M → €25M', timeframe: '24 months' },
  { label: 'Borrower Utilization', target: '>60%', timeframe: '6 months' },
  { label: 'SP Yield', target: '3.5–5% APR', timeframe: 'Ongoing' },
  { label: 'DAO Revenue', target: '€25k+/yr per €5M', timeframe: '12 months' },
  { label: 'Peg Stability', target: '±0.5%', timeframe: 'Ongoing' },
  { label: 'Unique Borrowers', target: '50+', timeframe: '6 months' },
];

export function KPISection() {
  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Execution Metrics</div>
      <h2 className="heading-lg" style={{ marginBottom: '32px' }}>
        How We Measure Success
      </h2>
      <div className="kpi-grid">
        {kpis.map(kpi => (
          <div key={kpi.label} className="glass-card stat-card">
            <span className="stat-label">{kpi.label}</span>
            <span className="stat-value" style={{ fontSize: '1.2rem' }}>{kpi.target}</span>
            <span className="label-sm" style={{ marginTop: '4px' }}>{kpi.timeframe}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
