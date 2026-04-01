// ═══════════════════════════════════════════════════════════
// Replay Engine — runs historical prices through the branch
// model to produce daily CR, yield, and stress data
// ═══════════════════════════════════════════════════════════

import { BRANCHES, SP_STAKER_SHARE, DAO_SHARE } from './branches';
import { getHistoricalPrices, type DayData } from './historical';

export interface DailySnapshot {
  ts: number;
  date: string;
  /** Per-branch state on this day */
  branches: BranchSnapshot[];
  /** Cumulative totals */
  cumulativeSpYield: number;
  cumulativeDaoRevenue: number;
  /** Aggregate CR (weighted by capital) */
  weightedCR: number;
  /** EUR/USD FX rate */
  fxRate: number;
}

export interface BranchSnapshot {
  id: string;
  name: string;
  color: string;
  /** Current CR based on real price movement */
  currentCR: number;
  /** Distance to liquidation (currentCR - minMCR) */
  bufferHeadroom: number;
  /** Was this branch in danger zone (< 15% headroom)? */
  inDanger: boolean;
  /** Price change from day 0 */
  priceChangePct: number;
  /** Daily LVR potential */
  lvrPercent: number;
}

export interface ReplayResult {
  snapshots: DailySnapshot[];
  /** Summary stats */
  totalDays: number;
  minCR: { branchId: string; value: number; date: string };
  maxDrawdown: { branchId: string; value: number; date: string };
  dangerDays: Record<string, number>;
  totalSpYield: number;
  totalDaoRevenue: number;
}

export function replayDeployment(
  totalCapital: number,
  weights: Record<string, number>,
  crs: Record<string, number>
): ReplayResult {
  const historicalPrices = getHistoricalPrices();
  const snapshots: DailySnapshot[] = [];

  // Find the branch with the most days as our timeline
  const maxDays = Math.max(
    ...Object.values(historicalPrices).map(d => d.length)
  );

  // Day-0 reference prices for each branch
  const day0Prices: Record<string, number> = {};
  for (const branch of BRANCHES) {
    const series = historicalPrices[branch.id];
    if (series && series.length > 0) {
      day0Prices[branch.id] = series[0].price_usd;
    }
  }

  // Deployment state
  let cumulativeSpYield = 0;
  let cumulativeDaoRevenue = 0;
  let minCR = { branchId: '', value: Infinity, date: '' };
  let maxDrawdown = { branchId: '', value: 0, date: '' };
  const dangerDays: Record<string, number> = {};

  for (let day = 0; day < maxDays; day++) {
    const branchSnapshots: BranchSnapshot[] = [];
    let totalWeightedCR = 0;
    let totalWeight = 0;
    let dailyInterest = 0;
    let fxRate = 1.08;

    for (const branch of BRANCHES) {
      const series = historicalPrices[branch.id];
      if (!series || day >= series.length) continue;

      const dayData: DayData = series[day];
      const refPrice = day0Prices[branch.id];
      if (!refPrice) continue;

      fxRate = dayData.fx_rate;

      // Price change since deployment
      const priceRatio = dayData.price_usd / refPrice;
      const priceChangePct = (priceRatio - 1) * 100;

      // Recalculate CR: original CR adjusted by price movement
      // CR = (collateral_value / debt). Collateral moved with price, debt is fixed.
      const originalCR = crs[branch.id] || branch.defaultCR;
      const currentCR = originalCR * priceRatio;

      const bufferHeadroom = currentCR - branch.minMCR;
      const inDanger = bufferHeadroom < 0.15;

      // Track worst CR
      if (currentCR < minCR.value) {
        minCR = {
          branchId: branch.id,
          value: currentCR,
          date: new Date(dayData.ts).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        };
      }

      // Track danger days
      if (inDanger) {
        dangerDays[branch.id] = (dangerDays[branch.id] || 0) + 1;
      }

      // Track max drawdown
      if (priceChangePct < 0 && Math.abs(priceChangePct) > maxDrawdown.value) {
        maxDrawdown = {
          branchId: branch.id,
          value: Math.abs(priceChangePct),
          date: new Date(dayData.ts).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        };
      }

      // Daily interest accrual
      const allocatedCapital = totalCapital * (weights[branch.id] || branch.defaultWeight);
      const minted = allocatedCapital / originalCR;
      dailyInterest += (minted * branch.interestRate) / 365;

      // Weighted CR for aggregate view  
      const w = weights[branch.id] || branch.defaultWeight;
      totalWeightedCR += currentCR * w;
      totalWeight += w;

      branchSnapshots.push({
        id: branch.id,
        name: branch.name,
        color: branch.color,
        currentCR,
        bufferHeadroom,
        inDanger,
        priceChangePct,
        lvrPercent: dayData.lvr_potential_percent,
      });
    }

    // Accumulate yields
    const dailySp = dailyInterest * SP_STAKER_SHARE;
    const dailyDao = dailyInterest * DAO_SHARE;
    cumulativeSpYield += dailySp;
    cumulativeDaoRevenue += dailyDao;

    snapshots.push({
      ts: BRANCHES[0] && historicalPrices[BRANCHES[0].id]?.[day]?.ts || 0,
      date: BRANCHES[0] && historicalPrices[BRANCHES[0].id]?.[day]
        ? new Date(historicalPrices[BRANCHES[0].id][day].ts).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
        : `Day ${day}`,
      branches: branchSnapshots,
      cumulativeSpYield,
      cumulativeDaoRevenue,
      weightedCR: totalWeight > 0 ? totalWeightedCR / totalWeight : 0,
      fxRate,
    });
  }

  return {
    snapshots,
    totalDays: maxDays,
    minCR,
    maxDrawdown,
    dangerDays,
    totalSpYield: cumulativeSpYield,
    totalDaoRevenue: cumulativeDaoRevenue,
  };
}
