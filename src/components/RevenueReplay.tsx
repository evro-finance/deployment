import type { CSSProperties } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import type { YieldResult } from '../data/yield-engine';
import type { L2Shares } from '../data/branches';
import { DeployFlowSankey, type DeployFlowBranch } from './DeployFlowSankey';

interface RevenueReplayProps {
  yieldResult: YieldResult;
  /** When true, render inside Deployment Plan (no outer `section.section`) */
  embedded?: boolean;
  /** Optional right rail: Sankey deploy flow + L2 split controls */
  deployFlow?: {
    branches: DeployFlowBranch[];
    totalMinted: number;
    l2Shares: L2Shares;
    onAdjustL2: (key: keyof L2Shares, target: number) => void;
    /** 0 = all to DAO, 1 = all to LPs — drives DAO band saturation */
    incentiveShare: number;
    /** The dynamic name of the liquidity provider (e.g. Gnosis or from URL) */
    lpName: string;
    l2Locked?: boolean;
    onToggleL2?: () => void;
  };
}

const tooltipStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)', 
  fontSize: '0.72rem',
  background: 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(160, 130, 245, 0.15)',
  borderRadius: '8px', 
  color: 'var(--evro-shark)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};

const fmtEur = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `€${(v / 1_000).toFixed(1)}k`;
  return `€${v.toFixed(0)}`;
};

export function RevenueReplay({
  yieldResult,
  embedded = false,
  deployFlow,
}: RevenueReplayProps) {
  const result = yieldResult;
  const incentiveShare = deployFlow?.incentiveShare ?? 0;
  const lpName = deployFlow?.lpName ?? 'Gnosis';

  const sampled = result.days.filter((_, i) => i % 2 === 0 || i === result.days.length - 1);
  const tickInterval = Math.floor(sampled.length / 7);

  // Band order: bottom → top by reactivity (stable bed rock, dynamic summit)
  // Stack: sDAI → Staking → CoW → LVR → SP → Router→LPs → DAO Accrual (cap)
  const chartData = sampled.map(d => ({
    date: d.date.slice(5),
    'sDAI Yield':    d.sdaiYield,
    'Staking Yield': d.stakingYield,
    'CoW AMM Fees':  d.cowFees,
    'LVR Captured':  d.lvrCaptured,
    'SP Yield':      d.spYield,
    'Router → LPs':  d.redirectYield,
    'DAO Accrual':   d.daoRevenue,
  }));

  const t = result.totals;

  // DAO band opacity: saturated (0.75) when all going to DAO, ghost (0.15) when all to LPs
  const daoOpacity = 0.75 - 0.60 * incentiveShare;
  const daoOpacityFloor = Math.max(0.04, daoOpacity - 0.30);

  const chartInRow = !!(deployFlow && embedded);

  const chartCard = (
    <div
      className={chartInRow ? 'glass-card replay-chart-row__chart' : 'glass-card'}
      style={{ padding: '20px', marginBottom: deployFlow && embedded ? 0 : '20px', display: 'flex', flexDirection: 'column' }}
      role="region"
      aria-label="Historical yield replay, stacked cumulative"
    >
      <p className="label" style={{ marginBottom: '4px' }}>Cumulative yield — stacked</p>
      <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '12px', color: 'var(--muted-foreground)' }}>
        LP bands + DAO cap ({fmtEur(t.evroTotal + t.daoRevenue)} total).{' '}
        Hover to inspect specific yield sources.
      </p>
      <div className={chartInRow ? 'replay-chart-row__chart-area' : undefined} style={chartInRow ? { background: 'rgba(22,20,30,0.03)', border: '1px solid rgba(160,130,245,0.18)', borderRadius: '8px', overflow: 'hidden' } : { height: '320px', flex: 1, background: 'rgba(22,20,30,0.03)', border: '1px solid rgba(160,130,245,0.18)', borderRadius: '8px', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ left: 16, right: 16, top: 8, bottom: 4 }}
          >
            <defs>
              {/* Band 1 (bottom): sDAI — most stable */}
              <linearGradient id="sdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7176CA" stopOpacity={0.82} />
                <stop offset="95%" stopColor="#7176CA" stopOpacity={0.35} />
              </linearGradient>
              {/* Band 2: Staking */}
              <linearGradient id="skGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#9CB1F4" stopOpacity={0.82} />
                <stop offset="95%" stopColor="#9CB1F4" stopOpacity={0.35} />
              </linearGradient>
              {/* Band 3: CoW AMM Fees */}
              <linearGradient id="cwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#EFA960" stopOpacity={0.82} />
                <stop offset="95%" stopColor="#EFA960" stopOpacity={0.35} />
              </linearGradient>
              {/* Band 4: LVR Captured */}
              <linearGradient id="lvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#81C784" stopOpacity={0.82} />
                <stop offset="95%" stopColor="#81C784" stopOpacity={0.35} />
              </linearGradient>
              {/* Band 5: SP Yield */}
              <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#A081F5" stopOpacity={0.88} />
                <stop offset="95%" stopColor="#A081F5" stopOpacity={0.38} />
              </linearGradient>
              {/* Band 6: Router→LPs (grows with incentiveShare) */}
              <linearGradient id="rdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C4B0FF" stopOpacity={0.88} />
                <stop offset="95%" stopColor="#C4B0FF" stopOpacity={0.38} />
              </linearGradient>
              {/* Band 7 (cap): DAO Accrual — opacity driven by incentiveShare */}
              <linearGradient id="daoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#95929E" stopOpacity={Math.min(0.65, daoOpacity)} />
                <stop offset="95%" stopColor="#95929E" stopOpacity={daoOpacityFloor} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.10)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
            <YAxis
              tickFormatter={(v: number) => {
                const abs = Math.abs(v);
                if (abs >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
                if (abs >= 1_000)     return `€${Math.round(v / 1_000)}k`;
                return `€${v.toFixed(0)}`;
              }}
              tick={{ fontSize: 11, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
              width={52}
            />
            <Tooltip
              itemSorter={() => -1} // Reverse order to show Top-to-Bottom (matching visual stack)
              formatter={(value: unknown, name: unknown) => {
                const label = String(name);
                const val = fmtEur(Number(value));
                // Flag DAO as a cost in the tooltip
                return label === 'DAO Accrual' ? [`${val} (protocol fee)`, label] : [val, label];
              }}
              contentStyle={tooltipStyle}
              labelFormatter={(label) => `${label}`}
            />
            <ReferenceLine y={0} stroke="rgba(160,160,160,0.3)" strokeDasharray="4 4" />

            {/* Stack order: stable at bottom, reactive at top */}
            <Area type="monotone" dataKey="sDAI Yield"    stackId="evro" stroke="#7176CA" fill="url(#sdGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Staking Yield" stackId="evro" stroke="#9CB1F4" fill="url(#skGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="CoW AMM Fees"  stackId="evro" stroke="#EFA960" fill="url(#cwGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="LVR Captured"  stackId="evro" stroke="#81C784" fill="url(#lvGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="SP Yield"      stackId="evro" stroke="#A081F5" fill="url(#spGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Router → LPs" stackId="evro" stroke="#C4B0FF" fill="url(#rdGrad)" strokeWidth={2} />
            {/* DAO cap: always visible, desaturates as incentiveShare → 1 */}
            <Area type="monotone" dataKey="DAO Accrual"   stackId="evro" stroke="#95929E" fill="url(#daoGrad)" strokeWidth={1.5} strokeDasharray="3 3" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Financial Receipt ── */}
      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(160, 130, 245, 0.1)',
      }}>
        {/* Tier 1 — Hero Stat */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingBottom: '18px',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.16em',
            color: 'var(--muted-foreground)',
            marginBottom: '6px',
          }}>
            Net to {lpName}
          </span>
          <span style={{
            fontFamily: 'var(--font-data)',
            fontWeight: 800,
            fontSize: 'clamp(1.44rem, 2.8vw, 2.08rem)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, var(--evro-purple), var(--evro-orange))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            +{fmtEur(t.evroTotal - t.daoRevenue)}
          </span>
        </div>

        {/* Tier 2 — KPI Triptych */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr auto 1fr',
          alignItems: 'center',
          borderTop: '1px solid rgba(160, 130, 245, 0.08)',
          paddingTop: '14px',
        }}>
          {/* Annualized Yield */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.52rem', fontWeight: 500,
              textTransform: 'uppercase' as const, letterSpacing: '0.14em',
              color: 'var(--muted-foreground)',
            }}>Annualized</span>
            <span style={{
              fontFamily: 'var(--font-data)', fontSize: '1.15rem', fontWeight: 700,
              letterSpacing: '-0.02em', color: '#A081F5',
            }}>
              {t.annualizedPct.toFixed(1)}%
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '32px', background: 'rgba(160, 130, 245, 0.12)', margin: '0 12px' }} />

          {/* LP Position */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.52rem', fontWeight: 500,
              textTransform: 'uppercase' as const, letterSpacing: '0.14em',
              color: 'var(--muted-foreground)',
            }}>LP Position · {t.totalDays}d</span>
            <span style={{
              fontFamily: 'var(--font-data)', fontSize: '1.15rem', fontWeight: 700,
              letterSpacing: '-0.02em', color: '#A081F5',
            }}>
              +{fmtEur(t.evroTotal)}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '32px', background: 'rgba(160, 130, 245, 0.12)', margin: '0 12px' }} />

          {/* DAO Fee */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.52rem', fontWeight: 500,
              textTransform: 'uppercase' as const, letterSpacing: '0.14em',
              color: 'var(--muted-foreground)',
            }}>DAO Fee ({Math.round((1 - incentiveShare) * 25)}%)</span>
            <span style={{
              fontFamily: 'var(--font-data)', fontSize: '1.05rem', fontWeight: 600,
              letterSpacing: '-0.02em', color: 'var(--muted-foreground)',
            }}>
              −{fmtEur(t.daoRevenue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const body = deployFlow && embedded ? (
    <div className="replay-chart-row">
      <div className="replay-chart-row__main">{chartCard}</div>
      <div className="glass-card replay-chart-row__rail" style={{ padding: '14px 12px 16px' }}>
        <DeployFlowSankey
          branches={deployFlow.branches}
          totalMinted={deployFlow.totalMinted}
          l2Shares={deployFlow.l2Shares}
          onAdjustL2={deployFlow.onAdjustL2}
          l2Locked={deployFlow.l2Locked}
          onToggleL2={deployFlow.onToggleL2}
        />
      </div>
    </div>
  ) : (
    chartCard
  );

  if (embedded) {
    return <div className="replay-embedded">{body}</div>;
  }

  return <section className="section">{body}</section>;
}
