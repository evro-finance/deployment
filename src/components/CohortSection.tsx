import { get } from '../data/content';

export function CohortSection() {
  const cohorts = [
    { key: '1', color: 'var(--evro-purple)' },
    { key: '2', color: 'var(--evro-blue)' },
    { key: '3', color: 'var(--evro-pink)' },
  ];

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Demand Channels</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('cohorts', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '40px' }}>
        {get('cohorts', 'body')}
      </p>

      {cohorts.map((c) => {
        const title = get('cohorts', `cohort-${c.key}-title`);
        const conviction = get('cohorts', `cohort-${c.key}-conviction`);
        const body = get('cohorts', `cohort-${c.key}-body`);
        if (!title) return null;
        return (
          <article key={c.key} style={{ marginBottom: '40px', paddingLeft: '20px', borderLeft: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <h3 className="heading-md" style={{ margin: 0 }}>{title}</h3>
              <span style={{ padding: '2px 10px', background: 'rgba(160,130,245,0.1)', borderRadius: '3px' }}>
                <span className="label-sm" style={{ color: 'var(--accent)' }}>{conviction}</span>
              </span>
            </div>
            {body && body.split('\n\n').map((para, i) => (
              <p key={i} className="body-text" style={{ marginBottom: '16px' }}
                 dangerouslySetInnerHTML={{ __html: para
                   .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: underline">$1</a>')
                 }}
              />
            ))}
          </article>
        );
      })}
    </section>
  );
}
