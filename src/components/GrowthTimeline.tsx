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
        {phases.map((phase, i) => (
          <div key={phase.title} className="phase-item">
            <div>
              <div className="phase-number">Phase {i + 1}</div>
              <div className="label-sm" style={{ marginTop: '4px' }}>{phase.target}</div>
            </div>
            <div className="phase-dot" />
            <div className="phase-content">
              <div className="phase-title">{phase.title}</div>
              <div className="phase-desc">{phase.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
