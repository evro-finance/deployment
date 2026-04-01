import { useMemo, type CSSProperties, type ReactNode } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BRANCHES,
  fmt,
  fmtCompact,
  fmtPct,
} from '../data/branches';
import type { Branch, L2Shares } from '../data/branches';
import { get, fillTemplate } from '../data/content';
import type { BranchState } from '../App';

import type { YieldResult } from '../data/yield-engine';
import { RevenueReplay } from './RevenueReplay';

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
  yieldResult: YieldResult;
  l2Shares: L2Shares;
  onAdjustL2Shares: (key: keyof L2Shares, target: number) => void;
  lpName: string;
}

const STEP_RATE = 0.005;

function mdBold(html: string) {
  return html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/** Row shape from compute block — single source for column renderers */
type BranchPlanRow = Branch & {
  normalizedWeight: number;
  allocated: number;
  minted: number;
  interest: number;
  cr: number;
  rate: number;
  rawWeight: number;
  buffer: number;
};

type BranchColumnAlign = 'left' | 'center' | 'right';

interface BranchTableColumn {
  id: string;
  header: string;
  align: BranchColumnAlign;
  headerStyle?: CSSProperties;
  tdClassName?: string;
  cell: (b: BranchPlanRow) => ReactNode;
}

/** Layer 2 venue row — reorder `layer2Rows` data to reorder rows; columns are `LAYER2_TABLE_COLUMNS` */
interface Layer2VenueRow {
  id: string;
  dotColor: string;
  name: string;
  pairVenue: string;
  evroValue: number;
  evroTextColor: string;
  pctMinted: string;
  role: string;
  rowOpacity?: number;
}

interface Layer2TableColumn {
  id: string;
  header: string;
  align: BranchColumnAlign;
  headerStyle?: CSSProperties;
  tdClassName?: string;
  cell: (row: Layer2VenueRow) => ReactNode;
}

/** Column layout for Layer 2 deploy table — headers from content.md `# deploy` */
function buildLayer2TableColumns(): Layer2TableColumn[] {
  return [
    {
      id: 'destination',
      header: get('deploy', 'l2-col-destination'),
      align: 'left',
      headerStyle: { width: '160px' },
      cell: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.dotColor, flexShrink: 0 }} />
          <strong style={{ color: 'var(--foreground)' }}>{row.name}</strong>
        </span>
      ),
    },
    {
      id: 'pair',
      header: get('deploy', 'l2-col-pair'),
      align: 'left',
      cell: (row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
          {row.pairVenue}
        </span>
      ),
    },
    {
      id: 'evro',
      header: get('deploy', 'l2-col-evro'),
      align: 'right',
      tdClassName: 'value',
      cell: (row) => (
        <span style={{ color: row.evroTextColor }}>{fmtCompact(row.evroValue)}</span>
      ),
    },
    {
      id: 'pct',
      header: get('deploy', 'l2-col-pct'),
      align: 'right',
      tdClassName: 'value',
      cell: (row) => row.pctMinted,
    },
    {
      id: 'role',
      header: get('deploy', 'l2-col-role'),
      align: 'left',
      cell: (row) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--evro-shark-400)', lineHeight: 1.45 }}>
          {row.role}
        </span>
      ),
    },
  ];
}

function Stepper({ value, onUp, onDown, format }: {
  value: number;
  onUp: () => void;
  onDown: () => void;
  format: (v: number) => string;
}) {
  return (
    <div className="stepper">
      <button type="button" className="stepper__btn" onClick={onDown} aria-label="Decrease">▾</button>
      <span className="stepper__value">{format(value)}</span>
      <button type="button" className="stepper__btn" onClick={onUp} aria-label="Increase">▴</button>
    </div>
  );
}

function BranchWeightPiePanel({
  rows,
  branchStates,
  onUpdateBranch,
}: {
  rows: BranchPlanRow[];
  branchStates: Record<string, BranchState>;
  onUpdateBranch: (id: string, field: keyof BranchState, delta: number) => void;
}) {
  const totalW = Object.values(branchStates).reduce((s, b) => s + b.weight, 0);
  const pieData = rows.map(b => ({
    id: b.id,
    name: b.name,
    value: Math.max(b.normalizedWeight * 100, 0.0001),
    fill: b.color,
  }));

  return (
    <div className="glass-card" style={{ padding: '16px 16px 18px', flex: '0 0 auto', width: 'min(100%, 280px)' }}>
      <p className="branch-weight-pie__caption">{get('deploy', 'branch-pie-caption')}</p>
      <div style={{ height: 200, width: '100%', marginBottom: 14 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={82}
              paddingAngle={2}
              stroke="rgba(29,28,31,0.08)"
              strokeWidth={1}
            >
              {pieData.map(entry => (
                <Cell key={entry.id} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => {
                const v = Array.isArray(value) ? value[0] : value;
                return [`${Number(v).toFixed(1)}%`, 'Share'];
              }}
              contentStyle={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                background: 'rgba(29,28,31,0.95)',
                border: '1px solid rgba(160,130,245,0.25)',
                borderRadius: 6,
                color: '#E8E6ED',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {rows.map(b => {
        const w = branchStates[b.id].weight;
        const pct = totalW > 0 ? (w / totalW) * 100 : 0;
        return (
          <div key={b.id} className="branch-weight-pie__slider-row">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} aria-hidden />
            <span className="branch-weight-pie__slider-label" title={b.name}>{b.name}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={w}
              onChange={e => {
                const v = Number(e.target.value);
                const cur = branchStates[b.id].weight;
                onUpdateBranch(b.id, 'weight', v - cur);
              }}
              aria-label={`${b.name} allocation weight`}
            />
            <span className="branch-weight-pie__slider-pct">{pct.toFixed(0)}%</span>
          </div>
        );
      })}
    </div>
  );
}

export function DeploymentPlan({
  totalCapital, onCapitalChange,
  branchStates, onUpdateBranch,
  incentiveShare, onIncentiveChange,
  posture, onPostureChange,
  yieldTotals,
  yieldResult,
  l2Shares,
  onAdjustL2Shares,
  lpName,
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

  const { totalMinted } = results;
  const spAlloc      = totalMinted * l2Shares.sp;
  const anchorAlloc  = totalMinted * l2Shares.anchor;
  const bridgeAlloc  = totalMinted * l2Shares.bridge;
  const reserveAlloc = totalMinted * l2Shares.reserve;

  /** Reorder this array to reorder columns — header + body stay in sync */
  const branchTableColumns = useMemo((): BranchTableColumn[] => [
    {
      id: 'branch',
      header: get('deploy', 'col-branch'),
      align: 'left',
      headerStyle: { width: '100px' },
      cell: (b) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
          <strong style={{ color: 'var(--foreground)' }}>{b.name}</strong>
        </span>
      ),
    },
    {
      id: 'weight',
      header: get('deploy', 'col-weight'),
      align: 'center',
      cell: (b) => (
        <span className="deploy-pill">
          {totalWeight > 0 ? `${((b.rawWeight / totalWeight) * 100).toFixed(0)}%` : '—'}
        </span>
      ),
    },
    {
      id: 'capital',
      header: get('deploy', 'col-capital'),
      align: 'right',
      tdClassName: 'value',
      cell: (b) => fmtCompact(b.allocated),
    },
    {
      id: 'cr',
      header: get('deploy', 'col-cr'),
      align: 'center',
      cell: (b) => (
        <span className="deploy-pill deploy-pill--cr">{`${(b.cr * 100).toFixed(0)}%`}</span>
      ),
    },
    {
      id: 'minted',
      header: get('deploy', 'col-minted'),
      align: 'right',
      tdClassName: 'value',
      cell: (b) => <span style={{ color: 'var(--accent)' }}>{fmtCompact(b.minted)}</span>,
    },
    {
      id: 'rate',
      header: get('deploy', 'col-rate'),
      align: 'center',
      cell: (b) => (
        <Stepper
          value={b.rate}
          onUp={() => onUpdateBranch(b.id, 'rate', STEP_RATE)}
          onDown={() => onUpdateBranch(b.id, 'rate', -STEP_RATE)}
          format={v => `${(v * 100).toFixed(1)}%`}
        />
      ),
    },
    {
      id: 'interest',
      header: get('deploy', 'col-interest'),
      align: 'right',
      tdClassName: 'value',
      cell: (b) => fmtCompact(b.interest),
    },
    {
      id: 'buffer',
      header: get('deploy', 'col-buffer'),
      align: 'center',
      cell: (b) => {
        const buf = b.buffer;
        const color = buf < 0.15 ? 'var(--evro-pink)' : buf < 0.30 ? 'var(--evro-orange)' : 'var(--evro-green)';
        const bg = buf < 0.15 ? 'rgba(245,136,155,0.06)' : buf < 0.30 ? 'rgba(239,169,96,0.06)' : 'rgba(74,222,128,0.06)';
        return (
          <span
            className="deploy-pill deploy-pill--buffer"
            style={{ color, borderColor: color, background: bg }}
          >
            {fmtPct(buf)}
          </span>
        );
      },
    },
  ], [onUpdateBranch, totalWeight]);

  /** Reorder this array to reorder Layer 2 rows — names/roles from content.md `# layer2` */
  const layer2Rows = useMemo((): Layer2VenueRow[] => [
    {
      id: 'sp',
      dotColor: 'var(--evro-purple)',
      name: get('layer2', 'sp-title'),
      pairVenue: get('layer2', 'sp-venue'),
      evroValue: spAlloc,
      evroTextColor: 'var(--evro-purple)',
      pctMinted: `${Math.round(l2Shares.sp * 100)}%`,
      role: get('layer2', 'sp-table-role'),
    },
    {
      id: 'anchor',
      dotColor: 'var(--evro-blue)',
      name: get('layer2', 'anchor-title'),
      pairVenue: `${get('layer2', 'anchor-pair')} · ${get('layer2', 'anchor-venue')}`,
      evroValue: anchorAlloc,
      evroTextColor: 'var(--evro-blue)',
      pctMinted: `${Math.round(l2Shares.anchor * 100)}%`,
      role: get('layer2', 'anchor-table-role'),
    },
    {
      id: 'bridge',
      dotColor: 'var(--evro-orange)',
      name: get('layer2', 'bridge-title'),
      pairVenue: `${get('layer2', 'bridge-pair')} · ${get('layer2', 'bridge-venue')}`,
      evroValue: bridgeAlloc,
      evroTextColor: 'var(--evro-orange)',
      pctMinted: `${Math.round(l2Shares.bridge * 100)}%`,
      role: get('layer2', 'bridge-table-role'),
    },
    {
      id: 'reserve',
      dotColor: 'var(--muted-foreground)',
      name: get('layer2', 'reserve-title'),
      pairVenue: get('layer2', 'reserve-venue'),
      evroValue: reserveAlloc,
      evroTextColor: 'var(--muted-foreground)',
      pctMinted: `${Math.round(l2Shares.reserve * 100)}%`,
      role: get('layer2', 'reserve-table-role'),
      rowOpacity: 0.75,
    },
  ], [spAlloc, anchorAlloc, bridgeAlloc, reserveAlloc, l2Shares]);

  const layer2Columns = buildLayer2TableColumns();

  return (
    <section className="section">
      <div className="label" style={{ marginBottom: '12px' }}>{get('deploy', 'section-label')}</div>
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
            <span className="label" style={{ fontSize: '0.6rem' }}>{get('deploy', 'capital-label')}</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>{fmt(totalCapital)}</span>
          </div>
          <input
            type="range" min={1_000_000} max={25_000_000} step={500_000}
            value={totalCapital}
            onChange={e => onCapitalChange(Number(e.target.value))}
            style={{ margin: 0 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', marginBottom: '8px' }}>
            <span className="label-sm" style={{ fontSize: '0.5rem' }}>{get('deploy', 'capital-min')}</span>
            <span className="label-sm" style={{ fontSize: '0.5rem' }}>{get('deploy', 'capital-max')}</span>
          </div>

          {/* Posture */}
          <div style={{ borderTop: '1px solid rgba(160,130,245,0.06)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="label" style={{ fontSize: '0.6rem' }}>{get('deploy', 'posture-label')}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                color: posture < 0.35 ? '#9CB1F4' : posture > 0.65 ? '#EFA960' : '#A081F5',
              }}>
                {posture < 0.35 ? get('deploy', 'posture-conservative') : posture > 0.65 ? get('deploy', 'posture-aggressive') : get('deploy', 'posture-balanced')}
              </span>
            </div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={posture}
              onChange={e => onPostureChange(Number(e.target.value))}
              style={{ margin: 0 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span className="label-sm" style={{ fontSize: '0.5rem', color: '#9CB1F4' }}>{get('deploy', 'posture-hint-left')}</span>
              <span className="label-sm" style={{ fontSize: '0.5rem', color: '#EFA960' }}>{get('deploy', 'posture-hint-right')}</span>
            </div>
          </div>

          {/* Interest Router */}
          <div style={{ borderTop: '1px solid rgba(160,130,245,0.06)', paddingTop: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="label" style={{ fontSize: '0.6rem' }}>{get('deploy', 'router-label')}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600,
                color: incentiveShare > 0.65 ? '#EFA960' : incentiveShare < 0.35 ? '#9CB1F4' : '#A081F5',
              }}>
                {incentiveShare < 0.15
                  ? get('deploy', 'router-summary-dao25')
                  : incentiveShare > 0.85
                    ? get('deploy', 'router-summary-all-lps')
                    : fillTemplate(get('deploy', 'router-summary-partial'), { pct: String(Math.round((1 - incentiveShare) * 25)) })}
              </span>
            </div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={incentiveShare}
              onChange={e => onIncentiveChange(Number(e.target.value))}
              style={{ margin: 0 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span className="label-sm" style={{ fontSize: '0.5rem', color: '#9CB1F4' }}>{get('deploy', 'router-end-dao')}</span>
              <span className="label-sm" style={{ fontSize: '0.5rem', color: '#EFA960' }}>{get('deploy', 'router-end-lps')}</span>
            </div>
          </div>
        </div>

        {/* ── Output Summary (70%) ── */}
        <div className="glass-card" style={{ padding: '20px 24px', flex: 1, minWidth: 0, display: 'flex', gap: '20px' }}>
          {/* Left: LP position KPIs */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Headline: APY */}
            <div style={{ marginBottom: '14px' }}>
              <span className="label" style={{ fontSize: '0.6rem', display: 'block', marginBottom: '4px' }}>{get('deploy', 'apy-label')}</span>
              <span style={{
                fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 700,
                color: '#A081F5', lineHeight: 1,
              }}>
                {yieldTotals.annualizedPct.toFixed(1)}%
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)', marginTop: '6px', lineHeight: 1.7 }}>
                {get('deploy', 'apy-footnote')}
              </div>
            </div>

            {/* LP position yield (what {lpName} earns) */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '8px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                {fillTemplate(get('deploy', 'lp-position-label'), { days: String(yieldTotals.totalDays) })}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: '#A081F5' }}>+{fmtCompact(yieldTotals.evroTotal)}</span>
            </div>

            {/* DAO fee — the only real cost that leaves {lpName} */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '8px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                {fillTemplate(get('deploy', 'dao-fee-label'), { pct: String(Math.round((1 - incentiveShare) * 25)) })}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>−{fmtCompact(yieldTotals.daoRevenue)}</span>
            </div>

            {/* Net to {lpName} */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '10px 0 0', borderTop: '1px solid rgba(160,130,245,0.15)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 600, color: 'var(--foreground)' }}>{get('deploy', 'net-lp-label')}</span>
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
            <span className="label" style={{ fontSize: '0.55rem', display: 'block', marginBottom: '10px' }}>{get('deploy', 'map-title')}</span>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{get('deploy', 'map-collateral')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)' }}>{fmtCompact(totalCapital)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{get('deploy', 'map-minted')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>{fmtCompact(results.totalMinted)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#A081F5' }}>{get('deploy', 'map-line-sp')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#A081F5' }}>{fmtCompact(spAlloc)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#7176CA' }}>{get('deploy', 'map-line-anchor')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#7176CA' }}>{fmtCompact(anchorAlloc)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#EFA960' }}>{get('deploy', 'map-line-bridge')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: '#EFA960' }}>{fmtCompact(bridgeAlloc)}</span>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '6px 0', borderTop: '1px solid rgba(160,130,245,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)' }}>{get('deploy', 'map-line-reserve')}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>{fmtCompact(reserveAlloc)}</span>
            </div>

          </div>
        </div>
      </div>

      {/* ── Branch Allocation Table ─────────────────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '8px' }}>{get('deploy', 'branch-title')}</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          {get('deploy', 'branch-hint')}
        </p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <BranchWeightPiePanel
            rows={results.branches}
            branchStates={branchStates}
            onUpdateBranch={onUpdateBranch}
          />
          <div style={{ flex: '1 1 320px', minWidth: 0, overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '520px' }}>
              <thead>
                <tr>
                  {branchTableColumns.map(col => (
                    <th
                      key={col.id}
                      style={{ textAlign: col.align, ...col.headerStyle }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.branches.map(b => (
                  <tr key={b.id}>
                    {branchTableColumns.map(col => (
                      <td
                        key={col.id}
                        className={col.tdClassName}
                        style={{ textAlign: col.align }}
                      >
                        {col.cell(b)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {totalWeight !== 1 && (
          <p style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--evro-orange)', fontFamily: 'var(--font-mono)' }}>
            {fillTemplate(get('deploy', 'weight-warning'), { pct: (totalWeight * 100).toFixed(0) })}
          </p>
        )}
      </div>

      <RevenueReplay
        embedded
        yieldResult={yieldResult}
        deployFlow={{
          branches: results.branches.map(b => ({
            id: b.id,
            name: b.name,
            color: b.color,
            allocated: b.allocated,
            minted: b.minted,
          })),
          totalMinted: results.totalMinted,
          l2Shares,
          onAdjustL2: onAdjustL2Shares,
          incentiveShare,
          lpName,
        }}
      />

      {/* ── Layer 2: Liquidity Allocation Table ─────────── */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <p className="label" style={{ marginBottom: '4px' }}>{get('deploy', 'l2-card-title')}</p>
        <p className="body-text" style={{ fontSize: '0.72rem', marginBottom: '16px', color: 'var(--muted-foreground)' }}>
          {get('deploy', 'l2-card-hint')}
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '640px' }}>
            <thead>
              <tr>
                {layer2Columns.map(col => (
                  <th
                    key={col.id}
                    style={{ textAlign: col.align, ...col.headerStyle }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {layer2Rows.map(row => (
                <tr key={row.id} style={{ opacity: row.rowOpacity ?? 1 }}>
                  {layer2Columns.map(col => (
                    <td
                      key={col.id}
                      className={col.tdClassName}
                      style={{ textAlign: col.align }}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Narrative Showcase — "The Reason We Got Dressed" ─ */}
      {(() => {
        // ─ Dynamic branch list (zero-weight branches excluded) ─
        const activeBranches = results.branches.filter(b => b.rawWeight > 0);
        const totalW = activeBranches.reduce((s, b) => s + b.rawWeight, 0);
        const branchListWithWeights = activeBranches
          .map(b => `<strong>${b.name}</strong> (${totalW > 0 ? Math.round((b.rawWeight / totalW) * 100) : 0}%)`)
          .join(', ');

        // ─ Collateral sources (only active branches) ─
        const hasSDai  = (branchStates['sdai']?.weight  ?? 0) > 0 || (branchStates['wxdai']?.weight ?? 0) > 0;
        const hasWstEth = (branchStates['wsteth']?.weight ?? 0) > 0;
        const hasOsGno  = (branchStates['osgno']?.weight  ?? 0) > 0 || (branchStates['gno']?.weight ?? 0) > 0;
        const hasWbtc   = (branchStates['wbtc']?.weight   ?? 0) > 0;
        const collateralPhrases: string[] = [];
        if (hasSDai)   collateralPhrases.push('sDAI compounded the Savings Rate');
        if (hasWstEth) collateralPhrases.push('wstETH accrued staking rewards');
        if (hasOsGno)  collateralPhrases.push('osGNO accrues validator income');
        if (hasWbtc)   collateralPhrases.push('wBTC held its collateral position');
        const collateralSources = collateralPhrases.length === 0
          ? 'the collateral held its position'
          : collateralPhrases.length === 1
            ? collateralPhrases[0]
            : collateralPhrases.slice(0, -1).join(', ') + ' and ' + collateralPhrases[collateralPhrases.length - 1];

        // ─ Reserve conditional sentence ─
        const reservePctVal = l2Shares.reserve;
        const reserveKey = reservePctVal < 0.02
          ? 'prose-reserve-low'
          : reservePctVal > 0.06
            ? 'prose-reserve-high'
            : 'prose-reserve-mid';
        const reserveSentence = mdBold(fillTemplate(get('deploy', reserveKey), {
          reserveEuro: fmtCompact(reserveAlloc),
        }));

        // ─ Posture label ─
        const postureLabel = posture < 0.35
          ? get('deploy', 'posture-conservative')
          : posture > 0.65
            ? get('deploy', 'posture-aggressive')
            : get('deploy', 'posture-balanced');

        // ─ Computed values ─
        const clientName = lpName;
        const collateralYield = yieldTotals.sdaiYield + yieldTotals.stakingYield;
        const cowYield = yieldTotals.cowFees + yieldTotals.lvrCaptured;
        const netLp = yieldTotals.evroTotal - yieldTotals.daoRevenue;

        return (
          <div
            className="narrative-showcase"
            ref={el => {
              if (!el) return;
              const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } },
                { threshold: 0.15 }
              );
              obs.observe(el);
            }}
          >
            {/* Section label */}
            <div className="narrative-showcase__label">
              Deployment Narrative · Historical Replay
            </div>

            {/* P1 — Opening Bet */}
            <p className="narrative-showcase__para"
              dangerouslySetInnerHTML={{ __html: mdBold(fillTemplate(get('deploy', 'prose-p1'), {
                clientName,
                capital: fmt(totalCapital),
                posture: postureLabel,
                branchCount: String(activeBranches.length),
                branchListWithWeights,
              })) }}
            />

            {/* P2 — Minting */}
            <p className="narrative-showcase__para"
              dangerouslySetInnerHTML={{ __html: mdBold(fillTemplate(get('deploy', 'prose-p2'), {
                minted: fmtCompact(results.totalMinted),
                blendedRate: results.totalMinted > 0
                  ? ((results.totalInterest / results.totalMinted) * 100).toFixed(1)
                  : '0',
                totalInterest: fmtCompact(results.totalInterest),
              })) }}
            />

            {/* P3 — Router Assumption */}
            <p className="narrative-showcase__para"
              dangerouslySetInnerHTML={{ __html: mdBold(fillTemplate(get('deploy', 'prose-p3'), {
                clientName,
                spShare: fmtCompact(results.spShare),
                spApr: results.spApr.toFixed(2),
                daoShare: fmtCompact(results.daoShare),
              })) }}
            />

            {/* P4 — Where EVRO Went */}
            <p className="narrative-showcase__para"
              dangerouslySetInnerHTML={{ __html:
                mdBold(fillTemplate(get('deploy', 'prose-p4-static'), {
                  minted: fmtCompact(results.totalMinted),
                  spEuro: fmtCompact(spAlloc),
                  spPct: Math.round(l2Shares.sp * 100),
                  anchorEuro: fmtCompact(anchorAlloc),
                  anchorPct: Math.round(l2Shares.anchor * 100),
                  bridgeEuro: fmtCompact(bridgeAlloc),
                  bridgePct: Math.round(l2Shares.bridge * 100),
                })) + ' ' + reserveSentence
              }}
            />

            {/* P5 — What Happened — accent border */}
            <p className="narrative-showcase__para narrative-showcase__para--yield"
              dangerouslySetInnerHTML={{ __html: mdBold(fillTemplate(get('deploy', 'prose-p5'), {
                spYield: fmtCompact(yieldTotals.spYield),
                collateralYield: fmtCompact(collateralYield),
                collateralSources,
                cowYield: fmtCompact(cowYield),
                redirectYield: fmtCompact(yieldTotals.redirectedToLp),
              })) }}
            />

            {/* Bottom Line — APY hero moment */}
            <div className="narrative-showcase__bottomline">
              <div className="narrative-showcase__bottomline-prose"
                dangerouslySetInnerHTML={{ __html: mdBold(fillTemplate(
                  'Add it up: <strong>{{lpTotal}}</strong> cumulative to <strong>{{clientName}}</strong> as liquidity provider. The protocol took <strong>{{daoRevenue}}</strong> for the DAO treasury.',
                  {
                    lpTotal: fmtCompact(yieldTotals.evroTotal),
                    clientName,
                    daoRevenue: fmtCompact(yieldTotals.daoRevenue),
                  }
                )) }}
              />
              <div className="narrative-showcase__apy-block">
                <span className="narrative-showcase__apy-label">Annualised</span>
                <span className="narrative-showcase__apy-value">
                  {yieldTotals.annualizedPct.toFixed(1)}%
                </span>
                <span className="narrative-showcase__net-label">Net to {lpName}</span>
                <span className="narrative-showcase__net-value">
                  +{fmtCompact(netLp)}
                </span>
              </div>
            </div>

            {/* Watermark illustration */}
            <div className="narrative-showcase__illu" aria-hidden>
              <svg viewBox="0 0 400 400" width="100%" height="100%">
                <path d="M 120 200 L 280 100" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M 120 200 L 290 200" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M 120 200 L 280 300" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="120" cy="200" r="14" fill="var(--evro-purple)" stroke="currentColor" strokeWidth="1" />
                <circle cx="280" cy="100" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="290" cy="200" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="280" cy="300" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
