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

      {/* Primary — Schedule a Call */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <a
          className="btn-primary"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {buttonText}
        </a>

        {/* Ghost — Go to Platform */}
        <a
          className="btn-ghost"
          href="https://app.evro.finance"
          target="_blank"
          rel="noopener noreferrer"
        >
          app.evro.finance →
        </a>

        {/* Marginalia — Research Compendium */}
        <a
          className="btn-utility"
          href="/research.html"
          style={{ marginTop: '8px' }}
        >
          Read the Research Compendium
        </a>
      </div>
    </section>
  );
}
