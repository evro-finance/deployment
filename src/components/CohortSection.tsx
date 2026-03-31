import { get, getList } from '../data/content';

export function CohortSection() {
  const cohorts = getList('cohorts', 'cohort', ['number', 'title', 'conviction', 'desc']);

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Demand Channels</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('cohorts', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '32px' }}>
        {get('cohorts', 'body')}
      </p>
      <div className="cohort-grid">
        {cohorts.map(c => (
          <div key={c.number} className="glass-card cohort-card">
            <div className="cohort-number">{c.number}</div>
            <div className="cohort-title">{c.title}</div>
            <div style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(160,130,245,0.1)', borderRadius: '3px', marginBottom: '12px' }}>
              <span className="label-sm" style={{ color: 'var(--accent)' }}>{c.conviction}</span>
            </div>
            <div className="cohort-desc">{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
