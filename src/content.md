# hero

## title
€5M Deployment Into Euro-Denominated Yield Infrastructure

## subtitle
EVRO Genesis · Capital Deployment Strategy

## body
This document specifies the deployment of €5,000,000 to initialize EVRO — a CDP-issued Euro stablecoin on Gnosis Chain, built on a Liquity v2 fork with asset-isolated minting and MEV-protected liquidity.

## body2
The architecture operates across two interdependent layers: **Layer 1 (Minting)** locks €5M across 6 isolated collateral branches to mint ~€2.85M–€3.29M EVRO. **Layer 2 (Distribution)** deploys minted EVRO into 3 liquidity venues to establish market depth, peg stability, and swap routing. Every number on this page is interactive.

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

## cr-strategy
**Collateral Ratio Strategy:** CR targets are calibrated for monthly-check-in operators, not daily traders. The lower bound of each range suits an attentive manager; the upper bound suits a "deploy and go on holiday" operator.

## rate-strategy
**Interest Rate Strategy:** Rates sit at the midpoint of market expectations. This balances borrowing cost against redemption queue positioning — remaining competitive while avoiding front-of-queue exposure.

---

# layer2

## title
The Liquidity Architecture

## body
Minted EVRO is deployed into three venues forming a hub-and-spoke backstop.

## sp-title
Stability Pool

## sp-allocation
€1.0M EVRO

## sp-venue
EVRO Protocol

## sp-desc
Liquidation backstop. Earns 75% of all Trove interest income + discounted collateral from liquidation events.

## anchor-title
Anchor Pool

## anchor-allocation
€1.0M EVRO + sDAI

## anchor-pair
sDAI/EVRO

## anchor-venue
Balancer v3 + CoW Hooks

## anchor-desc
Primary depth. LVR-protected via FM-AMM batch settlement. Stacks boosted lending yield on idle capital.

## bridge-title
Bridge Pool

## bridge-allocation
€0.5M EVRO + EURe

## bridge-pair
EURe/EVRO

## bridge-venue
Curve StableSwap

## bridge-desc
Retail spend routing. Enables direct EURe ↔ EVRO swaps for downstream applications.

## balancer-title
Why Balancer v3 + CoW Hooks?

## balancer-body
Balancer v3 with CoW Hooks is the mathematically superior anchor venue. It combines FM-AMM LVR protection with boosted lending yield on idle pool tranches — stacking two yield sources that no other single venue on Gnosis Chain currently offers. The CoW Hooks are immutable on-chain contracts; the protection persists independently of Balancer governance decisions.

## curve-title
Why Curve for the Bridge?

## curve-body
Curve lacks native MEV protection, meaning arb-bots extract value from the pool. By capping the allocation at €500k, this bleed is contained as a fixed cost-center — the price of enabling EURe/EVRO retail swap routing on Gnosis Chain.

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
When a Trove in any branch is liquidated, Stability Pool stakers absorb the debt and receive the liquidated collateral at a protocol discount. During market stress — precisely when other yield sources compress — the Stability Pool activates as a diversified asset acquisition engine, capturing discounted GNO, wstETH, sDAI, and other collateral across all 6 branches.

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
Borrowers of Euro-denominated stablecoins on Gnosis Chain currently face interest rates significantly above the rates available through EVRO Troves. The stated UI rate doesn't capture the full cost picture — when factoring in MEV extraction on unprotected venues and the absence of boosted yield mechanics, the effective cost delta is likely wider than the headline spread suggests.

## cohort-1-detail
For borrowers with material positions, migrating to an EVRO Trove offers self-sovereign rate setting — borrowers choose their own interest rate. MEV-protected liquidity — no value extraction from oracle lag or arb-bots. Collateral isolation — each position exists in its own branch with no cross-contamination risk. The precise breakeven point (including gas and slippage costs) requires further modeling, but the directional benefit is clear and on-chain verifiable.

## cohort-2-number
Cohort 02

## cohort-2-title
DAO Treasuries

## cohort-2-conviction
High

## cohort-2-desc
DAOs holding idle wstETH or GNO could lock it as collateral, mint EVRO, and earn protocol yield without changing their asset conviction. DAOs are crypto-native organizations that already live inside smart contract risk — the question is not whether they understand the mechanics, but whether the yield premium justifies adding another protocol to their stack.

## cohort-2-detail
GnosisDAO treasury alone holds significant GNO and stablecoin reserves. Even a 5% allocation to EVRO collateral branches would represent meaningful TVL. Lido DAO has substantial wstETH holdings on Gnosis Chain — currently unproductive. A collateral deployment at conservative CRs mints EVRO while retaining full ETH conviction. Smaller Gnosis-ecosystem DAOs (Cow Protocol, Hopr, Gnosis Guild) run lean teams with treasury management bandwidth constraints — EVRO's "set-and-forget" CR design is built for exactly this operational profile.

## cohort-2-requirements
What's required to unlock this: BD execution — no DAO has been approached yet. This is a sales and relationship problem, not a product problem. Institutional validation — EVRO is being built in direct partnership with GnosisDAO, which significantly shortens governance cycles for Gnosis-ecosystem DAOs. Governance timelines — DAO treasury deployments require governance votes. Lido's process alone takes months. This is a medium-term cohort that must be initiated early to close on time. The reference deployment — Phase 1 (the €5M NOCA deployment) creates the operational track record that treasury committees need to evaluate. Without it, there is nothing to pitch.

## cohort-3-number
Cohort 03

## cohort-3-title
GnosisDAO Treasury Recovery

## cohort-3-conviction
High

## cohort-3-desc
This isn't speculative. GnosisDAO already lost approximately $700k in the Karpatkey-era Balancer v2 pools due to oracle lag and LVR extraction. Those legacy pools are now in recovery mode with $0 TVL. The DAO's own treasury liquidity needs a new home.

## cohort-3-detail
EVRO's Anchor Pool (Balancer v3 + CoW Hooks) is the direct upgrade to the infrastructure that failed. The pitch is not "try our new thing" — it is "stop the bleeding and move your capital into the architecture specifically designed to fix the problem that cost you $700k."

## cohort-3-requirements
Why this is the strongest near-term POL case: GnosisDAO has the pain (documented losses), the capital (significant GNO + stablecoin reserves), and the governance access (EVRO is a Gnosis-native protocol). If GnosisDAO deploys its own treasury into the EVRO Anchor Pool, that becomes the reference case every other protocol points to. Subsequent POL targets — protocols building Euro-denominated settlement on Gnosis Chain — can then evaluate a venue with GnosisDAO's own money in it. What's required: Phase 1 must be deployed and operational first (the reference track record). A formal GIP (Gnosis Improvement Proposal) positioning the EVRO Anchor Pool as the successor to the legacy Balancer v2 treasury deployment.

## cohort-4-number
Cohort 04

## cohort-4-title
Retail Spending via Gnosis Pay

## cohort-4-conviction
Long-Term

## cohort-4-desc
A technical path exists to connect EVRO yield to everyday Euro spending through Gnosis Pay. The concept — internally called Idle Zero — allows a user's capital to earn Stability Pool yield while a permissionless keeper automatically swaps just enough EVRO to EURe to keep the Gnosis Pay card funded. The user never holds idle EURe.

## cohort-4-detail
The architecture leverages Gnosis Safe's existing modular framework (Zodiac) and can be built as open-source community tooling without requiring changes to Gnosis Pay itself. The keeper function can be decentralized via networks like Gelato, avoiding centralized operator licensing under MiCA. This is a buildable product path — not a whiteboard concept. As the EVRO ecosystem matures, any community developer or team could deploy this integration independently.

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
As the cost-of-borrowing delta between legacy venues and EVRO becomes undeniable, institutional borrowers begin evaluating migration. This is arithmetic convergence, not a marketing event. The Stability Pool deepens as second-mover capital enters.

## phase-2-detail
In parallel, pursuing an EVRO listing on Gnosis-native money markets (Aave v3 Gnosis, SparkLend) unlocks leveraged demand channels. Contango — a DeFi looping layer already deployed on Gnosis Chain — can atomically create leveraged EVRO positions once the listing exists. Early conversations with Contango's founding team are underway.

## phase-2-impact
If Contango routes even €2M of leveraged EVRO positions, that represents ~40% of the Phase 1 mandate as amplified demand. The Stability Pool carry trade (SP yield > borrow cost) creates a self-reinforcing loop: leveraged borrowers pay interest → SP depositors earn yield → deeper SP → more confidence → more borrowers.

## phase-2-pathway
Marc Zeller, an angel backer of Contango, also leads Aave governance (Aave Chan Initiative). This cross-portfolio alignment creates a named pathway for an EVRO listing proposal on the Aave Gnosis Market.

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
EVRO matures into core Euro-denominated infrastructure within the Gnosis ecosystem. Community-driven POL commitments follow as protocols build around the deployed liquidity. If open-source tooling emerges that enables Gnosis Pay settlement routing through EVRO liquidity pools, retail transaction volume adds a new demand layer. This phase is aspirational and depends on execution across all prior phases.

---

# sustainability

## title
Protocol Sustainability

## body
The EVRO protocol generates revenue from borrowing interest — not from trading fees, not from token emissions, not from external incentive programs. Every basis point of interest paid by a Trove borrower splits into two streams, hardcoded in the protocol's smart contracts:

## sp-share
**75%** flows to the Stability Pool. This is the base yield — the economic reason to hold EVRO. At the Genesis deployment's blended interest rate (~3.8%), Stability Pool stakers earn approximately **2.85% APR** from interest income alone, before any liquidation discount gains.

## dao-share
**25%** flows to the EVRO DAO via the interestRouter. The DAO — a Moloch v3 (Baal) instance on Gnosis Chain — governs how this stream is allocated: LP incentives, ecosystem partnerships, and protocol growth initiatives.

## token-body
The governance token, **RETVRN**, has a fixed supply of **100,000,000** tokens distributed at launch across RaidGuild (30%), GnosisDAO (15%), and the DAO treasury (55%). RETVRN is not an emissions token. It is a governance token with revenue alignment. The name is the mandate: manage the interestRouter — the stream that turns deployed capital into sustained ecosystem depth.

## alignment
This design resolves a specific structural failure. Legacy protocol DAOs that earn from DEX trading fees are positively correlated with bot extraction volume — the DAO profits when LPs are harmed. EVRO's revenue comes from borrowing rates set by borrowers themselves. LP retention drives borrowing depth, which drives DAO revenue. The DAO is aligned with LP protection — not extraction. This is the incentive architecture that Angle's agEUR lacked when it collapsed from $180M to $4M in circulating supply.

## revenue-5m
At €5M deployed with a ~3.8% blended interest rate: annual interest income ~€190,000. Stability Pool share (75%): ~€142,500/yr. DAO treasury share (25%): ~€47,500/yr.

## revenue-25m
At €25M TVL (Phase 4 target), the 25% stream becomes ~€237,500/yr — a self-funding governance operation.

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
