const cohorts = [
  {
    number: "Cohort 01",
    title: "Arbitrage Borrowers",
    conviction: "Highest",
    desc: "DeFi-native borrowers who open EVRO Troves at 3.5-5% APR to capture the spread against Aave EURe Borrow (7-8%) or Spark sDAI Borrow (6%). The rate differential is the demand engine.",
  },
  {
    number: "Cohort 02",
    title: "DAO Treasuries",
    conviction: "High",
    desc: "DAOs holding idle collateral (GNO, wstETH, WBTC) can mint EVRO to deploy productive capital without selling position. GnosisDAO alone holds $200M+ in treasury assets. Ecosystem DAOs are first-tier targets.",
  },
  {
    number: "Cohort 03",
    title: "GnosisDAO Recovery",
    conviction: "High",
    desc: "GnosisDAO lost approximately $700k in the Angle Protocol wind-down. EVRO migration recovers that capital into a yield-bearing, GNO-native stablecoin.",
  },
  {
    number: "Cohort 04",
    title: "Idle Zero (Ecosystem)",
    conviction: "Long-Term",
    desc: "A future product path where EVRO holders earn yield while spending through Gnosis Pay. Architecturally feasible using Zodiac modules and decentralized keepers. A community-buildable, permissionless integration.",
  },
];

export function CohortSection() {
  return (
    <section className="section">
      <div className="label" style={{ marginBottom: "12px" }}>Demand Channels</div>
      <h2 className="heading-lg" style={{ marginBottom: "8px" }}>
        Who Benefits
      </h2>
      <p className="body-text" style={{ marginBottom: "32px" }}>
        Four distinct user cohorts, ranked by conviction level and time-to-activation.
      </p>
      <div className="cohort-grid">
        {cohorts.map(c => (
          <div key={c.number} className="glass-card cohort-card">
            <div className="cohort-number">{c.number}</div>
            <div className="cohort-title">{c.title}</div>
            <div style={{ display: "inline-block", padding: "2px 8px", background: "rgba(160,130,245,0.1)", borderRadius: "3px", marginBottom: "12px" }}>
              <span className="label-sm" style={{ color: "var(--accent)" }}>{c.conviction}</span>
            </div>
            <div className="cohort-desc">{c.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
