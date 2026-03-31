import { get, getList } from '../data/content';

export function KPISection() {
  const kpis = getList('kpis', 'kpi', ['label', 'target', 'timeframe']);

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Execution Metrics</div>
      <h2 className="heading-lg" style={{ marginBottom: '32px' }}>
        {get('kpis', 'title')}
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
