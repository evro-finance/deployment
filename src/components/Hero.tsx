import { get } from '../data/content';

export function Hero() {
  return (
    <section className="section" style={{ paddingTop: '120px', paddingBottom: '40px', position: 'relative' }}>
      <span className="marginalia marginalia-left">
        EVRO-GEN-001 · V5 · MARCH 2026 · MANDATE OF INQUIRY
      </span>
      <span className="marginalia marginalia-right">
        {get('hero', 'meta')}
      </span>

      <div className="animate-in">
        <p className="label" style={{ marginBottom: '16px', color: 'var(--accent)' }}>
          {get('hero', 'subtitle')}
        </p>
        <h1 className="heading-xl" style={{ marginBottom: '24px' }}>
          {get('hero', 'title')}
        </h1>
        <div className="divider" />
        <p className="body-text animate-in delay-1" style={{ maxWidth: '620px' }}>
          {get('hero', 'body')}
        </p>
        {get('hero', 'body2') && (
          <p className="body-text animate-in delay-2" style={{ maxWidth: '620px', marginTop: '16px' }}
             dangerouslySetInnerHTML={{ __html: get('hero', 'body2').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        )}
      </div>
    </section>
  );
}
