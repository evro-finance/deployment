import { get } from '../data/content';

export function GovernanceSection() {
  const moves = [1, 2, 3, 4, 5, 6];

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Governance</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('governance', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '32px', maxWidth: '720px' }}
         dangerouslySetInnerHTML={{ __html: get('governance', 'body').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
      />

      {/* ── Governance Moves ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {moves.map(n => {
          const title = get('governance', `move-${n}-title`);
          const desc = get('governance', `move-${n}-desc`);
          if (!title) return null;
          return (
            <div key={n} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start', borderLeft: '3px solid var(--accent)' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--accent)',
                background: 'rgba(160,130,245,0.08)',
                borderRadius: '4px',
                padding: '2px 8px',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                {String(n).padStart(2, '0')}
              </span>
              <div>
                <p className="heading-sm" style={{ marginBottom: '6px' }}>
                  {n === 5 ? (
                    <><a href="https://alphagrowth.io/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid rgba(160,129,245,0.3)', transition: 'border-color 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(160,129,245,0.3)')}>Alpha Growth</a> Partnership</>
                  ) : n === 6 ? (
                    <><a href="https://contango.exchange/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid rgba(160,129,245,0.3)', transition: 'border-color 0.15s ease' }} onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(160,129,245,0.3)')}>Contango</a> Integration</>
                  ) : title}
                </p>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--evro-shark-400)' }}
                   dangerouslySetInnerHTML={{ __html: desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Architecture Note ────────────────────────── */}
      {get('governance', 'architecture-body') && (
        <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '20px' }}>
          <p className="body-text" style={{ fontSize: '0.9rem' }}
             dangerouslySetInnerHTML={{ __html: get('governance', 'architecture-body').replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--muted-foreground);font-weight:600">$1</strong>') }}
          />
        </div>
      )}
    </section>
  );
}
