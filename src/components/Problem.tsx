import { get } from '../data/content';

export function Problem() {
  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>The Problem</div>
      <h2 className="heading-lg" style={{ marginBottom: '12px' }}>
        {get('problem', 'title')}
      </h2>
      <p className="section-pullquote" style={{ marginBottom: '24px', color: 'var(--accent)' }}>The decentralized Euro CDP market will be empty.</p>
      <p className="body-text" style={{ marginBottom: '32px' }}
         dangerouslySetInnerHTML={{ __html: get('problem', 'body').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
      />

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="glass-card stat-card" style={{ flex: '1', minWidth: '200px' }}>
          <span className="stat-label">{get('problem', 'stat-1-label')}</span>
          <span className="stat-value">{get('problem', 'stat-1-value')}</span>
        </div>
        <div className="glass-card stat-card" style={{ flex: '1', minWidth: '200px' }}>
          <span className="stat-label">{get('problem', 'stat-2-label')}</span>
          <span className="stat-value" style={{ color: 'var(--evro-pink)' }}>{get('problem', 'stat-2-value')}</span>
        </div>
        <div className="glass-card stat-card" style={{ flex: '1', minWidth: '200px' }}>
          <span className="stat-label">{get('problem', 'stat-3-label')}</span>
          <span className="stat-value" style={{ color: 'var(--muted-foreground)' }}>{get('problem', 'stat-3-value')}</span>
        </div>
      </div>

      <p className="body-text" style={{ marginTop: '32px' }}
         dangerouslySetInnerHTML={{ __html: get('problem', 'body2').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
      />
    </section>
  );
}
