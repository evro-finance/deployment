const risks = [
  {
    title: "Smart Contract Risk",
    mitigation: "Immutable contracts forked from Liquity V2 audited codebase. No admin keys, no upgrade authority. Code governs all parameters immutably.",
  },
  {
    title: "Collateral Volatility",
    mitigation: "Six isolated branches ensure single-collateral drawdowns cannot cascade. Buffer headroom (CR minus MCR) monitored per branch with automated liquidation paths.",
  },
  {
    title: "Oracle Dependency",
    mitigation: "EVRO inherits Liquity V2 oracle architecture with chainlink feeds and fallback to Uniswap TWAP. Manipulation-resistant by design.",
  },
  {
    title: "Liquidity Fragmentation",
    mitigation: "Concentrated deployment into three MEV-protected venues (SP, Anchor, Bridge) prevents thin-market risk. Batch auction settlement eliminates frontrunning.",
  },
  {
    title: "Regulatory Surface",
    mitigation: "EVRO is a decentralized CDP protocol. No issuer, no custodian. Protocol operates autonomously once deployed. No single entity controls redemptions.",
  },
  {
    title: "Peg Stability",
    mitigation: "Hard redemption floor through arbitrage incentives. Borrowers above MCR cannot be undercut. Stability Pool acts as first-loss absorber.",
  },
];

export function RiskSection() {
  return (
    <section className="section">
      <div className="label" style={{ marginBottom: "12px" }}>Risk Architecture</div>
      <h2 className="heading-lg" style={{ marginBottom: "8px" }}>
        Isolation by Design
      </h2>
      <p className="body-text" style={{ marginBottom: "32px" }}>
        Every risk vector is structurally contained. The six-branch architecture ensures no single failure
        mode can propagate across the system.
      </p>
      <div className="risk-grid">
        {risks.map(risk => (
          <div key={risk.title} className="glass-card risk-card">
            <div className="risk-title">{risk.title}</div>
            <div className="risk-mitigation">{risk.mitigation}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
