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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {cohorts.map((c, i) => {
          const detail = get('cohorts', `cohort-${i + 1}-detail`);
          const requirements = get('cohorts', `cohort-${i + 1}-requirements`);
          return (
            <div key={c.number} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '0' }}>
              {/* Left — identity */}
              <div style={{ padding: '24px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="cohort-number">{c.number}</div>
                <div className="cohort-title" style={{ marginBottom: '12px' }}>{c.title}</div>
                <div style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(160,130,245,0.1)', borderRadius: '3px', width: 'fit-content' }}>
                  <span className="label-sm" style={{ color: 'var(--accent)' }}>{c.conviction}</span>
                </div>
              </div>
              {/* Right — content */}
              <div style={{ padding: '24px' }}>
                <div className="cohort-desc">{c.desc}</div>
                {detail && (
                  <div className="cohort-desc" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    {detail}
                  </div>
                )}
                {requirements && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <span className="label-sm" style={{ color: 'var(--evro-orange)', display: 'block', marginBottom: '8px' }}>Requirements</span>
                    <div className="cohort-desc">{requirements}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
