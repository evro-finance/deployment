import { useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Cell
} from 'recharts';
import { fmtCompact } from '../data/branches';
import { runComparison } from '../data/comparison';

interface ComparisonDashboardProps {
  totalCapital: number;
}

const tooltipStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
  background: 'rgba(29,28,31,0.95)',
  border: '1px solid rgba(160,130,245,0.25)',
  borderRadius: '6px',
  color: '#E8E6ED',
};

// Strategy colors
const COLORS = {
  curvePhantom: '#95929E',       // muted — the illusion
  curveTrue: '#F5889B',          // pink/red — the bleed
  evro: '#A081F5',               // purple — the thesis
  hodlUsd: 'rgba(160,160,160,0.4)', // faint gray baseline
  hodlEth: '#7176CA',            // blue — ETH comparison
  lvrLeak: '#F5889B',            // pink — LVR damage
  lvrSaved: '#4ADE80',           // green — LVR captured
  aaveRate: '#EFA960',           // orange — the rate texture
};

export function ComparisonDashboard({ totalCapital }: ComparisonDashboardProps) {
  const result = useMemo(() => runComparison(totalCapital), [totalCapital]);

  // Sample every 2nd day for performance
  const sampled = result.days.filter((_, i) => i % 2 === 0 || i === result.days.length - 1);
  const tickInterval = Math.floor(sampled.length / 7);

  // ── Chart 1: The Money Chart — Value of €1 Deployed ──
  const valueData = sampled.map(d => ({
    date: d.date.slice(5), // "MM-DD"
    'Curve (Advertised)': +(d.curveLpPhantom).toFixed(6),
    'Curve (True Yield)': +(d.curveLpTrue).toFixed(6),
    'EVRO + CoW AMM': +(d.evroCoWAmm).toFixed(6),
    'HODL USD': +(d.hodlUsd).toFixed(6),
    'HODL ETH': +(d.hodlEth).toFixed(6),
  }));

  // ── Chart 2: Aave Rate Texture ──
  const rateData = sampled.map(d => ({
    date: d.date.slice(5),
    rate: +(d.aaveBorrowRate * 100).toFixed(2),
  }));

  // ── Chart 3: HODL Delta Bars ──
  const deltaData = [
    { 
      name: 'Curve LP', 
      value: result.summary.curveTrueReturn, 
      color: COLORS.curveTrue 
    },
    { 
      name: 'HODL USD', 
      value: result.summary.hodlUsdReturn, 
      color: COLORS.hodlUsd 
    },
    { 
      name: 'HODL ETH', 
      value: result.summary.hodlEthReturn, 
      color: COLORS.hodlEth 
    },
    { 
      name: 'EVRO Protocol', 
      value: result.summary.evroFinalReturn, 
      color: COLORS.evro 
    },
  ];

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Historical Verification</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        What They Think They Earn vs. What They Actually Earn
      </h2>
      <p className="body-text" style={{ marginBottom: '24px' }}>
        {result.summary.totalDays} days of real Gnosis Chain data. Every line is driven by actual 
        on-chain volume, Aave borrow rates, and block-level settlement data from CoW Protocol.
      </p>

      {/* ── KPI Comparison Row ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-card stat-card" style={{ borderTop: `3px solid ${COLORS.curvePhantom}` }}>
          <span className="stat-label">Curve "Advertised"</span>
          <span className="stat-value" style={{ color: COLORS.curvePhantom }}>
            {result.summary.curveFinalReturn > 0 ? '+' : ''}{result.summary.curveFinalReturn.toFixed(2)}%
          </span>
          <span className="label-sm" style={{ marginTop: '4px' }}>Fees only</span>
        </div>
        <div className="glass-card stat-card" style={{ borderTop: `3px solid ${COLORS.curveTrue}` }}>
          <span className="stat-label">Curve TRUE Yield</span>
          <span className="stat-value" style={{ color: COLORS.curveTrue }}>
            {result.summary.curveTrueReturn > 0 ? '+' : ''}{result.summary.curveTrueReturn.toFixed(2)}%
          </span>
          <span className="label-sm" style={{ marginTop: '4px' }}>After MEV/LVR extraction</span>
        </div>
        <div className="glass-card stat-card" style={{ borderTop: `3px solid ${COLORS.evro}` }}>
          <span className="stat-label">EVRO + CoW AMM</span>
          <span className="stat-value" style={{ color: COLORS.evro }}>
            +{result.summary.evroFinalReturn.toFixed(2)}%
          </span>
          <span className="label-sm" style={{ marginTop: '4px' }}>
            ~{result.summary.annualizedEvro.toFixed(1)}% annualized
          </span>
        </div>
        <div className="glass-card stat-card" style={{ borderTop: `3px solid ${COLORS.lvrLeak}` }}>
          <span className="stat-label">LVR Leaked (Curve)</span>
          <span className="stat-value" style={{ color: COLORS.lvrLeak }}>
            -{fmtCompact(result.summary.totalLvrLeaked)}
          </span>
          <span className="label-sm" style={{ marginTop: '4px' }}>Hidden extraction</span>
        </div>
      </div>

      {/* ── The Money Chart ─────────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Value of €1 Deployed — {result.summary.totalDays} Days</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Five strategies, one chart. The gap between "Curve Advertised" and "Curve True" is the invisible tax.
          EVRO earns from borrowing demand — not from being exit liquidity.
        </p>
        <div className="chart-container" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={valueData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
              <YAxis 
                domain={['auto', 'auto']} 
                tickFormatter={(v: number) => `€${v.toFixed(3)}`}
                tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} 
                axisLine={false} tickLine={false} 
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [`€${Number(value).toFixed(4)}`, String(name)]}
                contentStyle={tooltipStyle}
              />
              <ReferenceLine y={1} stroke="rgba(160,160,160,0.3)" strokeDasharray="4 4" label={{ value: '€1.00', fontSize: 9, fill: '#95929E', position: 'right' }} />
              <Line type="monotone" dataKey="HODL USD" stroke={COLORS.hodlUsd} strokeWidth={1} dot={false} strokeDasharray="6 4" />
              <Line type="monotone" dataKey="HODL ETH" stroke={COLORS.hodlEth} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Curve (Advertised)" stroke={COLORS.curvePhantom} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="Curve (True Yield)" stroke={COLORS.curveTrue} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="EVRO + CoW AMM" stroke={COLORS.evro} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
          {[
            { label: 'EVRO + CoW AMM', color: COLORS.evro, style: 'solid' },
            { label: 'Curve Advertised', color: COLORS.curvePhantom, style: 'dashed' },
            { label: 'Curve TRUE', color: COLORS.curveTrue, style: 'solid' },
            { label: 'HODL ETH', color: COLORS.hodlEth, style: 'solid' },
            { label: 'HODL USD', color: COLORS.hodlUsd, style: 'dashed' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: 16, height: 0, 
                borderTop: `2.5px ${d.style} ${d.color}` 
              }} />
              <span className="label-sm">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Borrowing Rate Texture ──────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Aave EURe Borrow Rate — Market Proxy</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Liquity v2 borrowers set competitive rates. Aave's variable borrow APY is the benchmark they compete against.
          Spikes = volatility = higher borrowing demand = more protocol revenue.
        </p>
        <div className="chart-container" style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rateData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} interval={tickInterval} />
              <YAxis tickFormatter={(v: number) => `${v.toFixed(1)}%`} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value: unknown) => [`${Number(value).toFixed(2)}%`, 'Borrow APY']} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="rate" stroke={COLORS.aaveRate} fill="rgba(239,169,96,0.12)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── HODL Delta Comparison Bars ──────────────────── */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>HODL Delta — {result.summary.totalDays}-Day Return</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          What would €1 have earned in each strategy over the period? The sovereign test: LP vs. doing nothing.
        </p>
        <div className="chart-container" style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deltaData} layout="vertical" margin={{ left: 80, right: 40, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(160,130,245,0.06)" />
              <XAxis type="number" tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`} tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#95929E' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontFamily: 'var(--font-heading)', fill: '#E8E6ED', fontWeight: 500 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip formatter={(value: unknown) => [`${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)}%`, 'Return']} contentStyle={tooltipStyle} />
              <ReferenceLine x={0} stroke="rgba(160,160,160,0.3)" />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {deltaData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
