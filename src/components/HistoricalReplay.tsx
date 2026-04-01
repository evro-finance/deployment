import { useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import { replayDeployment } from '../data/replay';
import { fmtCompact, fmtPct } from '../data/branches';

interface HistoricalReplayProps {
  totalCapital: number;
  weights: Record<string, number>;
  crs: Record<string, number>;
}

export function HistoricalReplay({ totalCapital, weights, crs }: HistoricalReplayProps) {
  const replay = useMemo(
    () => replayDeployment(totalCapital, weights, crs),
    [totalCapital, weights, crs]
  );

  // Sample every 3rd day for chart performance
  const sampled = replay.snapshots.filter((_, i) => i % 3 === 0 || i === replay.snapshots.length - 1);

  // Yield accumulation data
  const yieldData = sampled.map(s => ({
    date: s.date,
    spYield: s.cumulativeSpYield,
    daoRevenue: s.cumulativeDaoRevenue,
  }));

  // CR stress data — one line per branch
  const crData = sampled.map(s => {
    const point: Record<string, unknown> = { date: s.date };
    s.branches.forEach(b => {
      point[b.id] = b.currentCR;
    });
    return point;
  });

  // Price performance data
  const priceData = sampled.map(s => {
    const point: Record<string, unknown> = { date: s.date };
    s.branches.forEach(b => {
      point[b.id] = b.priceChangePct;
    });
    return point;
  });

  // Branch color map
  const branchColors: Record<string, string> = {};
  if (replay.snapshots[0]) {
    replay.snapshots[0].branches.forEach(b => {
      branchColors[b.id] = b.color;
    });
  }

  const branchIds = Object.keys(branchColors);

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Historical Backtesting</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        What Would Have Happened
      </h2>
      <p className="body-text" style={{ marginBottom: '16px' }}>
        {replay.totalDays} days of real collateral prices replayed through the deployment model.
        Every curve below is driven by actual market data — not projections.
      </p>

      {/* ── Stress KPIs ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-card stat-card">
          <span className="stat-label">Lowest CR Hit</span>
          <span className="stat-value" style={{ color: replay.minCR.value < 1.3 ? 'var(--evro-pink)' : 'var(--evro-green)' }}>
            {fmtPct(replay.minCR.value)}
          </span>
          <span className="label-sm">{replay.minCR.branchId?.toUpperCase()} · {replay.minCR.date}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">Max Drawdown</span>
          <span className="stat-value" style={{ color: 'var(--evro-pink)' }}>
            -{replay.maxDrawdown.value.toFixed(1)}%
          </span>
          <span className="label-sm">{replay.maxDrawdown.branchId?.toUpperCase()} · {replay.maxDrawdown.date}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">SP Yield (Actual)</span>
          <span className="stat-value" style={{ color: 'var(--evro-purple)' }}>
            {fmtCompact(replay.totalSpYield)}
          </span>
          <span className="label-sm">{replay.totalDays} days · 75% share</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">DAO Revenue (Actual)</span>
          <span className="stat-value" style={{ color: 'var(--evro-orange)' }}>
            {fmtCompact(replay.totalDaoRevenue)}
          </span>
          <span className="label-sm">{replay.totalDays} days · 25% share</span>
        </div>
      </div>

      {/* ── CR Stress Chart ──────────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '16px' }}>Collateral Ratio Stress Test</p>
        <p className="body-text" style={{ fontSize: '0.75rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Each line tracks how the branch CR would have moved with real prices. The red zone marks liquidation proximity.
        </p>
        <div className="chart-container" style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={crData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
                axisLine={false} tickLine={false}
                interval={Math.floor(sampled.length / 6)}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                formatter={(value: unknown) => [`${(Number(value) * 100).toFixed(1)}%`, '']}
                contentStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: '#fff', border: '1px solid rgba(160,130,245,0.15)', borderRadius: '4px' }}
              />
              {/* Danger zone reference line */}
              <ReferenceLine y={1.3} stroke="rgba(245,136,155,0.4)" strokeDasharray="4 4" label={{ value: 'MCR Zone', fontSize: 9, fill: '#F5889B' }} />
              {branchIds.map(id => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={branchColors[id]}
                  strokeWidth={1.5}
                  dot={false}
                  name={id.toUpperCase()}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
          {branchIds.map(id => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 3, borderRadius: 2, background: branchColors[id] }} />
              <span className="label-sm">{id.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Real Yield Accumulation ───────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '16px' }}>Cumulative Yield — Real Curve</p>
        <p className="body-text" style={{ fontSize: '0.75rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Interest income accumulated day by day using actual borrowing rates across all branches. Not a projection — a replay.
        </p>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yieldData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
                axisLine={false} tickLine={false}
                interval={Math.floor(sampled.length / 6)}
              />
              <YAxis
                tickFormatter={(v: number) => fmtCompact(v)}
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [
                  fmtCompact(Number(value)),
                  String(name) === 'spYield' ? 'SP Yield (75%)' : 'DAO Revenue (25%)'
                ]}
                contentStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: '#fff', border: '1px solid rgba(160,130,245,0.15)', borderRadius: '4px' }}
              />
              <Area type="monotone" dataKey="spYield" name="spYield" stackId="1" stroke="#A082F5" fill="rgba(160,130,245,0.25)" strokeWidth={2} />
              <Area type="monotone" dataKey="daoRevenue" name="daoRevenue" stackId="1" stroke="#EFA960" fill="rgba(239,169,96,0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: '#A082F5' }} />
            <span className="label-sm">SP Yield (75%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 12, height: 3, borderRadius: 2, background: '#EFA960' }} />
            <span className="label-sm">DAO Revenue (25%)</span>
          </div>
        </div>
      </div>

      {/* ── Collateral Price Performance ──────────────────── */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <p className="label" style={{ marginBottom: '16px' }}>Collateral Price Performance (% Change from Day 0)</p>
        <div className="chart-container" style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.08)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
                axisLine={false} tickLine={false}
                interval={Math.floor(sampled.length / 6)}
              />
              <YAxis
                tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, '']}
                contentStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: '#fff', border: '1px solid rgba(160,130,245,0.15)', borderRadius: '4px' }}
              />
              <ReferenceLine y={0} stroke="rgba(29,28,31,0.2)" />
              {branchIds.map(id => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={branchColors[id]}
                  strokeWidth={1.5}
                  dot={false}
                  name={id.toUpperCase()}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
          {branchIds.map(id => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 3, borderRadius: 2, background: branchColors[id] }} />
              <span className="label-sm">{id.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
