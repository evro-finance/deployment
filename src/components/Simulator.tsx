import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, CartesianGrid
} from 'recharts';
import { fmt, fmtCompact, fmtPct, DISTRIBUTION_LABELS } from '../data/branches';
import type { Calculations } from '../data/branches';
import { get } from '../data/content';

interface SimulatorProps {
  totalCapital: number;
  onCapitalChange: (val: number) => void;
  calculations: Calculations;
}

export function Simulator({ totalCapital, onCapitalChange, calculations }: SimulatorProps) {
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

  // 12-month yield projection
  const yieldData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    spYield: (calculations.spYieldTotal / 12) * (i + 1),
    daoRevenue: (calculations.daoRevenueTotal / 12) * (i + 1),
  }));

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <div className="glass-card stat-card">
          <span className="stat-label">Total EVRO Minted</span>
          <span className="stat-value">{fmtCompact(calculations.totalMinted)}</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-label">SP Yield Pool (75%)</span>
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
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '40px' }}>

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
                  contentStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: '#fff', border: '1px solid rgba(160,130,245,0.15)', borderRadius: '4px' }}
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
                  contentStyle={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', background: '#fff', border: '1px solid rgba(160,130,245,0.15)', borderRadius: '4px' }}
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

      {/* ── Yield Projection ────────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '40px' }}>
        <p className="label" style={{ marginBottom: '16px' }}>12-Month Cumulative Yield Projection</p>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yieldData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => fmtCompact(v)} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [fmt(Number(value)), String(name) === 'spYield' ? 'SP Yield' : 'DAO Revenue']}
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
