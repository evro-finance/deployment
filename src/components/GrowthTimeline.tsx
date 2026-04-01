import { get, getList } from '../data/content';

export function GrowthTimeline() {
  const phases = getList('growth', 'phase', ['title', 'target', 'desc']);

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Growth Trajectory</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        A Path to Multiplying TVL<br />
        <span style={{ color: 'var(--muted-foreground)', fontWeight: 300 }}>(And what your reserve percentage will be used for)</span>
      </h2>
      <p className="body-text" style={{ marginBottom: '40px' }}>
        {get('growth', 'body')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {phases.map((phase, i) => {
          const parts = (phase.desc || '').split('\n\n');
          const mainDesc = parts.filter(p => !p.startsWith('*')).join('\n\n');
          const signifier = parts.find(p => p.startsWith('*'));
          const signifierText = signifier ? signifier.replace(/^\*/, '').replace(/\*$/, '') : null;


          return (
            <div key={phase.title} className="glass-card" style={{
              padding: '24px 24px 24px 20px',
              borderLeft: '3px solid var(--accent)',
              marginBottom: '16px',
            }}>
              {/* Eyebrow */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--muted-foreground)',
                marginBottom: '6px',
              }}>
                Phase {i + 1} · {phase.target}
              </div>

              {/* Title */}
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--accent)',
                margin: '0 0 12px 0',
                lineHeight: 1.2,
              }}>
                {phase.title}
              </h3>

              {/* Desc + Signifier — constrained */}
              <div>
                {/* Signifier — action, comes first, dominant */}
                {signifierText && (
                  <p style={{
                    fontSize: '1.05rem',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    fontWeight: 500,
                    color: 'var(--accent)',
                    margin: '0 0 10px 0',
                  }}>
                    {signifierText}
                  </p>
                )}

                {/* Description */}
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  color: 'var(--evro-shark-400)',
                  margin: 0,
                }}>
                  {mainDesc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
