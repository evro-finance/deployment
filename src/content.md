# hero

## title
Deploy Into European **MEV-Protected** Yield Infrastructure

## subtitle
EVRO Genesis · Capital Deployment Guide

## body
EVRO is a CDP-issued Euro stablecoin on Gnosis Chain — asset-isolated minting, MEV-protected liquidity, real yield from day one. The architecture operates across two layers: **Layer 1 (Minting)** locks collateral across 6 isolated branches. **Layer 2 (Distribution)** deploys minted EVRO into 3 liquidity venues for market depth, peg stability, and swap routing.

## body2
This is a deployment guide with interactive dashboards to model your position.

## meta
Prepared for: GnosisDAO | Date: March 31, 2026 | Version: IDE-Assisted Final | Status: Ready for Submission Review

---

# problem

## title
European Capital On-Chain Is Dead Capital

## body
European capital on-chain is dead capital. EURe yields **0%**. USD stablecoin holders earn **4%+** through the DAI Savings Rate. The only other Euro CDP — Angle Protocol — is shutting down. The decentralized Euro CDP market will be empty.

## body2
EVRO fills this gap: a Euro stablecoin backed by real yield — sDAI earning the Savings Rate, wstETH earning staking rewards, GNO earning validator income — with MEV protection through batch auction settlement.

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
Historical replay: if Gnosis had deployed this capital on Apr 1 2025, these are the returns it would have generated over the following 365 days — using real on-chain data from BOLD Stability Pool APY, sDAI/wstETH ratios, GNO staking yields, and CoW AMM batch-auction settlement fees.

## cr-strategy

## rate-strategy

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
Balancer v3 + CoW Hooks

## anchor-desc
Primary market depth and price discovery. LVR-protected via batch settlement — no value extracted by arb-bots. Stacks lending yield on idle pool tranches, creating two yield sources in one venue.

## bridge-title
Bridge Pool

## bridge-pair
EURe/EVRO

## bridge-venue
Curve StableSwap

## bridge-desc
Retail spend routing. Enables direct EURe ↔ EVRO swaps for downstream applications including Gnosis Pay integration paths. Curve lacks native MEV protection, so this venue is size-capped as a controlled cost-center.

## balancer-title
Why Balancer v3 + CoW Hooks?

## balancer-body
Balancer v3 with CoW Hooks combines LVR protection with lending yield on idle pool tranches — two yield sources in one venue, unique on Gnosis Chain. The CoW Hooks are immutable on-chain contracts; the protection persists regardless of Balancer governance.

## curve-title
Why Curve for the Bridge?

## curve-body
Curve lacks native MEV protection, meaning arb-bots extract value from the pool. By capping the allocation, this bleed is contained as a fixed cost-center — the price of enabling EURe/EVRO retail swap routing on Gnosis Chain.

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
Batch settlement via CoW Hooks on the Anchor Pool.

## risk-4-title
Curve LVR Bleed

## risk-4-mitigation
Allocation capped to contain bleed as a controlled cost-center.

## risk-5-title
Oracle Lag

## risk-5-mitigation
CR buffers absorb moderate oracle lag.

## risk-6-title
FX Risk (EUR/USD)

## risk-6-mitigation
Stablecoin branches (sDAI, wXDAI) exposed to EUR/USD pricing. CR buffers absorb moderate FX moves.

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

## sp-note
The Stability Pool also functions as a counter-cyclical asset acquisition engine. When a Trove in any branch is liquidated, SP stakers absorb the debt and receive the liquidated collateral at a protocol discount. During market stress — precisely when other yield sources compress — the Stability Pool activates, capturing discounted GNO, wstETH, sDAI, and other collateral across all 6 branches. This is not a secondary benefit. It is the structural reason the Stability Pool outperforms during volatility.

## token-body
The governance token, **RETVRN**, has a fixed supply of **100,000,000** tokens distributed at launch across RaidGuild (30%), GnosisDAO (15%), and the DAO treasury (55%). RETVRN is not an emissions token. It is a governance token with revenue alignment. The name is the mandate: manage the interestRouter — the stream that turns deployed capital into sustained ecosystem depth.

## alignment
This design resolves a specific structural failure. Legacy protocol DAOs that earn from DEX trading fees are positively correlated with bot extraction volume — the DAO profits when LPs are harmed. EVRO's revenue comes from borrowing rates set by borrowers themselves. LP retention drives borrowing depth, which drives DAO revenue. The DAO is aligned with LP protection — not extraction. This is the incentive architecture that Angle's agEUR lacked when it collapsed from $180M to $4M in circulating supply.

## revenue-5m
At €5M deployed with a ~3.8% blended interest rate: annual interest income ~€190,000. Stability Pool share (75%): ~€142,500/yr. DAO treasury share (25%): ~€47,500/yr.

## revenue-25m
At €25M TVL (Phase 4 target), the 25% stream becomes ~€237,500/yr — a self-funding governance operation.

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
