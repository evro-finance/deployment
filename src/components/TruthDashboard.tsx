import { useState, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import { fmt, fmtCompact } from '../data/branches';
import { computeYield } from '../data/yield-engine';

interface TruthDashboardProps {
  totalCapital: number;
  onCapitalChange: (val: number) => void;
}

const tooltipStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  background: 'rgba(29,28,31,0.95)',
  border: '1px solid rgba(160,130,245,0.25)',
  borderRadius: '6px',
  color: '#E8E6ED',
};

type TabId = 'yield' | 'stress' | 'router';

const fmtEur = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `€${(v / 1_000).toFixed(1)}k`;
  return `€${v.toFixed(0)}`;
};

const fmtEurSigned = (v: number) => {
  const prefix = v >= 0 ? '+' : '';
  return prefix + fmtEur(v);
};

export function TruthDashboard({ totalCapital, onCapitalChange }: TruthDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('yield');
  const result = useMemo(() => computeYield(totalCapital), [totalCapital]);

  // Sample for chart perf
  const sampled = result.days.filter((_, i) => i % 2 === 0 || i === result.days.length - 1);
  const tickInterval = Math.floor(sampled.length / 7);

  // ── Chart data: stacked EVRO yield + comparison lines ──
  const chartData = sampled.map(d => ({
    date: d.date.slice(5),
    // Stacked layers (for area)
    'Borrowing Interest': d.borrowingInterest,
    'sDAI Yield': d.sdaiYield,
    'Staking Yield': d.stakingYield,
    'CoW AMM Fees': d.cowFees,
    'LVR Captured': d.lvrCaptured,
    // Comparison lines (for line overlay)
    curveTrue: d.curvePnl,
    hodlEth: d.hodlEthPnl,
    hodlUsd: 0,
    // Total for tooltip
    evroTotal: d.evroTotal,
  }));

  // ── Router chart data ──
  const routerData = sampled.map(d => ({
    date: d.date.slice(5),
    'Dev Fund': d.routerDev,
    'Ops Fund': d.routerOps,
    'Governance Boost': d.routerGov,
    'Treasury Reserve': d.routerTreasury,
  }));

  const t = result.totals;

  const tabs: { id: TabId; label: string }[] = [
    { id: 'yield', label: 'Yield Accumulation' },
    { id: 'router', label: 'Interest Router' },
  ];

  return (
    <section className="section">
      {/* ── Capital Slider ──────────────────────────────── */}
      <div className="glass-card" style={{ padding: '28px 32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <span className="label">Total Capital Deployed</span>
          <span className="data-xl" style={{ color: 'var(--accent)' }}>{fmt(totalCapital)}</span>
        </div>
        <input
          type="range" min={1_000_000} max={25_000_000} step={500_000}
          value={totalCapital}
          onChange={e => onCapitalChange(Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span className="label-sm">€1M</span>
          <span className="label-sm">€25M</span>
        </div>
      </div>

      {/* ── Reactive Prose ──────────────────────────────── */}
      <div style={{ marginBottom: '32px', lineHeight: 1.85 }}>
        <p className="body-text" style={{ fontSize: '1.05rem' }}>
          If GnosisDAO had deployed <strong style={{ color: 'var(--accent)' }}>{fmt(totalCapital)}</strong> through
          EVRO on September 26, the protocol would have generated{' '}
          <strong style={{ color: '#A082F5', fontSize: '1.15em' }}>{fmtEurSigned(t.evro)}</strong>{' '}
          in real yield over {t.totalDays} days — a{' '}
          <strong style={{ color: '#A082F5' }}>{t.annualizedEvro.toFixed(1)}% annualized</strong> return.
        </p>
        <p className="body-text" style={{ fontSize: '1.05rem', marginTop: '12px' }}>
          A standard Curve LP deploying the same capital would have earned{' '}
          <strong style={{ color: t.curvePnl < 0 ? '#F5889B' : '#4ADE80' }}>{fmtEurSigned(t.curvePnl)}</strong>
          {' '}— while believing they were profiting. The invisible{' '}
          <strong style={{ color: '#F5889B' }}>{fmtEur(t.lvrLeaked)}</strong>{' '}
          in MEV/LVR extraction ate their fees alive. Simply holding USD would have earned{' '}
          <strong style={{ color: '#95929E' }}>€0</strong>.
        </p>
        <p className="body-text" style={{ fontSize: '0.88rem', marginTop: '12px', color: 'var(--muted-foreground)' }}>
          Of EVRO's yield, <strong>{fmtEur(t.daoRevenue)}</strong> flows to the DAO
          via the interestRouter — available for governance, operations, dev funding, or treasury accumulation.
        </p>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(160,130,245,0.15), rgba(160,130,245,0.08))'
                : 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted-foreground)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Yield Accumulation ─────────────────────── */}
      {activeTab === 'yield' && (
        <>
          {/* The Money Chart */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <p className="label" style={{ marginBottom: '4px' }}>Cumulative P&L — {t.totalDays} Days of Real Market Data</p>
            <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
              The purple area is your stacked EVRO yield. The pink line is what a Curve LP actually earned after MEV extraction.
            </p>
            <div style={{ height: '360px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 16, right: 16, top: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="borrowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A082F5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#A082F5" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="sdaiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7176CA" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7176CA" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="stakeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CB1F4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#9CB1F4" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="cowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EFA960" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EFA960" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="lvrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4ADE80" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
                  <YAxis
                    tickFormatter={(v: number) => fmtEur(v)}
                    tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: unknown, name: unknown) => [fmtEur(Number(value)), String(name)]}
                    contentStyle={tooltipStyle}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <ReferenceLine y={0} stroke="rgba(160,160,160,0.3)" strokeDasharray="4 4" />

                  {/* Stacked EVRO yield layers */}
                  <Area type="monotone" dataKey="Borrowing Interest" stackId="evro" stroke="#A082F5" fill="url(#borrowGrad)" strokeWidth={0} />
                  <Area type="monotone" dataKey="sDAI Yield" stackId="evro" stroke="#7176CA" fill="url(#sdaiGrad)" strokeWidth={0} />
                  <Area type="monotone" dataKey="Staking Yield" stackId="evro" stroke="#9CB1F4" fill="url(#stakeGrad)" strokeWidth={0} />
                  <Area type="monotone" dataKey="CoW AMM Fees" stackId="evro" stroke="#EFA960" fill="url(#cowGrad)" strokeWidth={0} />
                  <Area type="monotone" dataKey="LVR Captured" stackId="evro" stroke="#4ADE80" fill="url(#lvrGrad)" strokeWidth={0} />

                  {/* Total EVRO line on top */}
                  <Line type="monotone" dataKey="evroTotal" stroke="#A082F5" strokeWidth={2.5} dot={false} name="EVRO Total" />

                  {/* Comparison lines */}
                  <Line type="monotone" dataKey="curveTrue" stroke="#F5889B" strokeWidth={1.5} dot={false} name="Curve LP (True)" />
                  <Line type="monotone" dataKey="hodlEth" stroke="#7176CA" strokeWidth={1} dot={false} name="HODL ETH" strokeDasharray="4 3" />
                  <Line type="monotone" dataKey="hodlUsd" stroke="rgba(160,160,160,0.3)" strokeWidth={1} dot={false} name="HODL USD" strokeDasharray="6 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '14px' }}>
              {[
                { label: 'Borrowing Interest', color: '#A082F5' },
                { label: 'sDAI Yield', color: '#7176CA' },
                { label: 'Staking', color: '#9CB1F4' },
                { label: 'CoW Fees', color: '#EFA960' },
                { label: 'LVR Captured', color: '#4ADE80' },
                { label: 'Curve LP', color: '#F5889B' },
                { label: 'HODL ETH', color: '#7176CA', dashed: true },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: 14, height: 0,
                    borderTop: `2.5px ${'dashed' in d && d.dashed ? 'dashed' : 'solid'} ${d.color}`,
                  }} />
                  <span className="label-sm">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Monthly P&L Ledger ──────────────────────── */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <p className="label" style={{ marginBottom: '16px' }}>Monthly P&L — Financial Ledger</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th style={{ textAlign: 'right' }}>Interest</th>
                    <th style={{ textAlign: 'right' }}>sDAI</th>
                    <th style={{ textAlign: 'right' }}>Staking</th>
                    <th style={{ textAlign: 'right' }}>CoW Fees</th>
                    <th style={{ textAlign: 'right', fontWeight: 700 }}>EVRO Total</th>
                    <th style={{ textAlign: 'right' }}>Curve LP</th>
                    <th style={{ textAlign: 'right' }}>DAO (25%)</th>
                    <th style={{ textAlign: 'right' }}>Avg Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {result.months.map((m, i) => (
                    <tr key={i}>
                      <td><strong>{m.month}</strong></td>
                      <td className="value">{fmtEur(m.borrowingInterest)}</td>
                      <td className="value">{fmtEur(m.sdaiYield)}</td>
                      <td className="value">{fmtEur(m.stakingYield)}</td>
                      <td className="value">{fmtEur(m.cowFees)}</td>
                      <td className="value" style={{ color: '#A082F5', fontWeight: 700 }}>{fmtEurSigned(m.evroTotal)}</td>
                      <td className="value" style={{ color: m.curvePnl < 0 ? '#F5889B' : '#4ADE80' }}>{fmtEurSigned(m.curvePnl)}</td>
                      <td className="value" style={{ color: '#EFA960' }}>{fmtEur(m.daoRevenue)}</td>
                      <td className="value">{(m.avgAaveRate * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ borderTop: '2px solid rgba(160,130,245,0.2)', fontWeight: 700 }}>
                    <td><strong>Total</strong></td>
                    <td className="value">{fmtEur(t.borrowingInterest)}</td>
                    <td className="value">{fmtEur(t.sdaiYield)}</td>
                    <td className="value">{fmtEur(t.stakingYield)}</td>
                    <td className="value">{fmtEur(t.cowFees)}</td>
                    <td className="value" style={{ color: '#A082F5', fontSize: '1.1em' }}>{fmtEurSigned(t.evro)}</td>
                    <td className="value" style={{ color: t.curvePnl < 0 ? '#F5889B' : '#4ADE80' }}>{fmtEurSigned(t.curvePnl)}</td>
                    <td className="value" style={{ color: '#EFA960' }}>{fmtEur(t.daoRevenue)}</td>
                    <td className="value">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Tab: Interest Router ────────────────────────── */}
      {activeTab === 'router' && (
        <>
          <div style={{ marginBottom: '24px', lineHeight: 1.85 }}>
            <p className="body-text" style={{ fontSize: '1.0rem' }}>
              25% of all borrowing interest flows to the <strong>interestRouter</strong> — a
              governance-controlled splitter. The DAO decides how to allocate this stream.
              Over {t.totalDays} days, <strong style={{ color: '#EFA960' }}>{fmtEur(t.daoRevenue)}</strong> would
              have accumulated for distribution.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <p className="label" style={{ marginBottom: '16px' }}>DAO Revenue Distribution — Cumulative</p>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={routerData} margin={{ left: 16, right: 16, top: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
                  <YAxis tickFormatter={(v: number) => fmtEur(v)} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: unknown, name: unknown) => [fmtEur(Number(value)), String(name)]} contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="Governance Boost" stackId="1" stroke="#A082F5" fill="rgba(160,130,245,0.2)" strokeWidth={0} />
                  <Area type="monotone" dataKey="Treasury Reserve" stackId="1" stroke="#EFA960" fill="rgba(239,169,96,0.15)" strokeWidth={0} />
                  <Area type="monotone" dataKey="Ops Fund" stackId="1" stroke="#7176CA" fill="rgba(113,118,202,0.15)" strokeWidth={0} />
                  <Area type="monotone" dataKey="Dev Fund" stackId="1" stroke="#4ADE80" fill="rgba(74,222,128,0.15)" strokeWidth={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
              {[
                { label: 'Governance Boost (50%)', color: '#A082F5' },
                { label: 'Treasury (25%)', color: '#EFA960' },
                { label: 'Operations (15%)', color: '#7176CA' },
                { label: 'Dev Fund (10%)', color: '#4ADE80' },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 12, height: 8, borderRadius: 2, background: d.color, opacity: 0.6 }} />
                  <span className="label-sm">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Router breakdown table */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <p className="label" style={{ marginBottom: '16px' }}>Router Allocation — {t.totalDays}-Day Accumulation</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th style={{ textAlign: 'right' }}>Share</th>
                  <th style={{ textAlign: 'right' }}>Accumulated</th>
                  <th style={{ textAlign: 'right' }}>Annualized</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Governance Boost', share: '50%', value: t.daoRevenue * 0.50, color: '#A082F5' },
                  { name: 'Treasury Reserve', share: '25%', value: t.daoRevenue * 0.25, color: '#EFA960' },
                  { name: 'Operations Fund', share: '15%', value: t.daoRevenue * 0.15, color: '#7176CA' },
                  { name: 'Dev Fund', share: '10%', value: t.daoRevenue * 0.10, color: '#4ADE80' },
                ].map(r => (
                  <tr key={r.name}>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
                      <strong>{r.name}</strong>
                    </span></td>
                    <td className="value">{r.share}</td>
                    <td className="value" style={{ color: r.color }}>{fmtEur(r.value)}</td>
                    <td className="value">{fmtEur(r.value / (t.totalDays / 365))}/yr</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid rgba(160,130,245,0.2)', fontWeight: 700 }}>
                  <td><strong>Total DAO Revenue</strong></td>
                  <td className="value">25%</td>
                  <td className="value" style={{ color: '#EFA960' }}>{fmtEur(t.daoRevenue)}</td>
                  <td className="value">{fmtEur(t.daoRevenue / (t.totalDays / 365))}/yr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
