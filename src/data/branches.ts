// ═══════════════════════════════════════════════════════════
// EVRO Genesis — Branch & Distribution Constants
// Canonical data from the finalized PRD
// ═══════════════════════════════════════════════════════════

export interface Branch {
  id: string;
  name: string;
  defaultWeight: number;
  defaultCR: number;
  minMCR: number;
  interestRate: number;
  color: string;
}

export const BRANCHES: Branch[] = [
  { id: 'sdai',   name: 'sDAI',   defaultWeight: 0.35, defaultCR: 1.55, minMCR: 1.30, interestRate: 0.035, color: '#A081F5' },
  { id: 'gno',    name: 'GNO',    defaultWeight: 0.20, defaultCR: 1.90, minMCR: 1.40, interestRate: 0.045, color: '#F5889B' },
  { id: 'wsteth', name: 'wstETH', defaultWeight: 0.15, defaultCR: 1.75, minMCR: 1.30, interestRate: 0.040, color: '#7176CA' },
  { id: 'wxdai',  name: 'wXDAI',  defaultWeight: 0.15, defaultCR: 1.25, minMCR: 1.10, interestRate: 0.030, color: '#9CB1F4' },
  { id: 'wbtc',   name: 'wBTC',   defaultWeight: 0.10, defaultCR: 1.90, minMCR: 1.15, interestRate: 0.050, color: '#EFA960' },
  { id: 'osgno',  name: 'osGNO',  defaultWeight: 0.05, defaultCR: 1.90, minMCR: 1.40, interestRate: 0.040, color: '#625E6B' },
];

export const DEFAULT_CAPITAL = 5_000_000;
export const SP_STAKER_SHARE = 0.75;
export const DAO_SHARE = 0.25;

// ── Genesis Layer 2 Allocations (fixed €-amounts per the plan) ──────────────
// Layer 2 deploys €1M → Stability Pool, €1M → Anchor Pool (Balancer v3 + CoW
// Hooks / sDAI/EVRO), €0.5M → Bridge Pool (Curve / EURe/EVRO). Whatever EVRO
// is minted beyond €2.5M is held as an operational reserve / deployment buffer.
// When totalMinted < FIXED_TOTAL_EUR (sub-genesis scale) ratios apply instead.
export const SP_FIXED_EUR     = 1_000_000;   // €1M
export const ANCHOR_FIXED_EUR = 1_000_000;   // €1M
export const BRIDGE_FIXED_EUR =   500_000;   // €0.5M
export const FIXED_TOTAL_EUR  = SP_FIXED_EUR + ANCHOR_FIXED_EUR + BRIDGE_FIXED_EUR; // €2.5M

/** Share of minted EVRO to each Layer 2 venue (sums to 1). Used by DeploymentPlan, yield replay, and distribution math. */
export const L2_MINTED_SHARE_SP = 0.35;
export const L2_MINTED_SHARE_ANCHOR = 0.35;
export const L2_MINTED_SHARE_BRIDGE = 0.18;
export const L2_MINTED_SHARE_RESERVE = 0.12;

/** User-controlled Layer 2 split (must sum to 1). Defaults match PRD constants above. */
export interface L2Shares {
  sp: number;
  anchor: number;
  bridge: number;
  reserve: number;
}

export const DEFAULT_L2_SHARES: L2Shares = {
  sp: L2_MINTED_SHARE_SP,
  anchor: L2_MINTED_SHARE_ANCHOR,
  bridge: L2_MINTED_SHARE_BRIDGE,
  reserve: L2_MINTED_SHARE_RESERVE,
};

/** L2 venue fills (EVRO brand secondaries) — hexes must not repeat any `BRANCHES[].color`. */
export const DISTRIBUTION_LABELS = [
  { id: 'sp',      name: 'Stability Pool', color: '#CDD6ED' },
  { id: 'anchor',  name: 'Anchor Pool',    color: '#A3C0D7' },
  { id: 'bridge',  name: 'Bridge Pool',    color: '#C6B8FA' },
  { id: 'reserve', name: 'NOCA Reserve',   color: '#F8A9B5' },
];

export interface BranchResult {
  id: string;
  name: string;
  color: string;
  allocatedCapital: number;
  minted: number;
  interestPaid: number;
  bufferHeadroom: number;
  interestRate: number;
}

export interface Calculations {
  totalMinted: number;
  totalInterestPaid: number;
  spYieldTotal: number;
  daoRevenueTotal: number;
  branchResults: BranchResult[];
  distribution: {
    sp: number;
    anchor: number;
    bridge: number;
    reserve: number;
  };
}

export function calculateDeployment(
  totalCapital: number,
  weights: Record<string, number>,
  crs: Record<string, number>,
  l2: L2Shares = DEFAULT_L2_SHARES,
): Calculations {
  let totalMinted = 0;
  let totalInterestPaid = 0;

  const branchResults: BranchResult[] = BRANCHES.map(branch => {
    const allocatedCapital = totalCapital * weights[branch.id];
    const minted = allocatedCapital / crs[branch.id];
    const interestPaid = minted * branch.interestRate;

    totalMinted += minted;
    totalInterestPaid += interestPaid;

    return {
      id: branch.id,
      name: branch.name,
      color: branch.color,
      allocatedCapital,
      minted,
      interestPaid,
      bufferHeadroom: crs[branch.id] - branch.minMCR,
      interestRate: branch.interestRate,
    };
  });

  const spYieldTotal = totalInterestPaid * SP_STAKER_SHARE;
  const daoRevenueTotal = totalInterestPaid * DAO_SHARE;

  const spAllocation     = totalMinted * l2.sp;
  const anchorAllocation = totalMinted * l2.anchor;
  const bridgeAllocation = totalMinted * l2.bridge;
  const reserve          = totalMinted * l2.reserve;

  return {
    totalMinted,
    totalInterestPaid,
    spYieldTotal,
    daoRevenueTotal,
    branchResults,
    distribution: {
      sp: spAllocation,
      anchor: anchorAllocation,
      bridge: bridgeAllocation,
      reserve,
    },
  };
}

export function fmt(val: number): string {
  return `€${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function fmtPct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

export function fmtCompact(val: number): string {
  if (val >= 1_000_000) return `€${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `€${(val / 1_000).toFixed(0)}k`;
  return `€${val.toFixed(0)}`;
}
