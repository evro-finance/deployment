// ═══════════════════════════════════════════════════════════
// EVRO Genesis — Unified Yield Engine v3
// 4-layer revenue model using real market data (365 days):
//   L1: Protocol Revenue (BOLD SP APY proxy — interest + liquidation gains)
//   L2: Collateral Yield  (sDAI DSR, wstETH staking, GNO staking)
//   L3: LP Revenue        (CoW AMM fees, LVR captured)
//   L4: DAO Revenue       (25% of interest, via interestRouter)
// ═══════════════════════════════════════════════════════════

import boldSpYields from './historical/bold_sp_yields_365.json';
import processedYields from './historical/processed_yields_365.json';
import venueReport from './historical/venue_comparison_report.json';

// ── Types ──────────────────────────────────────────────────

interface BranchAlloc {
  id: string;
  weight: number;
  cr: number;
  rate: number;
}

interface DayResult {
  date: string;
  day: number;

  // L1: Protocol revenue (SP yield based on BOLD proxy)
  spYield: number;            // cumulative
  spYieldDaily: number;

  // L2: Collateral yields
  sdaiYield: number;          // cumulative
  sdaiYieldDaily: number;
  stakingYield: number;       // cumulative (wstETH + GNO + osGNO)
  stakingYieldDaily: number;

  // L3: LP revenue
  cowFees: number;            // cumulative
  cowFeesDaily: number;
  lvrCaptured: number;        // cumulative
  lvrCapturedDaily: number;

  // L4: DAO revenue (25% of interest)
  daoRevenue: number;         // cumulative
  daoRevenueDaily: number;

  // Totals
  evroTotal: number;          // cumulative all layers
  dailyTotal: number;

  // BOLD SP APY for the day (for display)
  boldSpApy: number;
}

interface MonthResult {
  month: string;
  spYield: number;
  sdaiYield: number;
  stakingYield: number;
  cowFees: number;
  lvrCaptured: number;
  daoRevenue: number;
  evroTotal: number;
  avgSpApy: number;
  days: number;
}

export interface YieldResult {
  days: DayResult[];
  months: MonthResult[];
  totals: {
    spYield: number;
    sdaiYield: number;
    stakingYield: number;
    cowFees: number;
    lvrCaptured: number;
    daoRevenue: number;
    evroTotal: number;
    annualizedPct: number;
    totalDays: number;
    avgSpApy: number;
  };
}

// ── Data loading helpers ──────────────────────────────────

type SpDay = { date: string; blended_sp_apy: number };
const spData = boldSpYields as SpDay[];

// Build date → SP APY lookup
const spApyMap = new Map<string, number>();
for (const d of spData) {
  spApyMap.set(d.date, d.blended_sp_apy);
}

// Build date-indexed collateral yield data
// processed_yields has: wsteth_ratio, sdai_ratio, gnosis_staking_yield
// Each is an array of [timestamp_ms, value]
const pyData = processedYields as {
  wsteth_ratio: [number, number][];
  sdai_ratio: [number, number][];
  gnosis_staking_yield: [number, number][];
};

function tsToDate(ts: number): string {
  return new Date(ts).toISOString().split('T')[0];
}

// Build daily ratio maps
const sdaiRatioMap = new Map<string, number>();
for (const [ts, val] of pyData.sdai_ratio) {
  sdaiRatioMap.set(tsToDate(ts), val);
}

const wstethRatioMap = new Map<string, number>();
for (const [ts, val] of pyData.wsteth_ratio) {
  wstethRatioMap.set(tsToDate(ts), val);
}

const gnoYieldMap = new Map<string, number>();
for (const [ts, val] of pyData.gnosis_staking_yield) {
  gnoYieldMap.set(tsToDate(ts), val);
}

// CoW AMM fees: captured via batch-auction surplus, NOT in the per-day fees_eur field.
// The venue report's block-level aggregate is the real number:
//   €326,258 gross_fees on a €3M pool over 182 days = €1,793/day.
// We scale this rate proportionally to our LP allocation.
const report = venueReport as {
  scenarios: {
    A: { gross_fees_eur: number; lvr_captured_eur: number; deployment_eur: number };
    B: { lvr_exposed_eur: number };
  };
  meta: { periodDays: number };
};

const cowGrossFees = report.scenarios.A.gross_fees_eur || 0;
const cowBasePool = report.scenarios.A.deployment_eur || 3_000_000;
const periodDays = report.meta.periodDays || 182;
const cowDailyFeeRate = cowGrossFees / cowBasePool / periodDays; // fee per € per day

const totalLvrCaptured = report.scenarios.A.lvr_captured_eur || 0;
const dailyLvrRate = totalLvrCaptured / cowBasePool / periodDays; // LVR per € per day

// ── Main computation ──────────────────────────────────────

export function computeYield(
  totalCapital: number,
  branches: BranchAlloc[],
  incentivesToLps: boolean = false,
): YieldResult {
  // Compute allocations from branches
  const totalWeight = branches.reduce((s, b) => s + b.weight, 0);

  let sdaiCapital = 0;
  let wstethCapital = 0;
  let gnoCapital = 0;
  let totalMinted = 0;
  let blendedRate = 0;

  for (const b of branches) {
    const normWeight = totalWeight > 0 ? b.weight / totalWeight : 0;
    const allocated = totalCapital * normWeight;
    const minted = allocated / b.cr;
    totalMinted += minted;
    blendedRate += minted * b.rate;

    if (b.id === 'sdai' || b.id === 'wxdai') sdaiCapital += allocated;
    if (b.id === 'wsteth') wstethCapital += allocated;
    if (b.id === 'gno' || b.id === 'osgno') gnoCapital += allocated;
  }
  blendedRate = totalMinted > 0 ? blendedRate / totalMinted : 0;

  // LP allocation — assume 40% of minted goes to Anchor Pool (CoW AMM)
  const anchorAlloc = totalMinted * 0.40;

  // Generate sorted date list from SP data within our window
  const dates = spData.map(d => d.date).sort();

  // ── Day-by-day accumulation ──
  let cumSp = 0;
  let cumSdai = 0;
  let cumStaking = 0;
  let cumGno = 0;
  let cumCow = 0;
  let cumLvr = 0;
  let cumDao = 0;

  const days: DayResult[] = [];
  // Get starting ratios for L2 cumulative computation
  const firstDate = dates[0];
  const startSdaiRatio = sdaiRatioMap.get(firstDate) || Array.from(sdaiRatioMap.values())[0] || 1;
  const startWstethRatio = wstethRatioMap.get(firstDate) || Array.from(wstethRatioMap.values())[0] || 1;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];

    // ── L1: Protocol revenue (BOLD SP APY proxy) ──
    const spApy = spApyMap.get(date) || 2.5; // fallback to conservative
    const spDailyRate = spApy / 100 / 365;
    // Apply SP yield to the minted EVRO in the Stability Pool
    // Assume 40% of minted goes to SP
    const spAlloc = totalMinted * 0.40;
    const spDaily = spAlloc * spDailyRate;
    cumSp += spDaily;

    // ── L2a: sDAI DSR yield ──
    // Use cumulative ratio from start: yield = (current/start - 1) × capital
    // This correctly captures NET yield, not just up-days
    const curSdaiRatio = sdaiRatioMap.get(date) || startSdaiRatio;
    const sdaiCumYield = sdaiCapital * Math.max(0, (curSdaiRatio / startSdaiRatio) - 1);
    const sdaiDaily = sdaiCumYield - cumSdai;
    cumSdai = sdaiCumYield;

    // ── L2b: wstETH staking yield ──
    // Same cumulative approach: net ratio change from start
    const curWstethRatio = wstethRatioMap.get(date) || startWstethRatio;
    const wstethCumYield = wstethCapital * Math.max(0, (curWstethRatio / startWstethRatio) - 1);
    let stakingDaily = wstethCumYield - (cumStaking - cumGno);
    const prevCumWsteth = wstethCumYield;

    // GNO staking (~3.5% APR)
    const gnoApy = gnoYieldMap.get(date) || 0.035;
    const gnoDaily = gnoCapital * (gnoApy / 365);
    cumGno += gnoDaily;
    stakingDaily += gnoDaily;
    cumStaking = prevCumWsteth + cumGno;

    // ── L3: LP revenue (CoW AMM fees + LVR captured) ──
    // cowDailyFeeRate = fee per € of LP capital per day (from venue report aggregate)
    // Scale linearly to our anchor allocation
    const cowDaily = anchorAlloc * cowDailyFeeRate;
    cumCow += cowDaily;

    // LVR captured — same proportional scaling
    const lvrDaily = anchorAlloc * dailyLvrRate;
    cumLvr += lvrDaily;

    // ── L4: DAO revenue (25% of borrower interest) ──
    // Interest is based on the user-set blended rate
    const interestDaily = totalMinted * (blendedRate / 365);
    const daoDaily = incentivesToLps ? 0 : interestDaily * 0.25;
    cumDao += daoDaily;

    // Note: the SP yield from L1 already includes the 75% interest portion
    // (because BOLD SP APY = interest + liquidation gains)
    // So we do NOT add interest again when computing evroTotal.
    // The DAO 25% is separate — it comes from the borrower side, not the SP side.

    const dailyTotal = spDaily + sdaiDaily + stakingDaily + cowDaily + lvrDaily + daoDaily;
    const evroTotal = cumSp + cumSdai + cumStaking + cumCow + cumLvr + cumDao;

    days.push({
      date,
      day: i + 1,
      spYield: cumSp,
      spYieldDaily: spDaily,
      sdaiYield: cumSdai,
      sdaiYieldDaily: sdaiDaily,
      stakingYield: cumStaking,
      stakingYieldDaily: stakingDaily,
      cowFees: cumCow,
      cowFeesDaily: cowDaily,
      lvrCaptured: cumLvr,
      lvrCapturedDaily: lvrDaily,
      daoRevenue: cumDao,
      daoRevenueDaily: daoDaily,
      evroTotal,
      dailyTotal,
      boldSpApy: spApy,
    });
  }

  // ── Monthly aggregation ──
  const monthMap = new Map<string, MonthResult>();
  for (const d of days) {
    const month = d.date.slice(0, 7); // YYYY-MM
    if (!monthMap.has(month)) {
      monthMap.set(month, {
        month,
        spYield: 0,
        sdaiYield: 0,
        stakingYield: 0,
        cowFees: 0,
        lvrCaptured: 0,
        daoRevenue: 0,
        evroTotal: 0,
        avgSpApy: 0,
        days: 0,
      });
    }
    const m = monthMap.get(month)!;
    m.spYield += d.spYieldDaily;
    m.sdaiYield += d.sdaiYieldDaily;
    m.stakingYield += d.stakingYieldDaily;
    m.cowFees += d.cowFeesDaily;
    m.lvrCaptured += d.lvrCapturedDaily;
    m.daoRevenue += d.daoRevenueDaily;
    m.evroTotal += d.dailyTotal;
    m.avgSpApy += d.boldSpApy;
    m.days += 1;
  }

  const months = Array.from(monthMap.values()).map(m => ({
    ...m,
    avgSpApy: m.days > 0 ? m.avgSpApy / m.days : 0,
  }));

  // ── Totals ──
  const last = days[days.length - 1];
  const totalDays = days.length;
  const annualizedPct = totalDays > 0 && totalCapital > 0
    ? ((last?.evroTotal || 0) / totalCapital) * (365 / totalDays) * 100
    : 0;
  const avgSpApy = days.reduce((s, d) => s + d.boldSpApy, 0) / Math.max(totalDays, 1);

  return {
    days,
    months,
    totals: {
      spYield: last?.spYield || 0,
      sdaiYield: last?.sdaiYield || 0,
      stakingYield: last?.stakingYield || 0,
      cowFees: last?.cowFees || 0,
      lvrCaptured: last?.lvrCaptured || 0,
      daoRevenue: last?.daoRevenue || 0,
      evroTotal: last?.evroTotal || 0,
      annualizedPct,
      totalDays,
      avgSpApy,
    },
  };
}
