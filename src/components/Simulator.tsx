import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, CartesianGrid,
  LineChart, Line, ReferenceLine
} from 'recharts';
import { fmt, fmtCompact, fmtPct, DISTRIBUTION_LABELS } from '../data/branches';
import type { Calculations } from '../data/branches';
import { get } from '../data/content';
import { replayDeployment } from '../data/replay';

interface SimulatorProps {
  totalCapital: number;
  onCapitalChange: (val: number) => void;
  calculations: Calculations;
  weights: Record<string, number>;
  crs: Record<string, number>;
}

const tooltipStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
  background: 'rgba(29,28,31,0.95)',
  border: '1px solid rgba(160,130,245,0.25)',
  borderRadius: '6px',
  color: '#E8E6ED',
  backdropFilter: 'blur(8px)',
};

export function Simulator({ totalCapital, onCapitalChange, calculations, weights, crs }: SimulatorProps) {
  const barData = calculations.branchResults.map(b => ({
    name: b.name,
    allocated: b.allocatedCapital,
    minted: b.minted,
    color: b.color,
  }));

  const pieData = [
    { name: 'Stability Pool', value: calculations.distribution.sp, color: DISTRIBUTION_LABELS[0].color },
    { name: 'Anchor Pool', value: calculations.distribution.anchor, color: DISTRIBUTION_LABELS[1].color },
    { name: 'Bridge Pool', value: calculations.distribution.bridge, color: DISTRIBUTION_LABELS[2].color },
  ].filter(d => d.value > 0);

  // ── Historical Replay ──────────────────────────────────
  const replay = useMemo(
    () => replayDeployment(totalCapital, weights, crs),
    [totalCapital, weights, crs]
  );

  // Sample for chart performance (every 3rd point)
  const sampled = replay.snapshots.filter((_, i) => i % 3 === 0 || i === replay.snapshots.length - 1);
  const tickInterval = Math.floor(sampled.length / 6);

  // Real yield accumulation
  const yieldData = sampled.map(s => ({
    date: s.date,
    spYield: s.cumulativeSpYield,
    daoRevenue: s.cumulativeDaoRevenue,
  }));

  // CR stress per branch
  const crData = sampled.map(s => {
    const pt: Record<string, unknown> = { date: s.date };
    s.branches.forEach(b => { pt[b.id] = b.currentCR; });
    return pt;
  });

  // Price performance
  const priceData = sampled.map(s => {
    const pt: Record<string, unknown> = { date: s.date };
    s.branches.forEach(b => { pt[b.id] = b.priceChangePct; });
    return pt;
  });

  // Color map from first snapshot
  const branchColors: Record<string, string> = {};
  if (replay.snapshots[0]) {
    replay.snapshots[0].branches.forEach(b => { branchColors[b.id] = b.color; });
  }
  const branchIds = Object.keys(branchColors);

  // Legend component
  const ChartLegend = ({ items }: { items: { id: string; color: string; label: string }[] }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
      {items.map(d => (
        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 12, height: 3, borderRadius: 2, background: d.color }} />
          <span className="label-sm">{d.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Interactive Simulator</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('simulator', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '16px' }}>
        {get('simulator', 'body')}
      </p>
      {get('simulator', 'cr-strategy') && (
        <p className="body-text" style={{ marginBottom: '8px', fontSize: '0.9rem' }}
           dangerouslySetInnerHTML={{ __html: get('simulator', 'cr-strategy').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      )}
      {get('simulator', 'rate-strategy') && (
        <p className="body-text" style={{ marginBottom: '16px', fontSize: '0.9rem' }}
           dangerouslySetInnerHTML={{ __html: get('simulator', 'rate-strategy').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      )}

      {/* ── Capital Slider ──────────────────────────────── */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <span className="label">Total Capital Deployed</span>
          <span className="data-xl" style={{ color: 'var(--accent)' }}>{fmt(totalCapital)}</span>
        </div>
        <input
          type="range"
          min={1_000_000}
          max={25_000_000}
          step={500_000}
          value={totalCapital}
          onChange={e => onCapitalChange(Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span className="label-sm">€1M</span>
          <span className="label-sm">€25M</span>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <div className="glass-card stat-card">
          <span className="stat-label">Total EVRO Minted</span>
          <span className="stat-value">{fmtCompact(calculations.totalMinted)}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">SP Yield (75%)</span>
          <span className="stat-value" style={{ color: 'var(--evro-purple)' }}>
            {fmtCompact(calculations.spYieldTotal)}<span style={{ fontSize: '0.6em', color: 'var(--muted-foreground)' }}>/yr</span>
          </span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">DAO Revenue (25%)</span>
          <span className="stat-value" style={{ color: 'var(--evro-orange)' }}>
            {fmtCompact(calculations.daoRevenueTotal)}<span style={{ fontSize: '0.6em', color: 'var(--muted-foreground)' }}>/yr</span>
          </span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Lowest CR Hit</span>
          <span className="stat-value" style={{ color: replay.minCR.value < 1.3 ? 'var(--evro-pink)' : 'var(--evro-green)' }}>
            {fmtPct(replay.minCR.value)}
          </span>
          <span className="label-sm" style={{ marginTop: '4px' }}>{replay.minCR.branchId?.toUpperCase()} · {replay.minCR.date}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Max Drawdown</span>
          <span className="stat-value" style={{ color: 'var(--evro-pink)' }}>
            -{replay.maxDrawdown.value.toFixed(1)}%
          </span>
          <span className="label-sm" style={{ marginTop: '4px' }}>{replay.maxDrawdown.branchId?.toUpperCase()} · {replay.maxDrawdown.date}</span>
        </div>
      </div>

      {/* ── Charts Row: Minting + Distribution ──────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>

        {/* Minting Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <p className="label" style={{ marginBottom: '16px' }}>Layer 1 — Minting by Branch</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <XAxis type="number" tickFormatter={(v: number) => fmtCompact(v)} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={55} tick={{ fontSize: 11, fontFamily: 'var(--font-heading)', fill: '#1D1C1F', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: unknown) => [fmt(Number(value)), '']}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="minted" name="EVRO Minted" radius={[0, 3, 3, 0]} barSize={18}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Donut */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <p className="label" style={{ marginBottom: '16px' }}>Layer 2 — Distribution</p>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  dataKey="value"
                  stroke="none"
                  paddingAngle={3}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => [fmtCompact(Number(value)), '']}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            {pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                <span className="label-sm">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Historical Data Banner ─────────────────────── */}
      <div style={{ 
        padding: '16px 24px', 
        marginBottom: '24px', 
        background: 'linear-gradient(135deg, rgba(160,130,245,0.06), rgba(239,169,96,0.06))',
        borderRadius: '8px',
        border: '1px solid rgba(160,130,245,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{ 
          width: 8, height: 8, borderRadius: '50%', 
          background: 'var(--evro-green)', 
          boxShadow: '0 0 6px rgba(74,222,128,0.4)',
          flexShrink: 0,
        }} />
        <span className="label-sm" style={{ letterSpacing: '0.08em' }}>
          CHARTS BELOW DRIVEN BY {replay.totalDays} DAYS OF REAL MARKET DATA — NOT PROJECTIONS
        </span>
      </div>

      {/* ── Collateral Price Performance ──────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Collateral Price Performance</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Percentage change from day of deployment. Each line is a real collateral asset on Gnosis Chain.
        </p>
        <div className="chart-container" style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
              <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, '']} contentStyle={tooltipStyle} />
              <ReferenceLine y={0} stroke="rgba(160,130,245,0.2)" strokeDasharray="4 4" />
              {branchIds.map(id => (
                <Line key={id} type="monotone" dataKey={id} stroke={branchColors[id]} strokeWidth={1.5} dot={false} name={id.toUpperCase()} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend items={branchIds.map(id => ({ id, color: branchColors[id], label: id.toUpperCase() }))} />
      </div>

      {/* ── CR Stress Test ───────────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Collateral Ratio — Stress Test</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          How each branch's CR would have moved with real prices. The red zone marks liquidation proximity.
        </p>
        <div className="chart-container" style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={crData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip formatter={(value: unknown) => [`${(Number(value) * 100).toFixed(1)}%`, '']} contentStyle={tooltipStyle} />
              <ReferenceLine y={1.3} stroke="rgba(245,136,155,0.5)" strokeDasharray="4 4" label={{ value: 'MCR Zone', fontSize: 9, fill: '#F5889B', position: 'right' }} />
              {branchIds.map(id => (
                <Line key={id} type="monotone" dataKey={id} stroke={branchColors[id]} strokeWidth={1.5} dot={false} name={id.toUpperCase()} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend items={branchIds.map(id => ({ id, color: branchColors[id], label: id.toUpperCase() }))} />
      </div>

      {/* ── Cumulative Yield — Real Data ──────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '40px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Cumulative Revenue — Historical Replay</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Interest income accumulated day by day across all branches. The 75/25 split is applied live.
        </p>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yieldData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
              <YAxis tickFormatter={(v: number) => fmtCompact(v)} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [
                  fmtCompact(Number(value)),
                  String(name) === 'spYield' ? 'SP Yield (75%)' : 'DAO Revenue (25%)'
                ]}
                contentStyle={tooltipStyle}
              />
              <Area type="monotone" dataKey="spYield" name="spYield" stackId="1" stroke="#A082F5" fill="rgba(160,130,245,0.2)" strokeWidth={2} />
              <Area type="monotone" dataKey="daoRevenue" name="daoRevenue" stackId="1" stroke="#EFA960" fill="rgba(239,169,96,0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend items={[
          { id: 'sp', color: '#A082F5', label: 'SP Yield (75%)' },
          { id: 'dao', color: '#EFA960', label: 'DAO Revenue (25%)' },
        ]} />
      </div>

      {/* ── Branch Detail Table ─────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <p className="label" style={{ marginBottom: '16px' }}>Branch-Level Analytics</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Capital</th>
                <th>CR</th>
                <th>EVRO Minted</th>
                <th>Buffer</th>
                <th>APR</th>
              </tr>
            </thead>
            <tbody>
              {calculations.branchResults.map(r => (
                <tr key={r.id}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                      <strong style={{ color: 'var(--foreground)' }}>{r.name}</strong>
                    </span>
                  </td>
                  <td className="value">{fmtCompact(r.allocatedCapital)}</td>
                  <td className="value">{fmtPct(r.allocatedCapital > 0 ? r.allocatedCapital / r.minted : 0)}</td>
                  <td className="value" style={{ color: 'var(--accent)' }}>{fmtCompact(r.minted)}</td>
                  <td>
                    <span style={{ color: r.bufferHeadroom < 0.15 ? 'var(--evro-pink)' : 'var(--evro-green)' }}>
                      {fmtPct(r.bufferHeadroom)}
                    </span>
                  </td>
                  <td className="value">{fmtPct(r.interestRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
