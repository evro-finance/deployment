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
  { id: 'sdai',   name: 'sDAI',   defaultWeight: 0.35, defaultCR: 1.55, minMCR: 1.30, interestRate: 0.035, color: '#A082F5' },
  { id: 'gno',    name: 'GNO',    defaultWeight: 0.20, defaultCR: 1.90, minMCR: 1.40, interestRate: 0.045, color: '#F5889B' },
  { id: 'wsteth', name: 'wstETH', defaultWeight: 0.15, defaultCR: 1.75, minMCR: 1.30, interestRate: 0.040, color: '#7176CA' },
  { id: 'wxdai',  name: 'wXDAI',  defaultWeight: 0.15, defaultCR: 1.25, minMCR: 1.10, interestRate: 0.030, color: '#9CB1F4' },
  { id: 'wbtc',   name: 'wBTC',   defaultWeight: 0.10, defaultCR: 1.90, minMCR: 1.15, interestRate: 0.050, color: '#EFA960' },
  { id: 'osgno',  name: 'osGNO',  defaultWeight: 0.05, defaultCR: 1.90, minMCR: 1.40, interestRate: 0.040, color: '#625E6B' },
];

export const DEFAULT_CAPITAL = 5_000_000;
export const SP_STAKER_SHARE = 0.75;
export const DAO_SHARE = 0.25;

export const DISTRIBUTION_LABELS = [
  { id: 'sp',      name: 'Stability Pool', color: '#A082F5' },
  { id: 'anchor',  name: 'Anchor Pool',    color: '#7176CA' },
  { id: 'bridge',  name: 'Bridge Pool',    color: '#F5889B' },
  { id: 'reserve', name: 'NOCA Reserve',   color: '#EFA960' },
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
  crs: Record<string, number>
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

  // Distribution: proportional to total minted, not fixed
  const spRatio = 0.40;
  const anchorRatio = 0.40;
  const bridgeRatio = 0.20;

  const spAllocation = totalMinted * spRatio;
  const anchorAllocation = totalMinted * anchorRatio;
  const bridgeAllocation = totalMinted * bridgeRatio;
  const reserve = totalMinted - spAllocation - anchorAllocation - bridgeAllocation;

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
