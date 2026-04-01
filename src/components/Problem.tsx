import { get } from '../data/content';

export function Problem() {
  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>{get('problem', 'label')}</div>
      <h2 className="heading-lg" style={{ marginBottom: '12px' }}>
        {get('problem', 'title')}
      </h2>
      <p className="section-pullquote" style={{ marginBottom: '24px', color: 'var(--accent)' }}>
        {get('problem', 'pullquote')}
      </p>
      <p className="body-text" style={{ marginBottom: '24px' }}
         dangerouslySetInnerHTML={{ __html: get('problem', 'body').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
      />

      <p className="body-text"
         dangerouslySetInnerHTML={{ __html: get('problem', 'body2').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
      />
    </section>
  );
}
