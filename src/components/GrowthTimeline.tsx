import { get, getList } from '../data/content';

export function GrowthTimeline() {
  const phases = getList('growth', 'phase', ['title', 'target', 'desc']);

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Growth Trajectory</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('growth', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '32px' }}>
        {get('growth', 'body')}
      </p>
      <div className="phase-timeline">
        {phases.map((phase, i) => {
          const detail = get('growth', `phase-${i + 1}-detail`);
          const impact = get('growth', `phase-${i + 1}-impact`);
          const pathway = get('growth', `phase-${i + 1}-pathway`);
          return (
            <div key={phase.title} className="phase-item">
              <div>
                <div className="phase-number">Phase {i + 1}</div>
                <div className="anchor-stat accent" style={{ marginTop: '6px' }}>{phase.target}</div>
              </div>
              <div className="phase-dot" />
              <div className="phase-content">
                <div className="phase-title">{phase.title}</div>
                <div className="phase-desc">{phase.desc}</div>
                {detail && (
                  <div className="phase-desc" style={{ marginTop: '12px' }}>{detail}</div>
                )}
                {impact && (
                  <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(160,130,245,0.06)', borderRadius: '4px', borderLeft: '2px solid var(--accent)' }}>
                    <span className="label-sm" style={{ color: 'var(--accent)', display: 'block', marginBottom: '6px' }}>Estimated Impact</span>
                    <div className="phase-desc">{impact}</div>
                  </div>
                )}
                {pathway && (
                  <div style={{ marginTop: '8px', padding: '12px 16px', background: 'rgba(239,169,96,0.06)', borderRadius: '4px', borderLeft: '2px solid var(--evro-orange)' }}>
                    <span className="label-sm" style={{ color: 'var(--evro-orange)', display: 'block', marginBottom: '6px' }}>Key Pathway</span>
                    <div className="phase-desc">{pathway}</div>
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
