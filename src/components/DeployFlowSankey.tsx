import { useCallback, useEffect, useMemo, useId } from 'react';
import evroTokenUrl from '../assets/evro-token.svg?url';
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  useEdgesState,
  useNodesState,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DISTRIBUTION_LABELS, type L2Shares } from '../data/branches';
import { ControlCheck } from './DeploymentPlan';

// ─── EVRO Palette (from tokens.css) ────────────────────────────────────────
const C = {
  purple:      '#A081F5',
  purpleLight: '#C6B8FA',
  purpleDeep:  '#8060D0',
  blue:        '#7176CA',
  blueLight:   '#9CB1F4',
  orange:      '#EFA960',
  pink:        '#F5889B',
  shark:       '#1D1C1F',
  muted:       '#95929E',
  pageBg:      '#F5F3FF',
  surface:     '#FFFFFF',
  border:      'rgba(160,129,245,0.15)',
  borderStrong:'rgba(160,129,245,0.30)',
} as const;

// ─── Layer spacing (Isolation Doctrine) ─────────────────────────────────────
// TIER 0: Capital node   — Y=0
// NEUTRAL ZONE          — Y=56..124 (pure space, no edges cross here)
// TIER 1: Minted EVRO   — Y=124
// NEUTRAL ZONE          — Y=172..212 (separation between debt & distribution)
// TIER 2: L2 venues     — Y=212
const TIER_CAPITAL = 0;
const TIER_MINT    = 132;
const TIER_L2      = 240;
const CANVAS_W     = 520;

// ─── Utilities ───────────────────────────────────────────────────────────────
function fmtEur(n: number): string {
  const v = Math.abs(n);
  if (v >= 1_000_000) return `€${(n / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `€${(n / 1_000).toFixed(1)}k`;
  return `€${n.toFixed(0)}`;
}

function strokeW(v: number, max: number, min = 2, mx = 10): number {
  if (max <= 0) return min;
  return min + Math.min(1, v / max) * (mx - min);
}

// ─── SVG Defs — energy filter + pulse keyframes ──────────────────────────────
function FlowDefs({ id }: { id: string }) {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ─── Energy Edge ─────────────────────────────────────────────────────────────
type EnergyEdgeData = {
  branchLabel?: string;
  accent: string;
  lane: number;
  laneCount: number;
  speed: number;   // animation duration in seconds — lower = faster = more volume
  glowId: string;
};

function EnergyEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style, markerStart, markerEnd, data,
}: EdgeProps<Edge<EnergyEdgeData, 'energy'>>) {
  const lane      = data?.lane ?? 0;
  const laneCount = Math.max(1, data?.laneCount ?? 1);
  const span      = Math.max(1, laneCount - 1);
  const curvature = 0.14 + (lane / span) * 0.42;
  const accent    = data?.accent ?? C.purple;
  const speed     = data?.speed  ?? 3;
  const glowId    = data?.glowId ?? '';
  const branchLabel = data?.branchLabel ?? '';

  const [path, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    curvature,
  });

  const cx = (laneCount - 1) / 2;
  const pillX = labelX + (lane - cx) * 13;
  const pillY = labelY;

  // Unique animation id per edge
  const animId = `flow-${id}`;

  return (
    <>
      {/* Base path — muted, always visible */}
      <BaseEdge
        id={id}
        path={path}
        style={{
          ...style,
          strokeOpacity: 0.35,
        }}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />

      {/* Energy pulse overlay — animated dash */}
      <path
        d={path}
        fill="none"
        stroke={accent}
        strokeWidth={(style?.strokeWidth as number ?? 3) * 0.7}
        strokeLinecap="round"
        strokeOpacity={0.85}
        filter={glowId ? `url(#${glowId}-glow)` : undefined}
        style={{
          strokeDasharray: '12 28',
          strokeDashoffset: 40,
          animation: `${animId} ${speed}s linear infinite`,
        }}
      />

      {/* Inline keyframe — one per edge, scoped by id */}
      <style>{`
        @keyframes ${animId} {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0;  }
        }
      `}</style>

      {/* Collateral pill label */}
      {branchLabel && (
        <EdgeLabelRenderer>
          <div
            className="deploy-flow-edge-pill nodrag nopan"
            style={{
              position:  'absolute',
              transform: `translate(-50%,-50%) translate(${pillX}px,${pillY}px)`,
              background: `color-mix(in srgb, ${accent} 12%, ${C.surface})`,
              border:    `1px solid ${accent}`,
              borderRadius: 9999,
              padding:   '1px 5px',
              color:     accent,
            }}
          >
            {branchLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// ─── Custom Node ─────────────────────────────────────────────────────────────
type SankeyCardData = {
  label:      string;
  sublabel:   string;
  accent:     string;
  tier:       'capital' | 'mint' | 'l2';
  health?:    'ok' | 'warn' | 'risk';   // drives status orb
  showTarget?:  boolean;
  showSource?:  boolean;
  sourceHandles?: string[];
  sourceHandlePositions?: Record<string, string>;
  targetHandles?: string[];
  venue?: string;
} & Record<string, unknown>;

type SankeyCardNode = Node<SankeyCardData, 'sankeyCard'>;

function healthColor(h?: string) {
  if (h === 'warn') return C.orange;
  if (h === 'risk') return C.pink;
  return C.purple;
}

function handlePct(i: number, n: number) {
  return `${((i + 0.5) / Math.max(n, 1)) * 100}%`;
}

function SankeyCardNode({ data }: NodeProps<SankeyCardNode>) {
  const {
    label, sublabel, accent, tier, health,
    showTarget = true, showSource = true,
    sourceHandles, sourceHandlePositions, targetHandles,
  } = data;

  const isCapital = tier === 'capital';
  const isMint    = tier === 'mint';
  const isL2      = tier === 'l2';

  const orb = healthColor(health);

  // Per-tier visual configuration
  const cfg = isCapital
    ? { bg: C.surface,     fg: C.shark,                  border: C.border,               w: 200 }
    : isMint
    ? { bg: C.purple,      fg: 'rgba(253,254,253,0.96)', border: 'rgba(253,254,253,0.12)', w: 168 }
    : { bg: C.surface,     fg: C.shark,                  border: C.border,               w: 102 };

  const nSrc = sourceHandles?.length ?? 0;
  const nTgt = targetHandles?.length ?? 0;

  return (
    <div
      className="sankey-card-node"
      style={{
        background:  cfg.bg,
        color:       cfg.fg,
        border:      `1px solid ${cfg.border}`,
        borderTop:   isCapital ? `2px solid ${C.purple}` : isMint ? '2px solid rgba(255,255,255,0.45)' : `1px solid ${cfg.border}`,
        borderRadius: isL2 ? 8 : 6,
        padding:     isL2 ? '7px 9px' : '8px 10px',
        width:       cfg.w,
        boxShadow:   isL2
          ? `0 1px 8px rgba(160,129,245,0.08)`
          : `0 2px 14px rgba(0,0,0,0.10)`,
        position: 'relative',
        overflow: 'visible',
        ...(isL2 ? { display: 'flex', flexDirection: 'column' as const, minHeight: 74 } : {}),
      }}
    >

      {/* Status orb — top-right, capital + mint only */}
      {!isL2 && (
        <span
          style={{
            position:     'absolute',
            top:          7,
            right:        8,
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   orb,
            boxShadow:    `0 0 6px ${orb}`,
          }}
        />
      )}

      {/* Target handles */}
      {nTgt > 0
        ? targetHandles!.map((bid, i) => (
            <Handle
              key={`in-${bid}`} id={`in-${bid}`}
              type="target" position={Position.Top}
              style={{ left: handlePct(i, nTgt), transform: 'translateX(-50%)', width: 5, height: 5, border: 'none', background: 'rgba(160,129,245,0.4)' }}
            />
          ))
        : showTarget && (
            <Handle type="target" position={Position.Top}
              style={{ width: 7, height: 7, border: 'none', background: 'rgba(160,129,245,0.4)' }} />
          )
      }

      {/* Label */}
      <div style={{
        fontFamily:   isL2 ? 'var(--font-heading)' : 'var(--font-heading)',
        fontSize:     isL2 ? '0.64rem' : isMint ? '0.68rem' : '0.72rem',
        fontWeight:   700,
        textTransform: 'uppercase' as const,
        letterSpacing: isL2 ? '0.03em' : '0.04em',
        lineHeight:    1.2,
        paddingRight:  !isL2 ? '10px' : 0,
        textAlign:     isMint ? 'right' as const : undefined,
        color:         isL2 ? accent : undefined,
      }}>
        {isMint ? (
          <>
            <style>{`
              @keyframes evro-pulse {
                0%   { transform: scale(1) translateY(-50%);    box-shadow: 0 0 0px 0px rgba(160,129,245,0); }
                50%  { transform: scale(1.10) translateY(-50%); box-shadow: 0 0 14px 6px rgba(160,129,245,0.45); }
                100% { transform: scale(1) translateY(-50%);    box-shadow: 0 0 0px 0px rgba(160,129,245,0); }
              }
            `}</style>
            <img
              src={evroTokenUrl}
              alt="EVRO"
              style={{
                position:  'absolute',
                left:      -20,
                top:       '50%',
                transform: 'translateY(-50%)',
                width:     40,
                height:    40,
                borderRadius: '50%',
                flexShrink: 0,
                animation: 'evro-pulse 2.4s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
            <span>
              {label.split(' · ')[0]}
              <span style={{ fontSize: '0.55rem', verticalAlign: 'middle', position: 'relative', top: '-0.1em' }}> · {label.split(' · ')[1]}</span>
            </span>
          </>
        ) : label}
      </div>

      {/* Venue / pair descriptor — middle tier */}
      {isL2 && data.venue && (
        <div style={{
          fontFamily:   'var(--font-body)',
          fontSize:     '0.5rem',
          fontWeight:   500,
          color:        'rgba(29,28,31,0.55)',
          marginTop:    2,
          marginBottom: 1,
          lineHeight:   1.3,
          letterSpacing: '0.01em',
        }}>
          {data.venue as string}
        </div>
      )}

      {/* Sublabel */}
      <div style={{
        fontFamily:   'var(--font-mono)',
        fontSize:     isL2 ? '0.45rem' : '0.5rem',
        fontWeight:   500,
        opacity:      isMint ? 0.75 : 1,
        marginTop:    isL2 ? 'auto' : 3,
        color:        isL2 ? C.shark : undefined,
        letterSpacing: '0.02em',
      }}>
        {sublabel}
      </div>

      {/* Source handles */}
      {nSrc > 0
        ? sourceHandles!.map((bid, i) => (
            <Handle
              key={`out-${bid}`} id={`out-${bid}`}
              type="source" position={Position.Bottom}
              style={{ left: sourceHandlePositions?.[bid] ?? handlePct(i, nSrc), transform: 'translateX(-50%)', width: isMint ? 8 : 5, height: isMint ? 8 : 5, border: 'none', background: 'rgba(160,129,245,0.4)' }}
            />
          ))
        : showSource && (
            <Handle type="source" position={Position.Bottom}
              style={{ width: 7, height: 7, border: 'none', background: 'rgba(160,129,245,0.4)' }} />
          )
      }
    </div>
  );
}

const NODE_TYPES: NodeTypes = { sankeyCard: SankeyCardNode };
const EDGE_TYPES = { energy: EnergyEdge };

// ─── Public interface ─────────────────────────────────────────────────────────
export interface DeployFlowBranch {
  id:        string;
  name:      string;
  color:     string;
  allocated: number;
  minted:    number;
}

interface DeployFlowSankeyProps {
  branches:     DeployFlowBranch[];
  totalMinted:  number;
  l2Shares:     L2Shares;
  onAdjustL2:   (key: keyof L2Shares, target: number) => void;
  l2Locked?:    boolean;
  onToggleL2?:  () => void;
}

const L2_META: { key: keyof L2Shares; short: string }[] = [
  { key: 'sp',      short: 'SP' },
  { key: 'anchor',  short: 'Anchor' },
  { key: 'bridge',  short: 'Bridge' },
  { key: 'reserve', short: 'Reserve' },
];

// ─── L2 venue descriptors ────────────────────────────────────────────────────
const L2_VENUE_LABEL: Record<string, string> = {
  sp:      'EVRO Protocol',
  anchor:  'sDAI/EVRO · CoW AMM',
  bridge:  'EURe/EVRO · Curve',
  reserve: 'Operational buffer',
};

// ─── Graph builder ────────────────────────────────────────────────────────────
function buildGraph(
  branches:    DeployFlowBranch[],
  totalMinted: number,
  l2Shares:    L2Shares,
  glowId:      string,
): { nodes: SankeyCardNode[]; edges: Edge[] } {
  const EPS = 2;
  const totalAllocated = branches.reduce((s, b) => s + b.allocated, 0);
  const maxAlloc       = Math.max(EPS, ...branches.map(b => b.allocated));
  const maxMinted      = Math.max(EPS, ...branches.map(b => b.minted));
  const tm             = Math.max(totalMinted, EPS);
  const branchIds      = branches.map(b => b.id);

  const nodes: SankeyCardNode[] = [];
  const edges: Edge[]           = [];
  const edgeBase = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  // ── TIER 0: Capital ─────────────────────────────────────────────────────
  const capW = 200;
  nodes.push({
    id: 'capital',
    type: 'sankeyCard',
    position: { x: (CANVAS_W - capW) / 2, y: TIER_CAPITAL },
    data: {
      label:    '$' + totalAllocated.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      sublabel: 'Your deployment',
      accent:   C.purple,
      tier:     'capital',
      health:   'ok',
      showTarget:   false,
      showSource:   false,
      sourceHandles: branchIds,
    },
    style: { width: capW },
  });

  // ── TIER 1: Minted EVRO ─────────────────────────────────────────────────
  const mintW = 168;

  // Pre-compute L2 stroke widths so the source handles on the Mint card
  // spread exactly to hug the combined thickness of all 4 outgoing edges.
  const l2HandleGap = 3; // px between edge centre-lines at source
  const l2StrokeWidths = DISTRIBUTION_LABELS.map(d => {
    const share = l2Shares[d.id as keyof L2Shares];
    return strokeW(Math.max(tm * share, EPS), tm, 5, 18);
  });
  const totalHandleSpread = l2StrokeWidths.reduce((s, w) => s + w, 0)
    + (DISTRIBUTION_LABELS.length - 1) * l2HandleGap;
  const handleStartX = mintW / 2 - totalHandleSpread / 2;
  const mintSrcPositions: Record<string, string> = {};
  let cumX = 0;
  DISTRIBUTION_LABELS.forEach((d, i) => {
    const sw = l2StrokeWidths[i];
    const cx = handleStartX + cumX + sw / 2;
    mintSrcPositions[`l2-${d.id}`] = `${(cx / mintW) * 100}%`;
    cumX += sw + l2HandleGap;
  });
  const mintSrcIds = DISTRIBUTION_LABELS.map(d => `l2-${d.id}`);

  nodes.push({
    id: 'mint',
    type: 'sankeyCard',
    position: { x: (CANVAS_W - mintW) / 2, y: TIER_MINT },
    data: {
      label:    '€' + Math.round(totalMinted).toLocaleString('en-US') + ' · EVRO MINTED',
      sublabel: '',
      accent:   C.purpleLight,
      tier:     'mint',
      health:   'ok',
      showTarget:   false,
      showSource:   false,
      targetHandles: branchIds,
      sourceHandles: mintSrcIds,
      sourceHandlePositions: mintSrcPositions,
    },
    style: { width: mintW },
  });

  // ── Capital → Mint: one edge per collateral branch ───────────────────────
  const nBranches = branches.length;
  branches.forEach((b, lane) => {
    const av = Math.max(b.allocated, EPS);
    const mv = Math.max(b.minted,    EPS);
    const sw = Math.max(strokeW(av, maxAlloc), strokeW(mv, maxMinted));
    // speed: high-volume = faster pulse (lower seconds)
    const speed = 1.8 + (1 - Math.min(1, av / maxAlloc)) * 3.2; // 1.8s–5.0s

    edges.push({
      id:           `e-cap-mint-${b.id}`,
      source:       'capital',
      target:       'mint',
      sourceHandle: `out-${b.id}`,
      targetHandle: `in-${b.id}`,
      type:         'energy',
      animated:     false,
      data: {
        branchLabel: b.name,
        accent:      b.color,
        lane,
        laneCount:   nBranches,
        speed,
        glowId,
      },
      style: { stroke: b.color, strokeWidth: sw, ...edgeBase },
    });
  });

  // ── TIER 2: L2 venues ────────────────────────────────────────────────────
  const l2W   = 102;
  const l2Gap = 10;
  const l2Count = DISTRIBUTION_LABELS.length;
  const l2RowW  = l2Count * l2W + (l2Count - 1) * l2Gap;
  const l2StartX = (CANVAS_W - l2RowW) / 2;

  DISTRIBUTION_LABELS.forEach((d, i) => {
    const key    = d.id as keyof L2Shares;
    const share  = l2Shares[key];
    const amount = tm * share;
    const speed  = 1.6 + (1 - Math.min(1, share)) * 3; // larger share = faster

    nodes.push({
      id:   `l2-${d.id}`,
      type: 'sankeyCard',
      position: { x: l2StartX + i * (l2W + l2Gap), y: TIER_L2 },
      data: {
        label:    `${Math.round(share * 100)}% · ${fmtEur(amount)}`,
        sublabel: d.id === 'reserve' ? 'Reserve' : d.name.replace(' Pool', ''),
        venue:    L2_VENUE_LABEL[d.id] ?? '',
        accent:   d.color,
        tier:     'l2',
        showTarget: true,
        showSource: false,
      },
      style: { width: l2W },
    });

    const lSw  = l2StrokeWidths[i];
    edges.push({
      id:     `e-mint-l2-${d.id}`,
      source: 'mint',
      target: `l2-${d.id}`,
      sourceHandle: `out-l2-${d.id}`,
      type:   'energy',
      animated: false,
      data: {
        accent:    d.color,
        lane:      i,
        laneCount: l2Count,
        speed,
        glowId,
      },
      style: {
        stroke:      d.color,
        strokeWidth: lSw,
        ...edgeBase,
      },
    });
  });

  return { nodes, edges };
}

// ─── Canvas ───────────────────────────────────────────────────────────────────
function DeployFlowCanvas({
  branches, totalMinted, l2Shares, glowId,
}: Pick<DeployFlowSankeyProps, 'branches' | 'totalMinted' | 'l2Shares'> & { glowId: string }) {
  const built = useMemo(
    () => buildGraph(branches, totalMinted, l2Shares, glowId),
    [branches, totalMinted, l2Shares, glowId]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(built.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(built.edges);

  useEffect(() => {
    setNodes(built.nodes);
    setEdges(built.edges);
  }, [built, setNodes, setEdges]);

  const onInit = useCallback((inst: ReactFlowInstance<SankeyCardNode, Edge>) => {
    inst.fitView({ padding: 0.06, duration: 250 });
  }, []);

  return (
    <div className="deploy-flow-sankey__flow">
      <FlowDefs id={glowId} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: false }}
        fitView
        minZoom={0.4}
        maxZoom={1.3}
      >
        <Background
          gap={24}
          size={1}
          color="rgba(160,129,245,0.07)"
          style={{ opacity: 1 }}
        />
      </ReactFlow>
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function DeployFlowSankey({
  branches, totalMinted, l2Shares, onAdjustL2, l2Locked, onToggleL2
}: DeployFlowSankeyProps) {
  const glowId = useId().replace(/:/g, '');

  return (
    <div className="deploy-flow-sankey">

      {/* Section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <p className="label" style={{ margin: 0, fontSize: '0.58rem' }}>
          Deploy flow
        </p>
        <ControlCheck checked={!!l2Locked} onClick={() => onToggleL2?.()} />
      </div>

      {/* Tier labels — Isolation Doctrine marker */}
      <div className="deploy-flow-sankey__tier-labels">
        <span>Collateral</span>
        <span>Minted EVRO</span>
        <span>L2 Venues</span>
      </div>

      <ReactFlowProvider>
        <DeployFlowCanvas
          branches={branches}
          totalMinted={totalMinted}
          l2Shares={l2Shares}
          glowId={glowId}
        />
      </ReactFlowProvider>

      {/* L2 split sliders */}
      <div className="deploy-flow-sankey__bottom">
        <p className="label" style={{ margin: '12px 0 6px', fontSize: '0.55rem' }}>
          Layer 2 split (minted EVRO)
        </p>
        <div className="deploy-flow-sankey__sliders">
          {L2_META.map(({ key, short }) => (
            <div key={key} className="deploy-flow-sankey__slider-row">
              <span className="deploy-flow-sankey__slider-name">{short}</span>
              <input
                type="range"
                min={0} max={1} step={0.01}
                value={l2Shares[key]}
                onChange={e => onAdjustL2(key, Number(e.target.value))}
                aria-label={`${short} share of minted EVRO`}
              />
              <span className="deploy-flow-sankey__slider-pct">
                {(l2Shares[key] * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
        <p
          className="body-text"
          style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', margin: '8px 0 0', lineHeight: 1.45 }}
        >
          Moving one slider redistributes the remainder across the other venues. Totals normalize to 100%.
        </p>
      </div>
    </div>
  );
}
