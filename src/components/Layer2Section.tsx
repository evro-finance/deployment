import { get } from '../data/content';

export function Layer2Section() {
  // Total capital committed per venue (EVRO + counter-asset)
  // SP: €1.0M EVRO only = 25% of venue capital
  // Anchor: €1.0M EVRO + €1.0M sDAI = 50% of venue capital
  // Bridge: €0.5M EVRO + €0.5M EURe = 25% of venue capital
  // These will be rigged to the deployer dashboard later
  const venues = [
    { key: 'sp', color: 'var(--chart-sp)' },
    { key: 'anchor', color: 'var(--chart-anchor)' },
    { key: 'bridge', color: 'var(--chart-bridge)' },
  ];

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Layer 2 — Distribution</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('layer2', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '32px' }}>
        {get('layer2', 'body')}
      </p>

      {/* ── Venue Cards ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {venues.map(v => {
          const title = get('layer2', `${v.key}-title`);
          const venue = get('layer2', `${v.key}-venue`);
          const pair = get('layer2', `${v.key}-pair`);
          const desc = get('layer2', `${v.key}-desc`);

          return (
            <div key={v.key} className="glass-card" style={{ padding: '24px', borderTop: `3px solid ${v.color}`, position: 'relative' }}>
              {pair ? (
                <>
                  <div className="heading-md" style={{ color: v.color, marginBottom: '4px' }}>
                    {pair} · {venue}
                  </div>
                  <div className="label-sm" style={{ marginBottom: '12px' }}>{title}</div>
                </>
              ) : (
                <>
                  <div className="heading-md" style={{ color: v.color, marginBottom: '4px' }}>{title}</div>
                  <div className="label-sm" style={{ marginBottom: '12px' }}>{venue}</div>
                </>
              )}
              <div className="divider" style={{ margin: '0 0 12px' }} />
              <p style={{ fontSize: '0.9rem', lineHeight: '1.55', color: 'var(--evro-shark-400)' }}>{desc}</p>
            </div>
          );
        })}
      </div>


      {/* ── Rationale Cards ──────────────────────────── */}
      {get('layer2', 'balancer-body') && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '16px', borderLeft: '3px solid var(--evro-blue)' }}>
          <p className="heading-md" style={{ marginBottom: '12px' }}>{get('layer2', 'balancer-title')}</p>
          <p className="body-text" style={{ fontSize: '0.9rem' }}
             dangerouslySetInnerHTML={{ __html: get('layer2', 'balancer-body').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>
      )}
      {get('layer2', 'curve-body') && (
        <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid var(--evro-pink)' }}>
          <p className="heading-md" style={{ marginBottom: '12px' }}>{get('layer2', 'curve-title')}</p>
          <p className="body-text" style={{ fontSize: '0.9rem' }}
             dangerouslySetInnerHTML={{ __html: get('layer2', 'curve-body').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>
      )}
    </section>
  );
}
