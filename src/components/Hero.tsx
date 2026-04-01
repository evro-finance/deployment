import { get } from '../data/content';

export function Hero() {
  return (
    <section className="section" style={{ paddingTop: '100px', paddingBottom: '32px', position: 'relative' }}>
      <span className="marginalia marginalia-left">
        EVRO-GEN-001 · V5 · MARCH 2026 · DEPLOYMENT GUIDE
      </span>
      <span className="marginalia marginalia-right">
        {get('hero', 'meta')}
      </span>

      <div className="animate-in">
        <p className="label" style={{ marginBottom: '16px', color: 'var(--accent)' }}>
          {get('hero', 'subtitle')}
        </p>
        <h1 className="heading-xl" style={{ marginBottom: '20px' }}
            dangerouslySetInnerHTML={{ __html: get('hero', 'title').replace(/\*\*(.*?)\*\*/g, '<span style="color: var(--accent); white-space: nowrap">$1</span>') }}
        />
        <div className="divider" />
        <p className="animate-in delay-1" style={{
          maxWidth: '720px',
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.15rem, 2vw, 1.4rem)',
          fontWeight: 400,
          lineHeight: 1.45,
          color: 'var(--foreground)',
          letterSpacing: '-0.01em',
        }}
           dangerouslySetInnerHTML={{ __html: get('hero', 'body').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
        {get('hero', 'body2') && (
          <p className="animate-in delay-2" style={{
            maxWidth: '720px',
            marginTop: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
            color: 'var(--accent)',
          }}>
            {get('hero', 'body2')}
          </p>
        )}
      </div>
    </section>
  );
}
