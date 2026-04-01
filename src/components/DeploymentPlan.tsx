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
  incentivesToLps: boolean;
  onToggleIncentives: (val: boolean) => void;
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
  incentivesToLps, onToggleIncentives,
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

    const spShare = incentivesToLps ? totalInterest * 0.75 + totalInterest * 0.25 : totalInterest * 0.75;
    const daoShare = incentivesToLps ? 0 : totalInterest * 0.25;
    const spApr = totalMinted > 0 ? (spShare / totalMinted) * 100 : 0;

    return { branches, totalMinted, totalInterest, spShare, daoShare, spApr };
  }, [branchStates, totalCapital, totalWeight, incentivesToLps]);

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>Deployment Plan</div>
      <h2 className="heading-lg" style={{ marginBottom: '8px' }}>
        {get('simulator', 'title')}
      </h2>
      <p className="body-text" style={{ marginBottom: '8px' }}>
        {get('simulator', 'body')}
      </p>
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
        <div className="glass-card" style={{ padding: '16px 20px', flex: '0 0 30%', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="label" style={{ fontSize: '0.65rem' }}>Capital</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>{fmt(totalCapital)}</span>
          </div>
          <input
            type="range" min={1_000_000} max={25_000_000} step={500_000}
            value={totalCapital}
            onChange={e => onCapitalChange(Number(e.target.value))}
            style={{ margin: 0 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '12px' }}>
            <span className="label-sm" style={{ fontSize: '0.55rem' }}>€1M</span>
            <span className="label-sm" style={{ fontSize: '0.55rem' }}>€25M</span>
          </div>

          <div style={{ borderTop: '1px solid rgba(160,130,245,0.06)', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="label" style={{ fontSize: '0.65rem' }}>Posture</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600,
                color: posture < 0.35 ? '#4ADE80' : posture > 0.65 ? '#F5889B' : '#A082F5',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span className="label-sm" style={{ fontSize: '0.55rem', color: '#4ADE80' }}>Conservative</span>
              <span className="label-sm" style={{ fontSize: '0.55rem', color: '#F5889B' }}>Aggressive</span>
            </div>
          </div>
        </div>

        {/* ── Output Summary (70%) ── */}
        <div className="glass-card" style={{ padding: '20px 24px', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Headline: APY */}
          <div style={{ marginBottom: '16px' }}>
            <span className="label" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '4px' }}>Annualized Yield</span>
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 700,
              color: '#A082F5', lineHeight: 1,
            }}>
              {yieldTotals.annualizedPct.toFixed(1)}%
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted-foreground)', marginLeft: '8px' }}>
              on {fmt(totalCapital)}
            </span>
          </div>

          {/* Total Yield */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '8px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>Total yield ({yieldTotals.totalDays}d)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: '#4ADE80' }}>+{fmtCompact(yieldTotals.evroTotal)}</span>
          </div>

          {/* Interest cost */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '8px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>Interest cost</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: '#F5889B' }}>−{fmtCompact(results.totalInterest)}</span>
          </div>

          {/* Net */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '10px 0 0', borderTop: '1px solid rgba(160,130,245,0.15)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: 'var(--foreground)' }}>Net revenue</span>
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700,
              color: (yieldTotals.evroTotal - results.totalInterest) > 0 ? '#4ADE80' : '#F5889B',
            }}>
              {(yieldTotals.evroTotal - results.totalInterest) > 0 ? '+' : ''}{fmtCompact(yieldTotals.evroTotal - results.totalInterest)}
            </span>
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

      {/* ── Results ─────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: '28px 32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p className="label">Fee Structure (Interest Only)</p>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted-foreground)',
          }}>
            <span>First Era: All incentives → LPs</span>
            <div
              onClick={() => onToggleIncentives(!incentivesToLps)}
              style={{
                width: 36, height: 20, borderRadius: 10, position: 'relative',
                background: incentivesToLps
                  ? 'linear-gradient(135deg, #A082F5, #7176CA)'
                  : 'rgba(160,130,245,0.15)',
                transition: 'all 0.2s ease', cursor: 'pointer',
                border: '1px solid rgba(160,130,245,0.2)',
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff', position: 'absolute', top: 1,
                left: incentivesToLps ? 17 : 1,
                transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }} />
            </div>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <div className="label-sm" style={{ marginBottom: '6px' }}>Total EVRO Minted</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)' }}>
              {fmtCompact(results.totalMinted)}
            </div>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom: '6px' }}>Annual Interest Income</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--foreground)' }}>
              {fmtCompact(results.totalInterest)}
              <span style={{ fontSize: '0.55em', color: 'var(--muted-foreground)', marginLeft: '4px' }}>/yr</span>
            </div>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom: '6px' }}>
              Stability Pool (75%{incentivesToLps ? ' + 25% incentives' : ''})
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: '#A082F5' }}>
              {fmtCompact(results.spShare)}
              <span style={{ fontSize: '0.55em', color: 'var(--muted-foreground)', marginLeft: '4px' }}>/yr</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#A082F5', marginTop: '4px' }}>
              ≈ {results.spApr.toFixed(2)}% APR on minted EVRO
            </div>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom: '6px' }}>DAO Revenue (25%)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700, color: incentivesToLps ? 'var(--muted-foreground)' : '#EFA960' }}>
              {incentivesToLps ? (
                <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>{fmtCompact(results.totalInterest * 0.25)}</span>
              ) : (
                <>{fmtCompact(results.daoShare)}<span style={{ fontSize: '0.55em', color: 'var(--muted-foreground)', marginLeft: '4px' }}>/yr</span></>
              )}
            </div>
            {incentivesToLps && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#A082F5', marginTop: '4px' }}>
                → Redirected to SP stakers in First Era
              </div>
            )}
          </div>
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
          {incentivesToLps ? (
            <> In the First Era, <strong style={{ color: '#A082F5' }}>100%</strong> of interest income flows to Stability Pool stakers — earning <strong style={{ color: '#A082F5' }}>{results.spApr.toFixed(2)}% APR</strong>.</>
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
