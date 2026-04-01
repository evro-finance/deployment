import { get } from '../data/content';

export function CTASection() {
  const title = get('cta', 'title');
  const body = get('cta', 'body');
  const buttonText = get('cta', 'button');
  const link = get('cta', 'link');

  return (
    <section className="section" style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 className="heading-lg" style={{ marginBottom: '12px' }}>
        {title}
      </h2>
      <p className="body-text" style={{ marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
        {body}
      </p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '14px 32px',
          background: 'var(--accent)',
          color: '#fff',
          fontFamily: 'var(--font-heading)',
          fontSize: '0.85rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          borderRadius: '4px',
          textDecoration: 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.85';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {buttonText}
      </a>
    </section>
  );
}
