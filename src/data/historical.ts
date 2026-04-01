// ═══════════════════════════════════════════════════════════
// Historical Data Loader — imports master_hrds_usd.json
// Maps raw asset keys to branch IDs used by the simulator
// ═══════════════════════════════════════════════════════════

import masterData from './historical/master_hrds_usd.json';
import eurUsdData from './historical/eur_usd_history.json';
import branchResults from './historical/6_branch_results.json';

export interface DayData {
  ts: number;
  price_usd: number;
  lvr_potential_percent: number;
  ohl_signature: { high: number; low: number };
  niche_metrics: { tvl_usd: number; velocity_usd: number };
  benchmark_yield: number;
  fx_rate: number;
}

// Map master asset keys → branch IDs used in branches.ts
const ASSET_TO_BRANCH: Record<string, string> = {
  sdai: 'sdai',
  gno: 'gno',
  wsteth: 'wsteth',
  xdai: 'wxdai',
  wbtc: 'wbtc',
  osgno: 'osgno',
};

export function getHistoricalPrices(): Record<string, DayData[]> {
  const mapped: Record<string, DayData[]> = {};
  const raw = masterData as Record<string, DayData[]>;

  for (const [assetKey, branchId] of Object.entries(ASSET_TO_BRANCH)) {
    if (raw[assetKey]) {
      mapped[branchId] = raw[assetKey];
    }
  }
  return mapped;
}

export function getEurUsdHistory(): [number, number][] {
  return eurUsdData as [number, number][];
}

export function getHodlDeltaResults() {
  return branchResults as Record<string, {
    name: string;
    hodlDelta: string;
    netReturn: string;
    rawNumbers: { activeValue: number; hodlValue: number; hodlDelta: number };
  }>;
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}
