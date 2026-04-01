import {
  AreaChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import type { YieldResult } from '../data/yield-engine';

interface BranchAlloc {
  id: string;
  weight: number;
  cr: number;
  rate: number;
}

interface RevenueReplayProps {
  totalCapital: number;
  branches: BranchAlloc[];
  incentiveShare: number;
  yieldResult: YieldResult;
}

const tooltipStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
  background: 'rgba(29,28,31,0.95)', border: '1px solid rgba(160,130,245,0.25)',
  borderRadius: '6px', color: '#E8E6ED',
};

const fmtEur = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `€${(v / 1_000).toFixed(1)}k`;
  return `€${v.toFixed(0)}`;
};

export function RevenueReplay({ totalCapital, incentiveShare, yieldResult }: RevenueReplayProps) {
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
    'DAO Revenue': d.daoRevenue,
    evroTotal: d.evroTotal,
    boldApy: d.boldSpApy,
  }));

  const t = result.totals;

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Revenue Replay</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {t.totalDays}-Day Historical Yield Simulation
      </h2>
      <p className="body-text" style={{ marginBottom: '24px' }}>
        This is not a projection. Every number below is computed from <strong>real market data</strong>:
        BOLD Stability Pool APY (interest + liquidation gains), sDAI/wstETH compounding ratios,
        CoW AMM settlement fees, and LVR surplus from batch auctions. The texture you see — the spikes,
        the calm stretches — is what actually happened on-chain.
      </p>

      {/* ── KPI row ──────────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
          {[
            { label: 'Total Yield', value: fmtEur(t.evroTotal), color: '#A082F5', sub: `${t.annualizedPct.toFixed(1)}% annualized` },
            { label: 'SP Yield (L1)', value: fmtEur(t.spYield), color: '#A082F5', sub: `Avg ${t.avgSpApy.toFixed(1)}% APY` },
            { label: 'Collateral (L2)', value: fmtEur(t.sdaiYield + t.stakingYield), color: '#7176CA', sub: 'sDAI + wstETH + GNO' },
            { label: 'LP Revenue (L3)', value: fmtEur(t.cowFees + t.lvrCaptured), color: '#EFA960', sub: 'CoW fees + LVR' },
            { label: 'DAO Share (L4)', value: incentiveShare > 0.85 ? '→ LPs' : fmtEur(t.daoRevenue), color: incentiveShare > 0.85 ? '#95929E' : '#4ADE80', sub: incentiveShare > 0.85 ? 'First Era' : '25% of interest' },
          ].map(kpi => (
            <div key={kpi.label}>
              <div className="label-sm" style={{ marginBottom: '6px' }}>{kpi.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: kpi.color }}>
                {kpi.value}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── The Money Chart ──────────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Cumulative Yield — All 4 Layers Stacked</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Each colored band represents a distinct revenue source. The purple top line is your total accumulated yield.
        </p>
        <div style={{ height: '360px' }}>
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
                <linearGradient id="daGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5889B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F5889B" stopOpacity={0.05} />
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
              {!(incentiveShare > 0.85) && (
                <Area type="monotone" dataKey="DAO Revenue" stackId="evro" stroke="#F5889B" fill="url(#daGrad)" strokeWidth={0} />
              )}

              <Line type="monotone" dataKey="evroTotal" stroke="#A082F5" strokeWidth={2.5} dot={false} name="Total" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '14px' }}>
          {[
            { label: 'SP Yield', color: '#A082F5' },
            { label: 'sDAI', color: '#7176CA' },
            { label: 'Staking', color: '#9CB1F4' },
            { label: 'CoW Fees', color: '#EFA960' },
            { label: 'LVR', color: '#4ADE80' },
            ...(!(incentiveShare > 0.85) ? [{ label: 'DAO', color: '#F5889B' }] : []),
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 8, borderRadius: 2, background: d.color, opacity: 0.6 }} />
              <span className="label-sm">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Agent Revenue & Opportunity Cost ──────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Who Earns What — Per Agent</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '20px', color: 'var(--muted-foreground)' }}>
          Every participant in the EVRO system earns revenue. This is how {fmtEur(totalCapital)} distributes itself over {t.totalDays} days.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* SP Staker */}
          <div style={{
            padding: '20px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(160,130,245,0.08), rgba(160,130,245,0.02))',
            border: '1px solid rgba(160,130,245,0.15)',
          }}>
            <div className="label-sm" style={{ marginBottom: '4px', color: '#A082F5' }}>◆ Stability Pool Staker</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: '#A082F5', marginBottom: '4px' }}>
              {fmtEur(t.spYield)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              Interest (75%) + liquidation gains<br/>
              {t.avgSpApy.toFixed(1)}% APY avg, real BOLD proxy
            </div>
          </div>
          {/* Collateral Provider */}
          <div style={{
            padding: '20px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(113,118,202,0.08), rgba(113,118,202,0.02))',
            border: '1px solid rgba(113,118,202,0.15)',
          }}>
            <div className="label-sm" style={{ marginBottom: '4px', color: '#7176CA' }}>◆ Collateral Provider</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: '#7176CA', marginBottom: '4px' }}>
              {fmtEur(t.sdaiYield + t.stakingYield)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              sDAI DSR: {fmtEur(t.sdaiYield)}<br/>
              wstETH + GNO staking: {fmtEur(t.stakingYield)}
            </div>
          </div>
          {/* LP Provider */}
          <div style={{
            padding: '20px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(239,169,96,0.08), rgba(239,169,96,0.02))',
            border: '1px solid rgba(239,169,96,0.15)',
          }}>
            <div className="label-sm" style={{ marginBottom: '4px', color: '#EFA960' }}>◆ Liquidity Provider</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: '#EFA960', marginBottom: '4px' }}>
              {fmtEur(t.cowFees + t.lvrCaptured)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              CoW AMM fees: {fmtEur(t.cowFees)}<br/>
              LVR surplus captured: {fmtEur(t.lvrCaptured)}
            </div>
          </div>
          {/* DAO / Interest Router */}
          <div style={{
            padding: '20px', borderRadius: '10px',
            background: incentiveShare > 0.85
              ? 'linear-gradient(135deg, rgba(160,130,245,0.05), rgba(160,130,245,0.01))'
              : 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(74,222,128,0.02))',
            border: `1px solid ${incentiveShare > 0.85 ? 'rgba(160,130,245,0.1)' : 'rgba(74,222,128,0.15)'}`,
          }}>
            <div className="label-sm" style={{ marginBottom: '4px', color: incentiveShare > 0.85 ? '#95929E' : '#4ADE80' }}>
              ◆ {incentiveShare > 0.85 ? 'DAO (First Era → LPs)' : 'DAO Treasury'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 700, color: incentiveShare > 0.85 ? '#95929E' : '#4ADE80', marginBottom: '4px' }}>
              {incentiveShare > 0.85 ? '→ LPs' : fmtEur(t.daoRevenue)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              25% of borrower interest<br/>
              {incentiveShare > 0.85 ? 'Redirected to LPs during bootstrap' : 'Via interestRouter to governance'}
            </div>
          </div>
        </div>

        {/* ── Opportunity Cost ──────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(160,130,245,0.1)', paddingTop: '20px' }}>
          <p className="label" style={{ marginBottom: '4px' }}>What If You Didn't Deploy With EVRO?</p>
          <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
            Same {fmtEur(totalCapital)}, same {t.totalDays} days. Real market data. What would have happened.
          </p>
          <table className="data-table" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th>Strategy</th>
                <th style={{ textAlign: 'right' }}>Return</th>
                <th style={{ textAlign: 'right' }}>Value</th>
                <th style={{ textAlign: 'right' }}>vs EVRO</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const periodFraction = t.totalDays / 365;
                const evroReturn = t.evroTotal;
                const strategies = [
                  {
                    name: '🟣 EVRO Deployment',
                    returnPct: t.annualizedPct * periodFraction,
                    value: totalCapital + evroReturn,
                    isEvro: true,
                  },
                  {
                    name: 'Hold EUR (bank account)',
                    returnPct: 0,
                    value: totalCapital,
                    isEvro: false,
                  },
                  {
                    name: 'sDAI (DSR only)',
                    returnPct: 1.1 * periodFraction,
                    value: totalCapital * (1 + 0.011 * periodFraction),
                    isEvro: false,
                  },
                  {
                    name: 'Aave EURe lending',
                    returnPct: 2.8 * periodFraction,
                    value: totalCapital * (1 + 0.028 * periodFraction),
                    isEvro: false,
                  },
                  {
                    name: 'Hold ETH',
                    returnPct: -43.5,
                    value: totalCapital * (1 - 0.435),
                    isEvro: false,
                  },
                  {
                    name: 'Hold GNO',
                    returnPct: -20.3,
                    value: totalCapital * (1 - 0.203),
                    isEvro: false,
                  },
                ];
                return strategies.map((s, i) => {
                  const delta = s.isEvro ? 0 : (evroReturn - (s.value - totalCapital));
                  return (
                    <tr key={i} style={s.isEvro ? {
                      background: 'rgba(160,130,245,0.06)',
                      borderLeft: '3px solid #A082F5',
                    } : {}}>
                      <td style={s.isEvro ? { fontWeight: 700, color: '#A082F5' } : {}}>
                        {s.name}
                      </td>
                      <td className="value" style={{
                        textAlign: 'right',
                        color: s.returnPct > 0 ? '#4ADE80' : s.returnPct < 0 ? '#F5889B' : 'var(--muted-foreground)',
                        fontWeight: s.isEvro ? 700 : 400,
                      }}>
                        {s.returnPct > 0 ? '+' : ''}{s.returnPct.toFixed(1)}%
                      </td>
                      <td className="value" style={{ textAlign: 'right', fontWeight: s.isEvro ? 700 : 400 }}>
                        {fmtEur(s.value)}
                      </td>
                      <td className="value" style={{
                        textAlign: 'right',
                        color: s.isEvro ? '#A082F5' : '#F5889B',
                        fontWeight: 600,
                      }}>
                        {s.isEvro ? '—' : `-${fmtEur(delta)}`}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
          <p style={{
            marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
            color: 'var(--muted-foreground)', lineHeight: 1.6,
          }}>
            ETH and GNO holders lost <strong style={{ color: '#F5889B' }}>real capital</strong> to market drawdowns.
            EUR holders earned nothing. Aave lenders earned a fraction.
            EVRO deployment <strong style={{ color: '#A082F5' }}>preserves capital + generates compound yield</strong> across 4 independent revenue layers.
          </p>
        </div>
      </div>

      {/* ── Reactive prose ──────────────────────────── */}
      <div style={{
        marginTop: '24px', padding: '20px 24px', borderRadius: '8px',
        background: 'linear-gradient(135deg, rgba(160,130,245,0.04), rgba(239,169,96,0.04))',
        border: '1px solid rgba(160,130,245,0.08)', lineHeight: 1.85,
      }}>
        <p className="body-text" style={{ fontSize: '0.92rem' }}>
          Over {t.totalDays} days of real market data, a <strong style={{ color: 'var(--accent)' }}>{fmtEur(totalCapital)}</strong> deployment
          would have generated <strong style={{ color: '#A082F5', fontSize: '1.1em' }}>{fmtEur(t.evroTotal)}</strong> in cumulative yield —
          a <strong style={{ color: '#A082F5' }}>{t.annualizedPct.toFixed(1)}% annualized</strong> return.
          The Stability Pool alone contributed <strong>{fmtEur(t.spYield)}</strong> (avg {t.avgSpApy.toFixed(1)}% APY, including liquidation gains).
          Collateral staking added <strong>{fmtEur(t.sdaiYield + t.stakingYield)}</strong>,
          and CoW AMM liquidity earned <strong>{fmtEur(t.cowFees + t.lvrCaptured)}</strong> in fees + LVR surplus.
          {!(incentiveShare > 0.85) && <> The DAO would have accumulated <strong style={{ color: '#4ADE80' }}>{fmtEur(t.daoRevenue)}</strong> via the interestRouter.</>}
        </p>
      </div>
    </section>
  );
}
