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
  };
}

const tooltipStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
  background: 'rgba(29,28,31,0.95)', border: '1px solid rgba(160,130,245,0.25)',
  borderRadius: '6px', color: '#E8E6ED',
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

  const sampled = result.days.filter((_, i) => i % 2 === 0 || i === result.days.length - 1);
  const tickInterval = Math.floor(sampled.length / 7);

  const chartData = sampled.map(d => ({
    date: d.date.slice(5),
    'SP Yield': d.spYield,
    'sDAI Yield': d.sdaiYield,
    'Staking Yield': d.stakingYield,
    'CoW AMM Fees': d.cowFees,
    'LVR Captured': d.lvrCaptured,
    'Router → LPs': d.redirectYield,
  }));

  const t = result.totals;

  const chartInRow = !!(deployFlow && embedded);

  const chartCard = (
    <div
      className={chartInRow ? 'glass-card replay-chart-row__chart' : 'glass-card'}
      style={{ padding: '20px', marginBottom: deployFlow && embedded ? 0 : '20px' }}
      role="region"
      aria-label="Historical yield replay, stacked cumulative"
    >
      <p className="label" style={{ marginBottom: '4px' }}>Cumulative yield — stacked</p>
      <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '12px', color: 'var(--muted-foreground)' }}>
        Bands sum to <strong>LP total</strong> ({fmtEur(t.evroTotal)}). DAO accrual is not stacked here — it is tracked separately from LP yield.
      </p>
      <div className={chartInRow ? 'replay-chart-row__chart-area' : undefined} style={chartInRow ? undefined : { height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 16, right: 16, top: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A082F5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#A082F5" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="sdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7176CA" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7176CA" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="skGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CB1F4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9CB1F4" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="cwGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EFA960" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EFA960" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="lvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="rdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4B0FF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#C4B0FF" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
            <YAxis tickFormatter={(v: number) => fmtEur(v)} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: unknown, name: unknown) => [fmtEur(Number(value)), String(name)]}
              contentStyle={tooltipStyle}
              labelFormatter={(label) => `Day: ${label}`}
            />
            <ReferenceLine y={0} stroke="rgba(160,160,160,0.3)" strokeDasharray="4 4" />

            <Area type="monotone" dataKey="SP Yield" stackId="evro" stroke="#A082F5" fill="url(#spGrad)" strokeWidth={0} />
            <Area type="monotone" dataKey="sDAI Yield" stackId="evro" stroke="#7176CA" fill="url(#sdGrad)" strokeWidth={0} />
            <Area type="monotone" dataKey="Staking Yield" stackId="evro" stroke="#9CB1F4" fill="url(#skGrad)" strokeWidth={0} />
            <Area type="monotone" dataKey="CoW AMM Fees" stackId="evro" stroke="#EFA960" fill="url(#cwGrad)" strokeWidth={0} />
            <Area type="monotone" dataKey="LVR Captured" stackId="evro" stroke="#4ADE80" fill="url(#lvGrad)" strokeWidth={0} />
            <Area type="monotone" dataKey="Router → LPs" stackId="evro" stroke="#C4B0FF" fill="url(#rdGrad)" strokeWidth={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
        {[
          { label: 'SP', color: '#A082F5' },
          { label: 'sDAI', color: '#7176CA' },
          { label: 'Staking', color: '#9CB1F4' },
          { label: 'CoW', color: '#EFA960' },
          { label: 'LVR', color: '#4ADE80' },
          { label: 'Router→LPs', color: '#C4B0FF' },
        ].map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 8, borderRadius: 2, background: d.color, opacity: 0.7 }} />
            <span className="label-sm">{d.label}</span>
          </div>
        ))}
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
