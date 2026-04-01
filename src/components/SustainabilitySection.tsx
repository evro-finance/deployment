import { get } from '../data/content';

export function SustainabilitySection() {
  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Revenue Architecture</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('sustainability', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '24px' }}
         dangerouslySetInnerHTML={{ __html: get('sustainability', 'body').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
      />

      {/* ── 75/25 Split ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', borderTop: '3px solid var(--evro-purple)' }}>
          <div className="anchor-stat" style={{ color: 'var(--evro-purple)', marginBottom: '12px' }}>75%</div>
          <p className="body-text" style={{ fontSize: '0.9rem' }}
             dangerouslySetInnerHTML={{ __html: get('sustainability', 'sp-share').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>
        <div className="glass-card" style={{ padding: '24px', borderTop: '3px solid var(--evro-orange)' }}>
          <div className="anchor-stat" style={{ color: 'var(--evro-orange)', marginBottom: '12px' }}>25%</div>
          <p className="body-text" style={{ fontSize: '0.9rem' }}
             dangerouslySetInnerHTML={{ __html: get('sustainability', 'dao-share').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>
      </div>

      {/* ── RETVRN Token ─────────────────────────────── */}
      {get('sustainability', 'token-body') && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '3px solid var(--accent)' }}>
          <p className="label" style={{ marginBottom: '8px', color: 'var(--accent)' }}>RETVRN</p>
          <p className="body-text" style={{ fontSize: '0.9rem' }}
             dangerouslySetInnerHTML={{ __html: get('sustainability', 'token-body').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>
      )}

      {/* ── Revenue Projections ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {get('sustainability', 'revenue-5m') && (
          <div className="glass-card stat-card">
            <span className="stat-label">At €5M Deployed</span>
            <div className="anchor-stat accent" style={{ margin: '8px 0' }}>~€190k/yr</div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.55', color: 'var(--evro-shark-400)' }}>
              {get('sustainability', 'revenue-5m')}
            </p>
          </div>
        )}
        {get('sustainability', 'revenue-25m') && (
          <div className="glass-card stat-card">
            <span className="stat-label">At €25M TVL (Phase 4)</span>
            <div className="anchor-stat accent" style={{ margin: '8px 0' }}>~€950k/yr</div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.55', color: 'var(--evro-shark-400)' }}>
              {get('sustainability', 'revenue-25m')}
            </p>
          </div>
        )}
      </div>

      {/* ── Alignment Argument ───────────────────────── */}
      {get('sustainability', 'alignment') && (
        <div className="glass-card" style={{ padding: '24px', borderLeft: '3px solid var(--evro-green)' }}>
          <p className="label" style={{ marginBottom: '8px', color: 'var(--evro-green)' }}>Structural Alignment</p>
          <p className="section-pullquote" style={{ marginBottom: '16px' }}>The DAO is aligned with LP protection — not extraction.</p>
          <p className="body-text" style={{ fontSize: '0.9rem' }}
             dangerouslySetInnerHTML={{ __html: get('sustainability', 'alignment').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        </div>
      )}
    </section>
  );
}
