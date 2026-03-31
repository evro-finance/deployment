import { get, getList } from '../data/content';

export function RiskSection() {
  const risks = getList('risk', 'risk', ['title', 'mitigation']);

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Risk Architecture</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('risk', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '32px' }}>
        {get('risk', 'body')}
      </p>
      <div className="risk-grid">
        {risks.map(risk => (
          <div key={risk.title} className="glass-card risk-card">
            <div className="risk-title">{risk.title}</div>
            <div className="risk-mitigation">{risk.mitigation}</div>
          </div>
        ))}
      </div>
      {get('risk', 'sp-note') && (
        <div className="glass-card" style={{ padding: '20px', marginTop: '24px', borderLeft: '3px solid var(--evro-orange)' }}>
          <p className="label" style={{ marginBottom: '8px', color: 'var(--evro-orange)' }}>Stability Pool as Acquisition Engine</p>
          <p className="body-text" style={{ fontSize: '0.85rem' }}>{get('risk', 'sp-note')}</p>
        </div>
      )}
    </section>
  );
}
