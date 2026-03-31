export function Hero() {
  return (
    <section className="section" style={{ paddingTop: '120px', paddingBottom: '40px', position: 'relative' }}>
      <span className="marginalia marginalia-left">
        EVRO-GEN-001 · V5 · MARCH 2026 · MANDATE OF INQUIRY
      </span>
      <span className="marginalia marginalia-right">
        PREPARED FOR GNOSISDAO · IDE-ASSISTED FINAL · CLASSIFIED: INTERNAL
      </span>

      <div className="animate-in">
        <p className="label" style={{ marginBottom: '16px', color: 'var(--accent)' }}>
          EVRO Genesis · Capital Deployment Strategy
        </p>
        <h1 className="heading-xl" style={{ marginBottom: '24px' }}>
          €5M Deployment<br />
          <span style={{ color: 'var(--accent)' }}>Into Euro-Denominated</span><br />
          Yield Infrastructure
        </h1>
        <div className="divider" />
        <p className="body-text animate-in delay-1" style={{ maxWidth: '620px' }}>
          A two-layer architecture that mints EVRO — a CDP-issued Euro stablecoin on Gnosis Chain — 
          across six isolated collateral branches and deploys it into MEV-protected liquidity venues. 
          Every number on this page is interactive.
        </p>
      </div>
    </section>
  );
}
