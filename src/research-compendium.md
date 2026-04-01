# EVRO Capital Deployment — Research Compendium

**Mission:** evro-gnosis-deployment
**Role:** research (reference)
**Status:** draft
**Audience:** GnosisDAO stakeholders, NOCA, external reviewers
**Date:** 2026-04-01

---

## About this document

This compendium collects and presents the research basis for the EVRO capital deployment plan. It is designed for stakeholders who want to review data sources, protocol mechanics, market context, and the assumptions underlying the plan — without commentary on what should be done with the information.

All findings are attributed to their sources. Retrieval dates are noted. Where information is inferred rather than directly sourced, it is labeled.

**Scope:** Protocol architecture, security audits, liquidity infrastructure, Gnosis ecosystem context, governance structures, market data, empirical venue performance, partnered protocols, and source methodology.

**Out of scope:** Strategic recommendations, internal assessments, risk tolerance decisions, stakeholder positioning.

---

## Table of contents

1. [EVRO protocol overview](#1-evro-protocol-overview)
2. [Protocol mechanics](#2-protocol-mechanics)
3. [Collateral branches](#3-collateral-branches)
4. [Fee structure](#4-fee-structure)
5. [Security audit status](#5-security-audit-status)
6. [Gnosis Chain — deployment environment](#6-gnosis-chain--deployment-environment)
7. [Liquidity infrastructure — Balancer v3 + CoW Hooks](#7-liquidity-infrastructure--balancer-v3--cow-hooks)
8. [CoW Protocol & LVR protection](#8-cow-protocol--lvr-protection)
9. [Curve StableSwap — Bridge venue](#9-curve-stableswap--bridge-venue)
10. [Empirical venue comparison](#10-empirical-venue-comparison)
11. [EURe (Monerium) — paired asset](#11-eure-monerium--paired-asset)
12. [Euro stablecoin landscape](#12-euro-stablecoin-landscape)
13. [GnosisDAO & treasury governance](#13-gnosisdao--treasury-governance)
14. [EVRO DAO governance](#14-evro-dao-governance)
15. [Contango Protocol](#15-contango-protocol)
16. [Alpha Growth](#16-alpha-growth)
17. [Zeal & Gnosis Pay](#17-zeal--gnosis-pay)
18. [Terminology](#18-terminology)
19. [Sources and methodology](#19-sources-and-methodology)

---

## 1. EVRO protocol overview

EVRO is a decentralized euro-pegged stablecoin built as a Liquity v2 fork on Gnosis Chain. It creates stable Euros via collateralized debt positions (CDPs) codified into transferable NFTs (ERC-721 Troves). The protocol supports 6 collateral branches and follows Liquity v2's immutable, no-governance design — except for a minimal governance layer (EVRO DAO, Moloch v3) that directs 25% of protocol revenue to external initiatives.

| Property | Value | Source |
|----------|-------|--------|
| Protocol | evro.finance | [R: evro.finance] |
| Codebase | github.com/evro-finance/evro | [R: GitHub] |
| Fork of | NeriteOrg/liquity2-template (Liquity v2) | [R: GitHub README] |
| Chain | Gnosis Chain (chain ID 100) | [P: deployment spec] |
| Status (Apr 2026) | Pre-launch, zero TVL | [P: project context] |
| Licensing | Liquity v2 licensed friendly fork | [R: liquity.org/forks] |
| Contracts | Immutable, no admin keys | [R: Liquity v2 docs] |

EVRO is listed on Liquity's official forks page as a licensed friendly fork. The codebase is public and open-source.

[R: docs.liquity.org; R: github.com/evro-finance/evro; R: liquity.org/forks]

---

## 2. Protocol mechanics

EVRO inherits the full Liquity v2 architecture.

### Collateralized debt positions (Troves)

Users deposit collateral into a **Trove** and mint EVRO (euro-pegged stablecoin) against it. Each Trove is an ERC-721 NFT — transferable, composable, and individually identifiable on-chain. Multiple troves per address are supported.

**User-set interest rates:** Borrowers choose their own interest rate within protocol constraints. Higher rates improve position in the redemption queue (redeemed last); lower rates are cheaper but carry higher redemption risk. Interest accrues continuously and feeds the fee distribution system.

[R: docs.liquity.org; R: GitHub evro-finance/evro]

### Stability Pool

The Stability Pool (SP) is where EVRO holders deposit tokens to absorb liquidations. SP depositors earn:

1. **Liquidation gains** — collateral from liquidated troves, acquired at a discount.
2. **Protocol interest** — 75% of all borrowing interest flows to SP depositors (immutable, in code).

SP deposits must use the `provideToSP` function. Direct token transfer to the SP contract does not credit the deposit.

[R: docs.liquity.org; P: deployment spec]

### Redemptions

EVRO holders can redeem tokens 1:1 against collateral. Redemptions target troves with the **lowest interest rates first** (rate-based ordering). This mechanism protects the peg from below by creating arbitrage incentives when EVRO trades under par.

[R: docs.liquity.org]

### Safety parameters

| Parameter | Full name | Purpose |
|-----------|-----------|---------|
| MCR | Minimum Collateralization Ratio | Minimum collateral ratio per trove; below MCR → liquidation |
| CCR | Critical Collateralization Ratio | System-wide threshold; below CCR → system enters special mode |
| SCR | System Collateralization Ratio | Used in certain redemption and fee calculations |

Liquity v2 removes Recovery Mode (present in v1). Liquidation mechanics are simplified compared to v1.

[R: docs.liquity.org]

### Protocol-Incentivized Liquidity (PIL)

25% of protocol revenue is directed to external initiatives via minimal governance. In EVRO, the EVRO DAO (Moloch v3) directs the 25% interestRouter allocation.

[R: docs.liquity.org; P: deployment spec]

### Gas supplement

Each trove on Gnosis Chain receives a 3.5 WXDAI gas supplement for operational costs. This was calibrated during auditing (see §5) after the original Ethereum-era value was found inadequate for Gnosis Chain's xDAI gas token.

[P: deployment spec; R: Sherlock Audit 1, H-3]

---

## 3. Collateral branches

EVRO supports 6 collateral branches. Each branch is an isolated collateral universe sharing the EVRO liability and global system rules.

| Branch | Asset | Type | Notes |
|--------|-------|------|-------|
| 1 | WXDAI | Wrapped native stablecoin | Native stable on Gnosis Chain; routing anchor |
| 2 | GNO | Gnosis governance token | Ecosystem governance asset |
| 3 | sDAI | Savings DAI (yield-bearing) | Accrues DSR yield (~4.5% APR, March 2026) |
| 4 | wWBTC | Wrapped Bitcoin | Bitcoin exposure via wrapper |
| 5 | osGNO | Staked GNO (liquid staking) | Gnosis Chain validator yield |
| 6 | wstETH | Wrapped staked ETH | Lido staking yield (~3.5–4% APR) |

Each branch has independent oracle inputs, liquidation parameters, and shutdown semantics. A collateral crash in one branch cannot trigger liquidation in another.

[P: deployment spec §3; R: Sherlock Audit 1 — scope included price feeds for all 6 branches]

---

## 4. Fee structure

The borrowing interest fee split is **fixed in the smart contract code** and cannot be changed by governance or any admin key.

| Recipient | Share | Mechanism |
|-----------|-------|-----------|
| Stability Pool depositors | 75% | Protocol interest routed directly to SP |
| interestRouter (EVRO DAO) | 25% | Routed to EVRO DAO treasury; governance can allocate via proposals |

Governance can direct the 25% interestRouter allocation. Governance **cannot** change the 75/25 ratio.

```
Borrowing interest (100%)
  ├── 75% → Stability Pool (immutable, in code)
  └── 25% → interestRouter → EVRO DAO (Moloch v3)
                                └── DAO proposal (member vote)
                                      └── Allocate funds
```

[P: deployment spec; R: Liquity v2 docs]

---

## 5. Security audit status

EVRO has been audited by **Sherlock** in two collaborative audits. Both audits cover EVRO-specific modifications to the Liquity v2 codebase.

### Audit 1 — Main protocol

| Property | Value |
|----------|-------|
| Engagement | December 26–30, 2025 |
| Published | January 18, 2026 |
| Lead reviewers | 0x37, 0x73696d616f |
| Scope | CoGNO, price feeds (GNO, sDAI, wBTC, wETH, wstETH, osGNO), WBTCWrapper, TroveNFT, WBTCZapper, Curve exchange integration |

| Severity | Found | Status |
|----------|-------|--------|
| High | 3 | All resolved |
| Medium | 5 | All resolved |
| Low/Info | 3 | All resolved |

**High findings (all resolved):**

| ID | Issue | Description |
|----|-------|-------------|
| H-1 | sDAI donation attack | SDAIPriceFeed used manipulatable vault rate. Fix: use min/max of oracle vs instantaneous rate. |
| H-2 | wstETH USD/EUR mismatch | On stETH-USD oracle failure, the fallback returned USD prices instead of EUR. Fix: EUR conversion added to fallback path. |
| H-3 | Liquidation gas compensation | ETH_GAS_COMPENSATION was 0.0375 ETH (designed for Ethereum mainnet). On Gnosis Chain with xDAI, this equals ~$0.04 — insufficient. Fix: adjusted to 3.5 WXDAI for xDAI economics. |

**Report:** [Sherlock Audit Report — Jan 18, 2026](https://sherlock-files.ams3.digitaloceanspaces.com/reports/2026.01.18%20-%20Final%20-%20Evro%20Finance%20Collaborative%20Audit%20Report%201768704551.pdf)

### Audit 2 — Collateral addition capability

| Property | Value |
|----------|-------|
| Engagement | March 2–4, 2026 |
| Published | March 7, 2026 |
| Lead reviewer | 0x73696d616f |
| Scope | CollateralRegistry, EvroToken, ICollateralRegistry, IEvroToken, deployment scripts, tests |

| Severity | Found | Status |
|----------|-------|--------|
| High | 0 | — |
| Medium | 0 | — |
| Low/Info | 4 | All resolved or acknowledged |

Clean audit. The collateral addition mechanism (adding new branches post-deployment) is sound.

**Report:** [Sherlock Audit Report — Mar 7, 2026](https://sherlock-files.ams3.digitaloceanspaces.com/reports/2026.03.07%20-%20Final%20-%20Evro%20Finance%20Collaborative%20Audit%20Report%201772848761.pdf)

---

## 6. Gnosis Chain — deployment environment

| Property | Value | Source |
|----------|-------|--------|
| Type | EVM-compatible L1 (formerly xDai Chain) | [R: docs.gnosischain.com] |
| Chain ID | 100 | [R: docs.gnosischain.com] |
| Native token | xDAI (bridged DAI) | [R: docs.gnosischain.com] |
| Consensus | Beacon Chain (proof-of-stake, GNO staking) | [R: docs.gnosischain.com] |
| Block time | ~5 seconds | [R: docs.gnosischain.com] |
| Gas costs | Fractions of a cent in xDAI | [R: docs.gnosischain.com] |
| Validators | 200k+ nodes | [R: docs.gnosischain.com] |
| MEV protection | Shutter (encrypted transactions) | [R: docs.gnosischain.com] |

### Relevance for EVRO deployment

- Low gas costs suit frequent DeFi operations (trove management, SP deposits, swaps).
- EVM compatibility means Liquity v2 contracts deploy with minimal modification.
- Established DeFi ecosystem (Balancer v3, CoW Protocol, Aave v3, Gnosis Safe, bridges).
- Shutter MEV protection may benefit EVRO swap operations.

[R: docs.gnosischain.com]

---

## 7. Liquidity infrastructure — Balancer v3 + CoW Hooks

### Balancer v3 architecture

Launched December 12, 2024 on Gnosis (alongside Ethereum).

| Layer | Role |
|-------|------|
| **Vault** | Central contract — handles all liquidity accounting and token balances |
| **Pool** | Defines the mathematical invariant (weighted, stable, boosted, custom) |
| **Router** | Interface for users executing swaps |

**Hooks** = standalone smart contracts injecting logic at pool lifecycle stages. **Immutable once a pool is registered.**

| Hook point | What it enables |
|------------|-----------------|
| `onBeforeSwap` / `onAfterSwap` | Pre/post-swap logic — oracle updates, circuit breakers |
| `onComputeDynamicSwapFeePercentage` | Oracle-aware dynamic fees |
| `onBeforeAddLiquidity` / `onAfterAddLiquidity` | LP deposit rules |
| `onBeforeRemoveLiquidity` | Withdrawal conditions |

[R: docs.balancer.fi; R: balancer.fi/v3]

### CoW AMM on Balancer v3 (via Hooks)

Partnership formalized May/June 2024. CoW DAO granted privileged access to the Balancer v3 Vault for designated pool addresses. These pools participate in CoW Protocol's solver competition — arbitrage surplus returned to LPs.

**Hooks are immutable on-chain** — LVR protection in existing v3 pools cannot be removed by Balancer Labs or its wind-down.

[R: cow.fi; R: balancer.fi; R: bible-balancer-v3-cow-amm.md]

### Balancer v3 on Gnosis Chain

| Metric | Value | Source |
|--------|-------|--------|
| TVL (March 2026) | $3.36M | [R: DefiLlama] |
| First live pool | aGNO/sDAI boosted pool (Dec 6, 2024) | [R: DefiLlama] |
| Gnosis support | Confirmed as one of four chains under OpCo | [R: Balancer governance forum] |

### Boosted Pools

Balancer v3's core innovation beyond v2. Boosted pools hold **yield-bearing tokens** (Aave aTokens) instead of raw assets. Both sides of the pool continuously accrue lending yield with zero idle capital.

**Example — aGNO/sDAI pool (live Dec 6, 2024 on Gnosis):**
- aGNO contract: `0xA1Fa064A85266E2Ca82DEe5C5CcEC84DF445760e`
- To obtain aGNO: deposit GNO on Aave v3 Gnosis Market.

[R: DefiLlama; R: Aave Gnosis Market]

### Balancer Labs wind-down and BAL emissions

The November 3, 2025 exploit targeted Balancer **v2** ComposableStablePool (`_upscaleArray` rounding error). $128.64M drained. **Balancer v3 was unaffected.**

Corporate wind-down (March 2026): Balancer Labs transitioning to "Balancer OpCo." Four chains confirmed for continued support: Ethereum, Arbitrum, Base, **Gnosis**.

**BAL emissions halted.** Governance voted to terminate all BAL token emissions. The veBAL locking program is being phased out. The "circular bribe economy that costs more than it generates" was cited as the reason.

**Impact:** veBAL gauge incentives are no longer available. Bribe markets (Hidden Hand, Paladin) for directing BAL emissions are defunct. This does not affect deployed v3 Hooks or pool functionality.

[R: Balancer governance forum; R: dlnews.com; R: cryptorank.io]

---

## 8. CoW Protocol & LVR protection

### The problem: LVR (Loss-Versus-Rebalancing)

LVR represents the structural cost to LPs in standard AMM designs (Uniswap, Balancer v2, Curve). As external market prices move, arbitrageurs trade against the AMM's stale pricing, extracting the spread.

**Gnosis Chain precedent:** In the Karpatkey era, oracle lag (up to 3 hours) on a Balancer v2 EURe/sDAI pool led to extraction of ~$700k during a depeg event.

[R: GIP-143 forum post; R: Protos reporting]

### CoW AMM mechanics (FM-AMM)

FM-AMM = **Function-Maximizing AMM** (Milionis, Roughgarden, Tsereteli — same authors as the LVR paper, arXiv:2208.06046).

1. **Batching:** Trades are bundled into discrete time intervals.
2. **Solver competition:** Independent relayers compete to find the best uniform clearing price for the batch.
3. **Surplus capture:** Arbitrage spread returned directly to LPs, increasing pool value.

| Component | Detail |
|-----------|--------|
| App | swap.cow.fi |
| Docs | docs.cow.fi |
| CoW AMM specs | github.com/cowprotocol/cow-amm |
| Factory address (Gnosis) | `0x703Bd8115E6F21a37BB5Df97f78614ca72Ad7624` |
| TVL on Gnosis (March 2026) | $741,977 |

[R: cow.fi; R: docs.cow.fi; R: DefiLlama]

### Two distinct CoW AMM implementations

| Implementation | Dependency | LVR Protection |
|----------------|------------|----------------|
| CoW AMM Standalone | Independent of Balancer | Native FM-AMM batch auction |
| CoW AMM on Balancer v3 (via Hooks) | Balancer v3 Vault | CoW solver access to Vault; surplus to LPs |

[R: bible-balancer-v3-cow-amm.md; R: bible-cow-amm-lvr.md]

---

## 9. Curve StableSwap — Bridge venue

Curve Finance operates on Gnosis Chain as the primary stablecoin swap venue.

| Metric | Value | Source |
|--------|-------|--------|
| eureusd pool TVL | $234,316 | [R: DefiLlama, March 2026] |
| eureusd 24h volume | $151,890 | [R: DefiLlama, March 2026] |
| CrossCurve integration | Unifies >$2B global Curve liquidity cross-chain | [R: gnosischain.com] |

**LVR exposure:** Curve pools are standard CF-AMMs. StableSwap amplification increases LVR risk on stable pairs — high concentration means arbitrage bots can extract value on small deviations.

**Gnosis Pay path:** EURe is natively liquid on Curve eureusd — the settlement venue for Gnosis Pay card swipes. This is the structural reason to maintain a Curve position despite LVR exposure.

[R: DefiLlama; R: bible-gnosis-dex-venues.md]

---

## 10. Empirical venue comparison

181 days of Gnosis Chain block-level settlement data via HyperSync ingestion (March 2026).

| Scenario | Venue | Base Yield | Net Fee + LVR Capture | Net Annualized Return |
|----------|-------|------------|----------------------|----------------------|
| **A (Winner)** | **CoW AMM (sDAI/EVRO)** | 4.2% (sDAI) | +24.42% | **28.62%** |
| B (Loser) | Curve (EURe/EURC.e) | 0% | -0.59% | **-0.59%** |
| C (Strong) | Balancer v3 + Hooks | — | +13.28% | **26.62%** |

**Conclusion:** Standard AMMs (Curve) on Gnosis Chain operate at a net loss for euro pairs due to arbitrage extraction exceeding organic fees. CoW AMM internalizes this leakage.

[P: empirical-venue-comparison-march-2026.md; R: HyperSync block data]

---

## 11. EURe (Monerium) — paired asset

EURe is an ERC-20 compatible e-money token (EMT) issued by **Monerium EMI ehf.**, regulated by the Central Bank of Iceland.

| Property | Value | Source |
|----------|-------|--------|
| Issuer | Monerium EMI ehf. | [R: monerium.com] |
| Regulation | MiCA-compliant e-money | [R: monerium.com/whitepaper/eure] |
| Redemption | 1:1 for fiat Euro via IBAN | [R: monerium.com] |
| Contract (v1, legacy) | `0xcB444e90D8198415266c6a2724b7900fb12FC56E` | [R: GnosisScan] |
| Contract (v2, canonical) | `0x420CA0f9B9b604cE0fd9C18EF134C705e5Fa3430` | [R: GnosisScan] |
| FDV | ~$21.6M | [R: CoinMarketCap, March 2026] |
| Gnosis DEX liquidity | ~$7K (indexed pools) | [R: CoinMarketCap DEXScan] |
| Aave v3 Gnosis (lending) | 19.14M supplied / 15.08M borrowed | [R: Aave Gnosis Market] |
| Lending APY | ~3.15% supply / ~4.47% borrow | [R: Aave Gnosis Market] |
| Native yield | 0% | [R: monerium.com] |

**Observation:** EURe DEX liquidity on Gnosis (~$7K) is thin relative to the intended pool scale. The EVRO/EURe pool would become the primary source of on-chain euro swap liquidity. Viability depends on Monerium's issuer-level mint/redeem capacity.

[R: monerium.com; R: CoinMarketCap; R: GnosisScan; R: Aave — retrieved March 2026]

---

## 12. Euro stablecoin landscape

| Stablecoin | Type | Gnosis Chain Status | Notes |
|------------|------|---------------------|-------|
| **EVRO** | Decentralized CDP (Liquity v2 fork) | Pre-launch | Subject of this compendium |
| **EURe** | Regulated e-money (MiCA, Monerium) | Live (~$22M lending) | Gnosis Pay settlement layer |
| **EURC.e** | Bridged Circle EURC (Omnibridge) | ~$678K market cap | Not natively deployed on Gnosis |
| **EURS** | Regulated e-money (Stasis) | Low / Emerging | Longest track record |
| **agEUR / EURA** | Decentralized CDP (Angle Protocol) | **Winding down** | See below |

### Angle Protocol wind-down

| Metric | Value | Source |
|--------|-------|--------|
| Governance vote | AIP-112 passed | [R: angle.money] |
| EURA peak supply | >$180M (late 2021) | [R: dlnews.com] |
| EURA supply at wind-down | <$4M | [R: angle.money] |
| Cause | Economic — Circle EURC surpassed EURA; yield-bearing vaults made Angle obsolete | [R: dlnews.com] |
| MiCA involvement | **Not cited as a cause** | [R: angle.money] |
| Team pivot | Full transition to **Merkl** (incentive distribution platform) | [R: angle.money] |
| Redemption deadline | March 1, 2027 (EURA → EURC 1:1 on Ethereum) | [R: angle.money] |

**Implication:** The decentralized euro CDP market is empty. EVRO enters with no living competitor.

[R: angle.money; R: dlnews.com; R: CoinMarketCap; R: gnosischain.com]

---

## 13. GnosisDAO & treasury governance

### GnosisDAO overview

| Property | Value | Source |
|----------|-------|--------|
| Founded | 2015 | [R: docs.gnosis.io] |
| Treasury value | >$175M | [R: GIP-143 reporting] |
| Governance token | GNO | [R: docs.gnosis.io] |
| Voting | Snapshot (snapshot.org/#/s:gnosis.eth) | [R: docs.gnosis.io] |
| Forum | forum.gnosis.io | [R: docs.gnosis.io] |

### GIP-143: Karpatkey termination (November 2025)

| Issue | Detail | Source |
|-------|--------|--------|
| Vote | 88% to terminate | [R: GIP-143 forum] |
| Fee structure | 1% AUM + 20% yield — "highly contentious" | [R: GIP-143 forum] |
| Underperformance | Below sUSDS, wstETH benchmarks | [R: GIP-143 forum] |
| Incident | EURe/sDAI Balancer v2 pool — ~$700k loss due to oracle lag (updated every 3 hours, not on weekends) | [R: Protos reporting] |

### GIP-148: NOCA mandate (early 2026)

| Property | Value | Source |
|----------|-------|--------|
| Entity | NOCA / Noctua | [R: GIP-148] |
| URL | https://no.ca | [R: no.ca] |
| Founder | Dave Montali (Gnosis ecosystem since 2021) | [R: GIP-148] |
| Selection | 75 voters, 157k+ GNO voting power, 49.7% first-choice | [R: GIP-148] |
| Fee waiver | Q1 2026 performance fees waived | [R: GIP-148] |

**NOCA Q1 2026 priorities:** Consolidate SAFE structure, simplify legacy positions, deploy idle capital into yield strategies, review Gnosis Chain liquidity, build public-facing treasury dashboard.

[R: forum.gnosis.io; R: snapshot.org; R: no.ca]

---

## 14. EVRO DAO governance

### Structure

| Property | Value |
|----------|-------|
| Framework | Moloch v3 (Baal) |
| Platform | DAOhaus |
| Chain | Gnosis Chain (chain ID 100) |
| Contract | `0x9cbfb8b2ac072ee554e0c96e1ec021b9eb8fef9d` |
| Admin | admin.daohaus.club |

### Moloch v3 mechanics

| Construct | Function |
|-----------|----------|
| **Membership shares** | Voting, execution, and exit (ragequit) rights. ERC-20. |
| **Loot shares** | Exit rights only. ERC-20. |
| **Shamans** | External smart contracts with granular DAO control. |
| **Flexible proposals** | Multi-send compatible; any smart contract interaction. |
| **Ragequit** | Members can exit and receive proportional treasury share. |
| **Treasury** | Sits on top of a Gnosis Safe multisig via Zodiac standards. |

### RETVRN token

| Property | Value |
|----------|-------|
| Total supply | 100,000,000 |
| RaidGuild allocation | 30% |
| GnosisDAO allocation | 15% |
| DAO treasury | 55% |
| Type | Governance token (not emissions) |

[P: deployment spec; R: DAOhaus; R: hackmd.io/@daohaus/V3Docs-Molochv3Overview]

---

## 15. Contango Protocol

Contango is a DeFi "looping layer" that automates recursive borrowing-and-lending strategies across established money markets into a single atomic transaction via flash loans.

| Property | Value | Source |
|----------|-------|--------|
| Founded | 2021 | [R: contango.xyz] |
| Founders | Bruno Bonanno, Egill Hreinsson, Kamel Aouane (CEO) | [R: contango.xyz] |
| Total raised | ~$4M (Seed) | [R: contango.xyz] |
| Lead investor | ParaFi Capital | [R: contango.xyz] |
| App | app.contango.xyz | [R: contango.xyz] |
| Docs | docs.contango.xyz | [R: docs.contango.xyz] |
| Gnosis Chain | Deployed, integrating with SparkLend and Aave v3 | [R: app.contango.xyz] |

### How looping works (atomic)

1. Flash loan the debt asset.
2. Swap user margin + flash-loaned capital for target collateral on a spot DEX.
3. Lend collateral on a money market (Aave, Spark).
4. Borrow the debt asset against the lent collateral.
5. Repay the flash loan.

All five steps execute atomically. Reversal follows the inverse sequence.

### Relevance to EVRO

Contango creates a **potential demand channel** for EVRO if listed as collateral or borrowable on a Gnosis-native money market:

- **Leverage Long EVRO/EURe:** Loop EVRO as collateral → borrow EURe → swap for EVRO → repeat.
- **Yield Amplification:** If Stability Pool yield exceeds borrow cost, looping becomes rational.

**Prerequisite:** EVRO must be listed on Aave v3 or SparkLend on Gnosis. Without that listing, Contango has zero direct relevance.

[R: contango.xyz; R: docs.contango.xyz; R: bible-contango-protocol.md]

---

## 16. Alpha Growth

Alpha Growth (alphagrowth.io) is a DeFi growth agency specializing in protocol scaling — ecosystem grants, liquidity bootstrapping, DAO governance proposals, and TVL growth via structured BD campaigns.

| Property | Value | Source |
|----------|-------|--------|
| Entity | AlphaGrowth | [R: alphagrowth.io] |
| HQ | San Francisco | [R: alphagrowth.io] |
| Notable clients | Compound | [R: alphagrowth.io] |
| Service model | Vendor (not capital deployer) | [R: intel-alpha-growth.md] |

### Relevance to EVRO

Potential BD partner for Phase II–III growth (Aave EURe borrower migration, institutional outreach). Not relevant for Phase I (mechanical deployment).

**AlphaGrowth does not bring capital.** They are a service provider compensated from DAO treasuries.

[R: alphagrowth.io; P: intel-alpha-growth.md]

---

## 17. Zeal & Gnosis Pay

### Gnosis Pay

Gnosis Pay is a crypto payment card integrated with the Gnosis ecosystem. EURe is the settlement currency — card swipes trigger an on-chain EURe transfer to the payment processor.

[R: gnosispay.com; R: docs.gnosischain.com]

### Zeal

Zeal (zeal.app) is a live product that connects Aave yield to Gnosis Pay spending. Users earn yield in DeFi and auto-swap to fiat when they tap their card.

**Relevance to EVRO:** EVRO would replicate this model in Euros — earn Euro-denominated Stability Pool yield, spend in Euros via Gnosis Pay. The infrastructure exists and is live through Zeal's implementation.

[R: zeal.app]

---

## 18. Terminology

| Term | Definition |
|------|-----------|
| **Trove** | A CDP in Liquity v2 / EVRO. ERC-721 NFT. |
| **CDP** | Collateralized Debt Position. Mechanism for minting stablecoins against collateral. |
| **Stability Pool (SP)** | Pool where stablecoin holders deposit to absorb liquidations. |
| **interestRouter** | Smart contract receiving 25% of protocol interest, routing to EVRO DAO. |
| **MCR** | Minimum Collateralization Ratio. Below → liquidation. |
| **CCR** | Critical Collateralization Ratio. System-wide safety threshold. |
| **Redemption** | 1:1 redemption against collateral. Targets lowest-rate troves first. |
| **Branch** | A collateral type within the protocol. EVRO has 6. |
| **FM-AMM** | Function-Maximizing AMM. Solver competition for clearing price. |
| **LVR** | Loss-Versus-Rebalancing. Structural cost to LPs from stale-price arbitrage. |
| **CoW AMM** | First production FM-AMM. Solver surplus returned to LPs. |
| **Hooks** | Balancer v3 smart contracts injecting logic at pool lifecycle stages. Immutable. |
| **Boosted Pool** | Balancer v3 pool holding yield-bearing tokens (e.g., Aave aTokens). |
| **veBAL** | Vote-escrow BAL. Governed Balancer gauge emissions. **Program being wound down.** |
| **Moloch v3 (Baal)** | DAO framework. Minimal, composable governance on Gnosis Safe. |
| **Ragequit** | Mechanism allowing DAO members to exit with proportional treasury share. |
| **RETVRN** | EVRO governance token. Fixed supply. Not an emissions token. |
| **PIL** | Protocol-Incentivized Liquidity. The 25% interestRouter stream. |
| **GIP** | Gnosis Improvement Proposal. |
| **NOCA / Noctua** | GnosisDAO treasury management operator (GIP-148). |
| **EURe** | Euro-pegged e-money stablecoin by Monerium. MiCA-compliant. |
| **Contango** | Looping layer protocol automating leveraged money market positions. |

---

## 19. Sources and methodology

### Source classification

| Code | Meaning |
|------|---------|
| **R** | Retrieved — fetched from public URL or documentation |
| **P** | Provided — supplied directly (meeting summaries, specifications, project documentation) |
| **I** | Inferred — derived from available evidence; labeled where used |

### Primary sources

| Source | Type | URL or reference |
|--------|------|-----------------|
| Liquity v2 documentation | R | https://docs.liquity.org |
| Liquity v2 forks page | R | https://liquity.org/forks |
| GitHub evro-finance/evro | R | https://github.com/evro-finance/evro |
| Sherlock Audit Report 1 | R | [PDF — Jan 18, 2026](https://sherlock-files.ams3.digitaloceanspaces.com/reports/2026.01.18%20-%20Final%20-%20Evro%20Finance%20Collaborative%20Audit%20Report%201768704551.pdf) |
| Sherlock Audit Report 2 | R | [PDF — Mar 7, 2026](https://sherlock-files.ams3.digitaloceanspaces.com/reports/2026.03.07%20-%20Final%20-%20Evro%20Finance%20Collaborative%20Audit%20Report%201772848761.pdf) |

### Balancer v3 sources

| Source | URL |
|--------|-----|
| Balancer v3 docs | https://docs.balancer.fi |
| Balancer governance forum | https://forum.balancer.fi |

### CoW Protocol sources

| Source | URL |
|--------|-----|
| CoW Protocol docs | https://docs.cow.fi |
| CoW AMM specs | https://github.com/cowprotocol/cow-amm |
| CoW Protocol Dune | https://dune.com/cowprotocol/total |
| LVR paper | arXiv:2208.06046 |

### Gnosis ecosystem sources

| Source | URL |
|--------|-----|
| Gnosis DAO docs | https://docs.gnosis.io |
| Gnosis Chain docs | https://docs.gnosischain.com |
| Gnosis forum | https://forum.gnosis.io |
| Snapshot | https://snapshot.org/#/s:gnosis.eth |
| GIP-143 | forum.gnosis.io |
| GIP-148 | https://hackmd.io/@dave-3ac/BJpxZDW_bx |

### EVRO DAO sources

| Source | URL |
|--------|-----|
| EVRO DAO (admin) | https://admin.daohaus.club/#/molochv3/0x64/0x9cbfb8b2ac072ee554e0c96e1ec021b9eb8fef9d |
| Moloch v3 docs | https://moloch.daohaus.fun/ |
| Moloch v3 overview | https://hackmd.io/@daohaus/V3Docs-Molochv3Overview |

### Partner & protocol sources

| Source | URL |
|--------|-----|
| Monerium | https://monerium.com |
| Monerium EURe MiCA whitepaper | https://monerium.com/whitepaper/eure |
| Monerium Dune | https://dune.com/monerium/eure |
| Contango | https://contango.xyz |
| Contango docs | https://docs.contango.xyz |
| AlphaGrowth | https://alphagrowth.io |
| Zeal | https://zeal.app |
| Gnosis Pay | https://gnosispay.com |
| Angle Protocol | https://angle.money |

### Market data sources

| Source | Retrieval date |
|--------|---------------|
| DefiLlama (TVL data) | March 2026 |
| CoinMarketCap | March 2026 |
| GnosisScan | March 2026 |
| Aave Gnosis Market | March 2026 |
| HyperSync block-level data (181 days) | March 2026 |

---

*End of research compendium. This document is the stakeholder-facing reference for the evidentiary basis of the EVRO capital deployment plan.*
