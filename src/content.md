<!--
  Genesis on-page copy. Edit here — Vite hot-reloads into components via get().
  Confirm wording in the browser; numbers and controls still come from the app logic.
-->

# hero

## title
Deploy Into European **MEV-Protected** Yield Infrastructure

## subtitle
EVRO Genesis · Capital Deployment Guide

## body
EVRO is a CDP-issued Euro stablecoin on Gnosis Chain — asset-isolated minting, MEV-protected liquidity, real yield from day one. The architecture operates across two layers: **Layer 1 (Minting)** locks collateral across 6 isolated branches. **Layer 2 (Distribution)** deploys minted EVRO into 3 liquidity venues for market depth, peg stability, and swap routing.

## body2
Use this deployment guide's dashboards to model your position. For the full evidentiary basis — see the [Research Compendium](/research.html).

## meta
Prepared for: GnosisDAO | Date: March 31, 2026

---

# problem

## label
The Problem

## title
European Capital On-Chain Shouldn't be Dead Capital

## pullquote
The decentralized Euro CDP market will be empty.

## body
European capital on-chain is dead capital. EURe yields **0%**. USD stablecoin holders earn **4%+** through the DAI Savings Rate but remain exposed to FX. The only other Euro CDP — Angle Protocol — is shutting down.

## body2
**EVRO fills this gap:** a Euro stablecoin backed by real yield — sDAI earning the Savings Rate, wstETH earning staking rewards, GNO earning validator income — with MEV protection through batch auction settlement (CoW Swap AMM).

---

# simulator

## title
Simulate your positions with 1 year of market data

## body
Drag the slider to model different deployment sizes.

## methodology
Historical replay — Apr 1 2025 to Mar 31 2026. Every number is computed from real on-chain data: BOLD Stability Pool APY (interest + liquidation gains), sDAI and wstETH compounding ratios, GNO staking yields, and CoW AMM batch-auction settlement fees. Not a projection.

---

# deploy

## section-label
Deployment Plan

## capital-label
Capital

## capital-min
€1M

## capital-max
€25M

## posture-label
Posture

## posture-conservative
Conservative

## posture-balanced
Balanced

## posture-aggressive
Aggressive

## posture-hint-left
↑ CR ↓ Rate

## posture-hint-right
↓ CR ↑ Rate

## router-label
Interest Router

## router-summary-dao25
25% DAO

## router-summary-all-lps
All LPs

## router-summary-partial
{{pct}}% DAO

## router-end-dao
DAO

## router-end-lps
LPs

## apy-label
Annualized Yield

## apy-footnote
SP yield · Collateral staking · CoW AMM fees

## lp-position-label
LP position ({{days}}d)

## dao-fee-label
DAO fee ({{pct}}%)

## net-gnosis-label
Net to Gnosis

## net-lp-label
Net to LP

## map-title
Capital Map

## map-collateral
Collateral locked

## map-minted
EVRO minted

## map-line-sp
　→ Stability Pool

## map-line-anchor
　→ CoW AMM · sDAI/EVRO

## map-line-bridge
　→ Curve · EURe/EVRO

## map-line-reserve
　→ Reserve · operational buffer

## branch-title
Branch Allocation

## branch-pie-caption
Allocation mix

## branch-hint
Set allocation with the chart sliders (weights normalize to 100%). Posture sets CR and buffer; adjust interest rate per branch in the table.

## weight-warning
Weights sum to {{pct}}% — values are normalized to 100%.

## l2-card-title
Liquidity Pool Allocation — Layer 2

## l2-card-hint
Shares below match the Layer 2 split next to the replay chart (sliders normalize to 100%).

## col-branch
Branch

## col-weight
Weight

## col-capital
Capital

## col-cr
CR

## col-minted
Minted

## col-rate
Rate

## col-interest
Interest/yr

## col-buffer
Buffer

## l2-col-destination
Destination

## l2-col-pair
Pair / Venue

## l2-col-evro
EVRO

## l2-col-pct
% Minted

## l2-col-role
Role

## prose-p1
If **{{clientName}}** had deployed **{{capital}}** into EVRO one year ago with a **{{posture}}** posture, the capital would have been split across {{branchCount}} collateral branches — {{branchListWithWeights}} — weighted exactly as set here.

## prose-p2
And that unlocked **{{minted}}** EVRO — but borrowing isn't free. At an average rate of **{{blendedRate}}%** per year, **{{clientName}}** pays **{{totalInterest}}/yr** in interest to keep those Troves open.

## prose-p3
Where does that interest go? For this simulation, we're assuming the DAO voted the router **{{clientName}}'s** way: **{{spShare}}/yr** flows to Stability Pool stakers at **{{spApr}}% APR** — and since **{{clientName}}** has EVRO in the Stability Pool, a share of that comes right back. **{{daoShare}}/yr** goes to the EVRO DAO. In reality, that split is decided by governance.

## prose-p4-static
The **{{minted}}** EVRO didn't sit still. **{{spEuro}}** ({{spPct}}%) went into the Stability Pool — the liquidation backstop that also earns the 75% interest cut. **{{anchorEuro}}** ({{anchorPct}}%) went into the CoW AMM sDAI/EVRO Anchor Pool. **{{bridgeEuro}}** ({{bridgePct}}%) went into the Curve EURe/EVRO Bridge Pool for retail routing.

## prose-reserve-low
The remaining **{{reserveEuro}}** was kept minimal — almost everything was put to work immediately.

## prose-reserve-mid
The remaining **{{reserveEuro}}** became available for rebalancing, funding protocol and business development, and seeding new liquidity venues as they come online.

## prose-reserve-high
A meaningful **{{reserveEuro}}** was held back — deliberately conservative, prioritising optionality and the ability to seed new venues over full immediate deployment.

## prose-p5
Over the year, four things earned money simultaneously. The Stability Pool returned **{{spYield}}** from borrowing interest and liquidation gains. The collateral itself earned **{{collateralYield}}** — {{collateralSources}}. The CoW AMM Anchor Pool captured **{{cowYield}}** in batch-auction surplus that would have leaked to arb-bots on any other venue. And **{{redirectYield}}** came back through the interest router as extra incentive for liquidity provision.

## prose-p6
Add it up: **{{lpTotal}}** cumulative to **{{clientName}}** as liquidity provider — **{{apy}}% annualised**. The protocol took **{{daoRevenue}}** for the DAO treasury. Net to **{{clientName}}**: **+{{netLp}}**.



---

# layer2

## title
The Liquidity Architecture

## body
Minted EVRO is deployed into three venues forming a hub-and-spoke backstop. Each venue serves a distinct structural role.

## sp-title
Stability Pool

## sp-venue
EVRO Protocol

## sp-desc
The protocol's liquidation backstop and primary yield source. Earns 75% of all Trove interest income plus discounted collateral from liquidation events. This is the economic engine of the protocol.

## anchor-title
Anchor Pool

## anchor-pair
sDAI/EVRO

## anchor-venue
CoW AMM

## anchor-desc
Primary market depth and price discovery. LVR-protected via FM-AMM batch settlement — no value extracted by arb-bots. Arbitrage surplus is captured by the solver network and returned directly to LPs.

## bridge-title
Bridge Pool

## bridge-pair
EURe/EVRO

## bridge-venue
Curve StableSwap

## bridge-desc
Retail spend routing. Enables direct EURe ↔ EVRO swaps for downstream applications including Gnosis Pay integration paths. Curve lacks native MEV protection, so this venue is size-capped as a controlled cost-center.

## balancer-title
Why CoW AMM?

## balancer-body
CoW AMM is the native FM-AMM implementation from CoW Protocol. Solvers compete in batch auctions to rebalance the pool — the arbitrage surplus that would otherwise go to bots is returned directly to LPs. No third-party protocol fee, no Balancer governance dependency. For a stablecoin pair like sDAI/EVRO with no existing depth, it is the structurally cleanest venue: LVR protection without wrapper overhead.

## curve-title
Why Curve for the Bridge?

## curve-body
Curve lacks native MEV protection, meaning arb-bots extract value from the pool. By capping the allocation, this bleed is contained as a fixed cost-center — the price of enabling EURe/EVRO retail swap routing on Gnosis Chain.

## sp-table-role
Liquidation backstop · earns 75% of all Trove interest

## anchor-table-role
FM-AMM primary depth · LVR surplus returned to LPs

## bridge-table-role
EURe ↔ EVRO retail routing · size-capped cost-center

## reserve-title
Reserve

## reserve-venue
Operational buffer

## reserve-table-role
Held undeployed · available for rebalancing or new venues

---

# cohorts

## title
Who Benefits from EVRO?

## body
Three user profiles drive demand, each with a different conviction level and timeline.

## cohort-1-title
Borrowers Seeking Better Rates

## cohort-1-conviction
Highest Conviction

## cohort-1-body
Borrowers on Gnosis Chain currently pay interest rates well above what EVRO Troves offer. The gap is wider than the headline rate suggests — MEV extraction on unprotected venues adds hidden cost that doesn't show up in the UI.

Migrating to an EVRO Trove gives borrowers three things: they set their own interest rate, their liquidity is MEV-protected, and each position is isolated in its own branch.

Partnership conversations are active with growth agencies and infrastructure protocols to build the borrower pipeline. Contango — a looping layer on Gnosis Chain — can create leveraged EVRO positions once the protocol is listed on native money markets, adding a self-reinforcing demand channel.

## cohort-2-title
DAO Treasuries

## cohort-2-conviction
High Conviction

## cohort-2-body
DAOs holding idle wstETH or GNO can lock it as collateral, mint EVRO, and earn yield without changing their asset conviction. The question is whether the yield premium justifies adding another protocol to the stack.

The sharpest case is GnosisDAO itself. The DAO lost ~$700k in legacy Balancer v2 pools due to oracle lag and LVR extraction — those pools now sit at $0 TVL. EVRO's Anchor Pool is the direct upgrade to the infrastructure that failed.

Beyond GnosisDAO, Lido DAO has substantial idle wstETH on Gnosis Chain. Smaller ecosystem DAOs (Cow Protocol, Hopr, Gnosis Guild) run lean teams — EVRO's set-and-forget design fits their operational profile.

If GnosisDAO deploys into the Anchor Pool, that becomes the reference case for every other DAO. Phase 1 needs to be operational first. The track record is the reference.

## cohort-3-title
Retail Spending via Gnosis Pay

## cohort-3-conviction
Long-Term

## cohort-3-body
This is not theoretical. [Zeal](https://www.zeal.app/) already connects Aave yield to Gnosis Pay spending — earn yield in DeFi, auto-swap to fiat when you tap your card. The infrastructure exists and is live.

EVRO would be the European version. Instead of earning USD-denominated Aave yield, users earn Euro-denominated Stability Pool yield and spend in Euros. The user never holds idle EURe.

---

# growth

## title
A Path to Multiplying TVL

## body
Four phases from Genesis deployment to ecosystem scale. Each phase unlocks the next.

## phase-1-title
The Infrastructure

## phase-1-target
€5M

## phase-1-desc
GnosisDAO seed capital launches the protocol and the EVRO DAO. This deployment is the unlock — every phase that follows depends on this infrastructure being live and earning.

*This is what's happening now.*

## phase-2-title
Organic Migration

## phase-2-target
€10–15M

## phase-2-desc
LPs on legacy venues realize they're being extracted by bots. EVRO offers what they can't get elsewhere: real yield, rate sovereignty, and MEV protection.

*The team: BD with extracted LPs, money market listings, partnership pipeline.*

## phase-3-title
Treasury Adoption

## phase-3-target
€15–20M

## phase-3-desc
The track record exists. DAOs evaluate real performance, not a whitepaper. Treasury capital enters for yield without changing asset conviction.

*The team: performance reports, GIP proposals, treasury committee outreach.*

## phase-4-title
Ecosystem Integration

## phase-4-target
€20–25M+

## phase-4-desc
EVRO becomes core Euro infrastructure on Gnosis. Protocols build around it. Retail spend routes through it.

*The team: ecosystem support, open-source tooling, community integrations.*

---

# governance

## title
Post-Launch Governance Roadmap

## body
The 75/25 fee split is immutable. The DAO governs how the 25% is deployed. These are the moves planned post-launch.

## move-1-title
interestRouter Activation

## move-1-desc
First DAO proposal post-launch. Defines the initial allocation of the 25% revenue stream — LP incentives, ecosystem partnerships, and growth initiatives.

## move-2-title
Aave / SparkLend Listing

## move-2-desc
Submit an EVRO listing proposal on Gnosis-native money markets. Once listed, leveraged demand channels activate — creating amplified borrowing demand.

## move-3-title
veRETVRN Design Finalization

## move-3-desc
Lock duration, decay curve, minimum lock, and boost mechanics. This transforms RETVRN from a governance token into a vote-escrow instrument that directs the revenue stream.

## move-4-title
Stakeholder Reporting Cadence

## move-4-desc
Joint execution status reporting — protocol health, DAO initiative transparency, and treasury performance. Transparency is not a feature; it is the operating standard.

## move-5-title
Alpha Growth Partnership

## move-5-desc
Formalize the borrower acquisition pipeline with Alpha Growth. Conversations with the team are active — scope covers LP outreach, protocol integrations, and growth campaign execution on Gnosis Chain.

## move-6-title
Contango Integration

## move-6-desc
Pursue Contango integration for leveraged EVRO positions. Conversations with the founding team are active — contingent on EVRO listing on a Gnosis-native money market (see Move 2).

## architecture-body
The governance architecture is layered: the EVRO Protocol enforces the immutable 75/25 split. The EVRO DAO (Moloch v3 / Baal on Gnosis Chain) allocates the 25% stream through proposals. RaidGuild (30% RETVRN) and GnosisDAO (15% RETVRN) are day-one governance participants. The remaining 55% sits in the DAO treasury for progressive distribution to aligned stakeholders.

---

# cta

## title
Let's talk.

## body
The infrastructure is built. The capital plan is modeled. The next step is a conversation.

## button
Schedule a Call with the Team

## link
https://calendar.app.google/otE3KDr2rpppKGs39

---

# footer

## line1
EVRO Genesis · Capital Deployment Guide · V5 · March 2026

## line2
Prepared for GnosisDAO · IDE-Assisted Research · Harness 3.5

## line3
This document is governed by the Mandate of Inquiry. Every allocation, yield claim, and venue selection is traceable to an empirical anchor or an explicitly stated assumption. This is not financial advice.
