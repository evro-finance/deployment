# hero

## title
€5M Deployment Into Euro-Denominated Yield Infrastructure

## subtitle
EVRO Genesis · Capital Deployment Strategy

## body
A two-layer architecture that mints EVRO — a CDP-issued Euro stablecoin on Gnosis Chain, built on a Liquity v2 fork — across six isolated collateral branches and deploys it into MEV-protected liquidity venues. Every number on this page is interactive.

## meta
Prepared for: GnosisDAO | Date: March 31, 2026 | Version: IDE-Assisted Final | Status: Ready for Submission Review

---

# problem

## title
European Capital On-Chain Is Dead Capital

## body
European capital on-chain is dead capital. EURe yields approximately **0%**. The MakerDAO DSR pays **4%+** to USD holders. The only other Euro CDP — Angle Protocol (agEUR/EURA) — is in active wind-down following governance vote AIP-112, with redemptions closing March 1, 2027. The decentralized Euro CDP market will be empty.

## body2
EVRO fills this gap: a Euro-denominated stablecoin backed by real yield — sDAI earning DSR, wstETH earning staking rewards, GNO earning validator income — and structurally protected from MEV extraction through batch auction settlement. The target is not speculative retail. The target is institutional and treasury capital seeking Euro-denominated yield without US regulatory exposure.

## stat-1-label
Angle Protocol Supply (Peak)

## stat-1-value
$180M

## stat-2-label
Angle Protocol Supply (Now)

## stat-2-value
$4M

## stat-3-label
EURe Native Yield

## stat-3-value
~0%

---

# simulator

## title
Deployment Architecture

## body
Capital is allocated across 6 collateral branches. Each branch is a standalone Liquity v2 smart contract with its own oracle, liquidation threshold, and interest rate. A failure in one branch cannot cascade into another. Drag the slider to model different deployment sizes.

---

# layer2

## title
The Liquidity Architecture

## body
Minted EVRO is deployed into three venues forming a hub-and-spoke backstop.

## sp-desc
Liquidation backstop. Earns 75% of all Trove interest income + discounted collateral from liquidation events.

## anchor-desc
Primary depth. LVR-protected via FM-AMM batch settlement. Stacks boosted lending yield on idle capital.

## bridge-desc
Retail spend routing. Enables direct EURe/EVRO swaps for downstream applications.

---

# risk

## title
Isolation by Design

## body
The EVRO protocol enforces contagion prevention at the smart contract layer. Every risk vector is structurally contained.

## risk-1-title
Collateral Crash

## risk-1-mitigation
Each branch is an isolated vault. A GNO crash cannot trigger sDAI liquidation.

## risk-2-title
Redemption Queue

## risk-2-mitigation
Interest rates are set defensively to avoid front-of-queue exposure.

## risk-3-title
MEV / LVR Extraction

## risk-3-mitigation
FM-AMM batch settlement via CoW Hooks on the Anchor Pool.

## risk-4-title
Curve LVR Bleed

## risk-4-mitigation
Capped at 500k to contain as a controlled cost-center for enabling EURe/EVRO retail swap routing.

## risk-5-title
Oracle Lag

## risk-5-mitigation
20-minute heartbeat window identified and addressed in adversarial model. CR buffers absorb moderate lag.

## risk-6-title
FX Risk (EUR/USD)

## risk-6-mitigation
Stablecoin-collateral branches (sDAI, wXDAI) are exposed to EUR/USD oracle pricing. CR buffers absorb moderate FX moves.

## sp-note
When a Trove in any branch is liquidated, Stability Pool stakers absorb the debt and receive the liquidated collateral at a protocol discount. During market stress — precisely when other yield sources compress — the Stability Pool activates as a diversified asset acquisition engine.

---

# cohorts

## title
Who Benefits from EVRO?

## body
Four distinct user cohorts, ranked by conviction level and time-to-activation.

## cohort-1-number
Cohort 01

## cohort-1-title
Euro Borrowers Seeking Better Rates

## cohort-1-conviction
Highest

## cohort-1-desc
Borrowers of Euro-denominated stablecoins on Gnosis Chain currently face interest rates significantly above the rates available through EVRO Troves. For borrowers with material positions, migrating to an EVRO Trove offers self-sovereign rate setting, MEV-protected liquidity, and collateral isolation — each position exists in its own branch with no cross-contamination risk.

## cohort-2-number
Cohort 02

## cohort-2-title
DAO Treasuries

## cohort-2-conviction
High

## cohort-2-desc
DAOs holding idle wstETH or GNO could lock it as collateral, mint EVRO, and earn protocol yield without changing their asset conviction. GnosisDAO treasury alone holds significant GNO and stablecoin reserves. Even a 5% allocation to EVRO collateral branches would represent meaningful TVL. Smaller Gnosis-ecosystem DAOs (Cow Protocol, Hopr, Gnosis Guild) run lean teams with treasury management bandwidth constraints — EVRO's set-and-forget CR design is built for exactly this operational profile.

## cohort-3-number
Cohort 03

## cohort-3-title
GnosisDAO Treasury Recovery

## cohort-3-conviction
High

## cohort-3-desc
GnosisDAO already lost approximately $700k in the Karpatkey-era Balancer v2 pools due to oracle lag and LVR extraction. Those legacy pools are now in recovery mode with $0 TVL. EVRO's Anchor Pool (Balancer v3 + CoW Hooks) is the direct upgrade to the infrastructure that failed. The pitch is not "try our new thing" — it is "stop the bleeding and move your capital into the architecture specifically designed to fix the problem that cost you $700k."

## cohort-4-number
Cohort 04

## cohort-4-title
Retail Spending via Gnosis Pay

## cohort-4-conviction
Long-Term

## cohort-4-desc
A technical path exists to connect EVRO yield to everyday Euro spending through Gnosis Pay. The concept — internally called Idle Zero — allows a user's capital to earn Stability Pool yield while a permissionless keeper automatically swaps just enough EVRO to EURe to keep the Gnosis Pay card funded. The architecture leverages Gnosis Safe's existing modular framework (Zodiac) and can be built as open-source community tooling without requiring changes to Gnosis Pay itself.

---

# growth

## title
Growth Trajectory: The Bull Case

## body
The following trajectory represents the surviving thesis after rigorous analysis. Significant validation work remains at each phase, but the directional logic is sound and the underlying mechanics are on-chain verifiable.

## phase-1-title
The Infrastructure

## phase-1-target
€5M

## phase-1-desc
NOCA deposits collateral across 6 branches, mints EVRO, and deploys it into the three-venue architecture. The Stability Pool is seeded. The Anchor Pool has depth. The Bridge Pool enables EURe/EVRO routing. The infrastructure exists — properly buffered, properly incentivized.

## phase-2-title
Organic Migration + Leveraged Demand

## phase-2-target
€10–15M

## phase-2-desc
As the cost-of-borrowing delta between legacy venues and EVRO becomes undeniable, institutional borrowers begin evaluating migration. This is arithmetic convergence, not a marketing event. In parallel, pursuing an EVRO listing on Gnosis-native money markets (Aave v3 Gnosis, SparkLend) unlocks leveraged demand channels. Contango — a DeFi looping layer already deployed on Gnosis Chain — can atomically create leveraged EVRO positions once the listing exists. Early conversations with Contango's founding team are underway.

## phase-3-title
Treasury Adoption

## phase-3-target
€15–20M

## phase-3-desc
EVRO has a track record. The risk isolation architecture has held through at least one meaningful market cycle. DAO treasury committees can evaluate a protocol with operational history rather than a whitepaper. The pitch is collateral efficiency without conviction change.

## phase-4-title
Ecosystem Integration

## phase-4-target
€20–25M+

## phase-4-desc
EVRO matures into core Euro-denominated infrastructure within the Gnosis ecosystem. Community-driven POL commitments follow as protocols build around the deployed liquidity. If open-source tooling emerges that enables Gnosis Pay settlement routing through EVRO liquidity pools, retail transaction volume adds a new demand layer.

---

# kpis

## title
How We Measure Success

## kpi-1-label
Capital Utilization

## kpi-1-target
>95% of €5M deployed

## kpi-1-timeframe
At launch

## kpi-2-label
EVRO Circulating Supply

## kpi-2-target
€2.85M – €3.29M

## kpi-2-timeframe
At launch

## kpi-3-label
Anchor Pool Slippage

## kpi-3-target
<0.5% on standard trades

## kpi-3-timeframe
Ongoing

## kpi-4-label
Cross-Branch Contagion

## kpi-4-target
Zero cascade events

## kpi-4-timeframe
Ongoing

## kpi-5-label
Stability Pool APR

## kpi-5-target
~2.85% baseline

## kpi-5-timeframe
Interest share only

## kpi-6-label
Borrower Migration

## kpi-6-target
Rate delta modeled

## kpi-6-timeframe
Before Phase 2

---

# footer

## line1
EVRO Genesis · Capital Deployment Strategy · V5 · March 2026

## line2
Prepared for GnosisDAO · IDE-Assisted Research · Harness 3.5

## line3
This document is governed by the Mandate of Inquiry. Every allocation, yield claim, and venue selection is traceable to an empirical anchor or an explicitly stated assumption. This is not financial advice.
