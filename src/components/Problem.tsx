export function Problem() {
  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>The Problem</div>
      <h2 className="heading-lg" style={{ marginBottom: '20px' }}>
        European Capital On-Chain<br />Is Dead Capital
      </h2>
      <p className="body-text" style={{ marginBottom: '32px' }}>
        EURe yields approximately <strong>0%</strong>. The MakerDAO DSR pays <strong>4%+</strong> to USD holders. 
        The only other Euro CDP — Angle Protocol (agEUR/EURA) — is in active wind-down following governance 
        vote AIP-112, with redemptions closing March 1, 2027. The decentralized Euro CDP market will be empty.
      </p>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="glass-card stat-card" style={{ flex: '1', minWidth: '200px' }}>
          <span className="stat-label">Angle Protocol Supply (Peak)</span>
          <span className="stat-value">$180M</span>
        </div>
        <div className="glass-card stat-card" style={{ flex: '1', minWidth: '200px' }}>
          <span className="stat-label">Angle Protocol Supply (Now)</span>
          <span className="stat-value" style={{ color: 'var(--evro-pink)' }}>$4M</span>
        </div>
        <div className="glass-card stat-card" style={{ flex: '1', minWidth: '200px' }}>
          <span className="stat-label">EURe Native Yield</span>
          <span className="stat-value" style={{ color: 'var(--muted-foreground)' }}>~0%</span>
        </div>
      </div>

      <p className="body-text" style={{ marginTop: '32px' }}>
        EVRO fills this gap: a Euro-denominated stablecoin backed by real yield — sDAI earning DSR, wstETH 
        earning staking rewards, GNO earning validator income — and structurally protected from MEV extraction 
        through batch auction settlement.
      </p>
    </section>
  );
}
