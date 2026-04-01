import { useMemo } from 'react';
import { BRANCHES, fmt, fmtCompact, fmtPct } from '../data/branches';
import type { Branch } from '../data/branches';
import { get } from '../data/content';
import type { BranchState } from '../App';

import type { YieldResult } from '../data/yield-engine';

interface DeploymentPlanProps {
  totalCapital: number;
  onCapitalChange: (val: number) => void;
  branchStates: Record<string, BranchState>;
  onUpdateBranch: (id: string, field: keyof BranchState, delta: number) => void;
  incentiveShare: number;
  onIncentiveChange: (val: number) => void;
  posture: number;
  onPostureChange: (val: number) => void;
  yieldTotals: YieldResult['totals'];
}

const STEP_WEIGHT = 0.01;
const STEP_CR = 0.05;
const STEP_RATE = 0.005;

function Stepper({ value, onUp, onDown, format }: {
  value: number;
  onUp: () => void;
  onDown: () => void;
  format: (v: number) => string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <button
        onClick={onDown}
        style={{
          width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(160,130,245,0.2)',
          background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(160,130,245,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >▾</button>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600,
        minWidth: '52px', textAlign: 'center', color: 'var(--foreground)',
      }}>
        {format(value)}
      </span>
      <button
        onClick={onUp}
        style={{
          width: 22, height: 22, borderRadius: 4, border: '1px solid rgba(160,130,245,0.2)',
          background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(160,130,245,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >▴</button>
    </div>
  );
}

export function DeploymentPlan({
  totalCapital, onCapitalChange,
  branchStates, onUpdateBranch,
  incentiveShare, onIncentiveChange,
  posture, onPostureChange,
  yieldTotals,
}: DeploymentPlanProps) {

  const totalWeight = Object.values(branchStates).reduce((s, b) => s + b.weight, 0);

  const results = useMemo(() => {
    let totalMinted = 0;
    let totalInterest = 0;

    const branches = BRANCHES.map((branch: Branch) => {
      const state = branchStates[branch.id];
      const normalizedWeight = totalWeight > 0 ? state.weight / totalWeight : 0;
      const allocated = totalCapital * normalizedWeight;
      const minted = allocated / state.cr;
      const interest = minted * state.rate;
      totalMinted += minted;
      totalInterest += interest;

      return {
        ...branch,
        normalizedWeight,
        allocated,
        minted,
        interest,
        cr: state.cr,
        rate: state.rate,
        rawWeight: state.weight,
        buffer: state.cr - branch.minMCR,
      };
    });

    const spExtra = totalInterest * 0.25 * incentiveShare;
    const spShare = totalInterest * 0.75 + spExtra;
    const daoShare = totalInterest * 0.25 * (1 - incentiveShare);
    const spApr = totalMinted > 0 ? (spShare / totalMinted) * 100 : 0;

    return { branches, totalMinted, totalInterest, spShare, daoShare, spApr };
  }, [branchStates, totalCapital, totalWeight, incentiveShare]);

  // Layer 2: proportional split — 35/35/18/12% derived from genesis plan at conservative CR.
  // Reserve is always the smallest allocation and always > 0.
  const { totalMinted } = results;
  const spAlloc     = totalMinted * 0.35;
  const anchorAlloc = totalMinted * 0.35;
  const bridgeAlloc = totalMinted * 0.18;
  const reserveAlloc = totalMinted * 0.12;

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Deployment Plan</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('simulator', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '8px' }}>
        {get('simulator', 'body')}
      </p>
      {get('simulator', 'methodology') && (
        <p className="body-text" style={{ marginBottom: '8px', fontSize: '0.82rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          {get('simulator', 'methodology')}
        </p>
      )}
      {get('simulator', 'cr-strategy') && (
        <p className="body-text" style={{ marginBottom: '8px', fontSize: '0.88rem' }}
           dangerouslySetInnerHTML={{ __html: get('simulator', 'cr-strategy').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      )}
      {get('simulator', 'rate-strategy') && (
        <p className="body-text" style={{ marginBottom: '24px', fontSize: '0.88rem' }}
           dangerouslySetInnerHTML={{ __html: get('simulator', 'rate-strategy').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
      )}

      {/* ── Controls + Output Row ── */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'stretch' }}>
        {/* ── Controls (30%) ── */}
        <div className="glass-card" style={{ padding: '14px 18px', flex: '0 0 30%', minWidth: 0 }}>
          {/* Capital */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span className="label" style={{ fontSize: '0.6rem' }}>Capital</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{fmt(totalCapital)}</span>
          </div>
          <input
            type="range" min={1_000_000} max={25_000_000} step={500_000}
            value={totalCapital}
            onChange={e => onCapitalChange(Number(e.target.value))}
            style={{ margin: 0 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', marginBottom: '8px' }}>
            <span className="label-sm" style={{ fontSize: '0.5rem' }}>€1M</span>
            <span className="label-sm" style={{ fontSize: '0.5rem' }}>€25M</span>
          </div>

          {/* Posture */}
          <div style={{ borderTop: '1px solid rgba(160,130,245,0.06)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="label" style={{ fontSize: '0.6rem' }}>Posture</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                color: posture < 0.35 ? '#9CB1F4' : posture > 0.65 ? '#EFA960' : '#A082F5',
              }}>
                {posture < 0.35 ? 'Conservative' : posture > 0.65 ? 'Aggressive' : 'Balanced'}
              </span>
            </div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={posture}
              onChange={e => onPostureChange(Number(e.target.value))}
              style={{ margin: 0 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span className="label-sm" style={{ fontSize: '0.5rem', color: '#9CB1F4' }}>↑ CR ↓ Rate</span>
              <span className="label-sm" style={{ fontSize: '0.5rem', color: '#EFA960' }}>↓ CR ↑ Rate</span>
            </div>
          </div>

          {/* Interest Router */}
          <div style={{ borderTop: '1px solid rgba(160,130,245,0.06)', paddingTop: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="label" style={{ fontSize: '0.6rem' }}>Interest Router</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                color: incentiveShare > 0.65 ? '#EFA960' : incentiveShare < 0.35 ? '#9CB1F4' : '#A082F5',
              }}>
                {incentiveShare < 0.15 ? '25% DAO' : incentiveShare > 0.85 ? 'All LPs' : `${Math.round((1 - incentiveShare) * 25)}% DAO`}
              </span>
            </div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={incentiveShare}
              onChange={e => onIncentiveChange(Number(e.target.value))}
              style={{ margin: 0 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span className="label-sm" style={{ fontSize: '0.5rem', color: '#9CB1F4' }}>DAO</span>
              <span className="label-sm" style={{ fontSize: '0.5rem', color: '#EFA960' }}>LPs</span>
            </div>
          </div>
        </div>

        {/* ── Output Summary (70%) ── */}
        <div className="glass-card" style={{ padding: '20px 24px', flex: 1, minWidth: 0, display: 'flex', gap: '20px' }}>
          {/* Left: Gnosis position KPIs */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Headline: APY */}
            <div style={{ marginBottom: '14px' }}>
              <span className="label" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '4px' }}>Annualized Yield</span>
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 700,
                color: '#A082F5', lineHeight: 1,
              }}>
                {yieldTotals.annualizedPct.toFixed(1)}%
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)', marginTop: '6px', lineHeight: 1.7 }}>
                SP yield · Collateral staking · CoW AMM fees
              </div>
            </div>

            {/* LP position yield (what Gnosis earns) */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '8px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>LP position ({yieldTotals.totalDays}d)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: '#A082F5' }}>+{fmtCompact(yieldTotals.evroTotal)}</span>
            </div>

            {/* DAO fee — the only real cost that leaves Gnosis */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '8px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>DAO fee ({Math.round((1 - incentiveShare) * 25)}%)</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>−{fmtCompact(yieldTotals.daoRevenue)}</span>
            </div>

            {/* Net to Gnosis */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '10px 0 0', borderTop: '1px solid rgba(160,130,245,0.15)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: 'var(--foreground)' }}>Net to Gnosis</span>
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700,
                color: '#EFA960',
              }}>
                {(yieldTotals.evroTotal - yieldTotals.daoRevenue) > 0 ? '+' : ''}{fmtCompact(yieldTotals.evroTotal - yieldTotals.daoRevenue)}
              </span>
            </div>
          </div>

          {/* Right: capital deployment map */}
          <div style={{ flex: 1, borderLeft: '1px solid rgba(160,130,245,0.06)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="label" style={{ fontSize: '0.55rem', display: 'block', marginBottom: '10px' }}>Capital Map</span>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>Collateral locked</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)' }}>{fmtCompact(totalCapital)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>EVRO minted</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>{fmtCompact(results.totalMinted)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#A082F5' }}>　→ Stability Pool</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#A082F5' }}>{fmtCompact(spAlloc)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#7176CA' }}>　→ Anchor · CoW AMM</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#7176CA' }}>{fmtCompact(anchorAlloc)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#EFA960' }}>　→ Bridge · Curve · EURe/EVRO</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#EFA960' }}>{fmtCompact(bridgeAlloc)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>　→ Reserve · operational buffer</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>{fmtCompact(reserveAlloc)}</span>
            </div>

          </div>
        </div>
      </div>

      {/* ── Branch Allocation Table ─────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '8px' }}>Branch Allocation</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Use the arrows to adjust weights, collateral ratios, and interest rates per branch.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '780px' }}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Branch</th>
                <th style={{ textAlign: 'center' }}>Weight</th>
                <th style={{ textAlign: 'right' }}>Capital</th>
                <th style={{ textAlign: 'center' }}>CR</th>
                <th style={{ textAlign: 'right' }}>Minted</th>
                <th style={{ textAlign: 'center' }}>Rate</th>
                <th style={{ textAlign: 'right' }}>Interest/yr</th>
                <th style={{ textAlign: 'center' }}>Buffer</th>
              </tr>
            </thead>
            <tbody>
              {results.branches.map(b => (
                <tr key={b.id}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                      <strong style={{ color: 'var(--foreground)' }}>{b.name}</strong>
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Stepper
                      value={b.rawWeight}
                      onUp={() => onUpdateBranch(b.id, 'weight', STEP_WEIGHT)}
                      onDown={() => onUpdateBranch(b.id, 'weight', -STEP_WEIGHT)}
                      format={v => `${(v * 100).toFixed(0)}%`}
                    />
                  </td>
                  <td className="value" style={{ textAlign: 'right' }}>{fmtCompact(b.allocated)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Stepper
                      value={b.cr}
                      onUp={() => onUpdateBranch(b.id, 'cr', STEP_CR)}
                      onDown={() => onUpdateBranch(b.id, 'cr', -STEP_CR)}
                      format={v => `${(v * 100).toFixed(0)}%`}
                    />
                  </td>
                  <td className="value" style={{ textAlign: 'right', color: 'var(--accent)' }}>{fmtCompact(b.minted)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Stepper
                      value={b.rate}
                      onUp={() => onUpdateBranch(b.id, 'rate', STEP_RATE)}
                      onDown={() => onUpdateBranch(b.id, 'rate', -STEP_RATE)}
                      format={v => `${(v * 100).toFixed(1)}%`}
                    />
                  </td>
                  <td className="value" style={{ textAlign: 'right' }}>{fmtCompact(b.interest)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600,
                      color: b.buffer < 0.15 ? 'var(--evro-pink)' : b.buffer < 0.30 ? 'var(--evro-orange)' : 'var(--evro-green)',
                    }}>
                      {fmtPct(b.buffer)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalWeight !== 1 && (
          <p style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--evro-orange)', fontFamily: 'var(--font-mono)' }}>
            Weights sum to {(totalWeight * 100).toFixed(0)}% — values are normalized to 100%.
          </p>
        )}
      </div>

      {/* ── Layer 2: Liquidity Allocation Table ─────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>Liquidity Pool Allocation — Layer 2</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          Minted EVRO deployed across three venues at fixed proportions.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '640px' }}>
            <thead>
              <tr>
                <th style={{ width: '160px' }}>Destination</th>
                <th>Pair / Venue</th>
                <th style={{ textAlign: 'right' }}>EVRO</th>
                <th style={{ textAlign: 'right' }}>% Minted</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {/* Stability Pool */}
              <tr>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#A082F5', flexShrink: 0 }} />
                    <strong style={{ color: 'var(--foreground)' }}>Stability Pool</strong>
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                  EVRO Protocol
                </td>
                <td className="value" style={{ textAlign: 'right', color: '#A082F5' }}>{fmtCompact(spAlloc)}</td>
                <td className="value" style={{ textAlign: 'right' }}>35%</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--evro-shark-400)', lineHeight: 1.45 }}>
                  Liquidation backstop · earns 75% of all Trove interest
                </td>
              </tr>
              {/* Anchor Pool — CoW AMM */}
              <tr>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7176CA', flexShrink: 0 }} />
                    <strong style={{ color: 'var(--foreground)' }}>Anchor Pool</strong>
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                  sDAI/EVRO · CoW AMM
                </td>
                <td className="value" style={{ textAlign: 'right', color: '#7176CA' }}>{fmtCompact(anchorAlloc)}</td>
                <td className="value" style={{ textAlign: 'right' }}>35%</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--evro-shark-400)', lineHeight: 1.45 }}>
                  FM-AMM primary depth · LVR surplus returned to LPs
                </td>
              </tr>
              {/* Bridge Pool — Curve */}
              <tr>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EFA960', flexShrink: 0 }} />
                    <strong style={{ color: 'var(--foreground)' }}>Bridge Pool</strong>
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                  EURe/EVRO · Curve StableSwap
                </td>
                <td className="value" style={{ textAlign: 'right', color: '#EFA960' }}>{fmtCompact(bridgeAlloc)}</td>
                <td className="value" style={{ textAlign: 'right' }}>18%</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--evro-shark-400)', lineHeight: 1.45 }}>
                  EURe ↔ EVRO retail routing · size-capped cost-center
                </td>
              </tr>
              {/* Operational Reserve */}
              <tr style={{ opacity: 0.75 }}>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--muted-foreground)', flexShrink: 0 }} />
                    <strong style={{ color: 'var(--foreground)' }}>Reserve</strong>
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
                  Operational buffer
                </td>
                <td className="value" style={{ textAlign: 'right', color: 'var(--muted-foreground)' }}>{fmtCompact(reserveAlloc)}</td>
                <td className="value" style={{ textAlign: 'right' }}>12%</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--evro-shark-400)', lineHeight: 1.45 }}>
                  Held undeployed · available for rebalancing or new venues
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Reactive Prose ──────────────────────────────── */}
      <div style={{
        padding: '20px 24px', borderRadius: '8px',
        background: 'linear-gradient(135deg, rgba(160,130,245,0.04), rgba(239,169,96,0.04))',
        border: '1px solid rgba(160,130,245,0.08)',
        lineHeight: 1.85,
      }}>
        <p className="body-text" style={{ fontSize: '0.92rem' }}>
          At <strong style={{ color: 'var(--accent)' }}>{fmt(totalCapital)}</strong> deployed,
          the protocol mints <strong>{fmtCompact(results.totalMinted)}</strong> EVRO across {results.branches.filter(b => b.allocated > 0).length} branches.
          Borrowers pay <strong>{fmtCompact(results.totalInterest)}</strong>/yr in interest
          at a blended rate of <strong>{results.totalMinted > 0 ? ((results.totalInterest / results.totalMinted) * 100).toFixed(1) : '0'}%</strong>.
          {incentiveShare > 0.85 ? (
            <> In the First Era, <strong style={{ color: '#A082F5' }}>100%</strong> of interest income flows to SP depositors (EVRO) — earning <strong style={{ color: '#A082F5' }}>{results.spApr.toFixed(2)}% APR</strong>.</>
          ) : (
            <> <strong style={{ color: '#A082F5' }}>{fmtCompact(results.spShare)}</strong>/yr flows to SP stakers ({results.spApr.toFixed(2)}% APR).{' '}
            <strong style={{ color: '#EFA960' }}>{fmtCompact(results.daoShare)}</strong>/yr goes to the DAO via the interestRouter.</>
          )}
          {' '}<em style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>This is interest only. The full revenue replay below adds collateral yields, LP fees, and liquidation gains from real market data.</em>
        </p>
      </div>
    </section>
  );
}
