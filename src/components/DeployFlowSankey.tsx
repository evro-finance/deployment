import { useCallback, useEffect, useMemo } from 'react';
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

/** EVRO brand: Close to Black (capital), EVRO LILAC (mint + mint→L2 noodles) */
const GENESIS_HEX = '#1D1C1F';
const MINT_HEX = '#A081F5';

/** Canvas width used for manual x positions (fitView scales to container). */
const CANVAS_W = 400;

const EPS = 2;

function fmtEurCompact(n: number): string {
  const v = Math.abs(n);
  if (v >= 1_000_000) return `€${(n / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(n / 1_000).toFixed(1)}k`;
  return `€${n.toFixed(0)}`;
}

function strokeWidthFromValue(v: number, max: number, minW = 3.5, maxW = 11): number {
  if (max <= 0) return minW;
  const t = Math.min(1, Math.max(0, v / max));
  return minW + t * (maxW - minW);
}

type CollateralEdgeData = {
  branchLabel: string;
  accent: string;
  lane: number;
  laneCount: number;
};

/** Bezier from Capital → Mint with a tiny pill label (collateral name only); not a separate node. */
function CollateralBezierEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerStart,
  markerEnd,
  data,
}: EdgeProps<Edge<CollateralEdgeData, 'collateralBezier'>>) {
  const lane = data?.lane ?? 0;
  const laneCount = Math.max(1, data?.laneCount ?? 1);
  const span = Math.max(1, laneCount - 1);
  const curvature = 0.18 + (lane / span) * 0.48;

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature,
  });

  const accent = data?.accent ?? '#625E6B';
  const branchLabel = data?.branchLabel ?? '';
  const cx = (laneCount - 1) / 2;
  const pillX = labelX + (lane - cx) * 5;
  const pillY = labelY + (lane - cx) * 2;

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerStart={markerStart} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          className="deploy-flow-edge-pill nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${pillX}px,${pillY}px)`,
            background: `color-mix(in srgb, ${accent} 18%, #ffffff)`,
            border: `1px solid ${accent}`,
            borderRadius: 9999,
            padding: '1px 5px',
            color: accent,
          }}
        >
          {branchLabel}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

type DeployFlowCardData = {
  label: string;
  color: string;
  detail?: string;
  showTarget?: boolean;
  showSource?: boolean;
  /** Light brand secondaries (L2) — dark ink text instead of white */
  fillTone?: 'pastel';
  /** One source handle per branch id (bottom), Capital → Mint collateral edges */
  collateralSourceHandles?: string[];
  /** One target handle per branch id (top), receives Capital → Mint edges */
  collateralTargetHandles?: string[];
} & Record<string, unknown>;

type DeployFlowCardNodeType = Node<DeployFlowCardData, 'deployCard'>;

function handleSpreadPct(index: number, count: number): string {
  if (count <= 0) return '50%';
  return `${((index + 0.5) / count) * 100}%`;
}

function DeployFlowCardNode({ data }: NodeProps<DeployFlowCardNodeType>) {
  const {
    label,
    color,
    detail,
    showTarget = true,
    showSource = true,
    fillTone,
    collateralSourceHandles,
    collateralTargetHandles,
  } = data;
  const pastel = fillTone === 'pastel';
  const ink = '#1D1C1F';
  const fg = pastel ? ink : 'rgba(253, 254, 253, 0.96)';
  const handleBg = pastel ? 'rgba(29, 28, 31, 0.35)' : 'rgba(255, 255, 255, 0.4)';

  const nSrc = collateralSourceHandles?.length ?? 0;
  const nTgt = collateralTargetHandles?.length ?? 0;

  return (
    <div
      className="deploy-flow-rf-node"
      style={{
        background: color,
        borderRadius: 6,
        padding: '6px 8px',
        minWidth: 56,
        maxWidth: 118,
        fontSize: '0.58rem',
        fontWeight: 600,
        color: fg,
        textShadow: pastel ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.28)',
        lineHeight: 1.25,
        border: pastel ? '1px solid rgba(29, 28, 31, 0.12)' : '1px solid rgba(253, 254, 253, 0.14)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
      }}
    >
      {nTgt > 0
        ? collateralTargetHandles!.map((bid, i) => (
            <Handle
              key={`in-${bid}`}
              id={`in-${bid}`}
              type="target"
              position={Position.Top}
              style={{
                left: handleSpreadPct(i, nTgt),
                transform: 'translateX(-50%)',
                width: 6,
                height: 6,
                border: 'none',
                background: handleBg,
              }}
            />
          ))
        : showTarget && (
            <Handle
              type="target"
              position={Position.Top}
              style={{ width: 8, height: 8, border: 'none', background: handleBg }}
            />
          )}
      <div>{label}</div>
      {detail ? (
        <div
          style={{
            fontSize: '0.5rem',
            fontWeight: 500,
            opacity: pastel ? 0.88 : 0.92,
            marginTop: 3,
          }}
        >
          {detail}
        </div>
      ) : null}
      {nSrc > 0
        ? collateralSourceHandles!.map((bid, i) => (
            <Handle
              key={`out-${bid}`}
              id={`out-${bid}`}
              type="source"
              position={Position.Bottom}
              style={{
                left: handleSpreadPct(i, nSrc),
                transform: 'translateX(-50%)',
                width: 6,
                height: 6,
                border: 'none',
                background: handleBg,
              }}
            />
          ))
        : showSource && (
            <Handle
              type="source"
              position={Position.Bottom}
              style={{ width: 8, height: 8, border: 'none', background: handleBg }}
            />
          )}
    </div>
  );
}

const nodeTypes = { deployCard: DeployFlowCardNode } satisfies NodeTypes;

const edgeTypes = { collateralBezier: CollateralBezierEdge };

export interface DeployFlowBranch {
  id: string;
  name: string;
  color: string;
  allocated: number;
  minted: number;
}

interface DeployFlowSankeyProps {
  branches: DeployFlowBranch[];
  totalMinted: number;
  l2Shares: L2Shares;
  onAdjustL2: (key: keyof L2Shares, target: number) => void;
}

const L2_META: { key: keyof L2Shares; short: string }[] = [
  { key: 'sp', short: 'SP' },
  { key: 'anchor', short: 'Anchor' },
  { key: 'bridge', short: 'Bridge' },
  { key: 'reserve', short: 'Reserve' },
];

function buildGraph(
  branches: DeployFlowBranch[],
  totalMinted: number,
  l2Shares: L2Shares
): { nodes: DeployFlowCardNodeType[]; edges: Edge[] } {
  const totalAllocated = branches.reduce((s, b) => s + b.allocated, 0);
  const maxAlloc = Math.max(EPS, ...branches.map(b => b.allocated));
  const maxMintedBranch = Math.max(EPS, ...branches.map(b => b.minted));
  const tm = Math.max(totalMinted, EPS);

  const branchIds = branches.map(b => b.id);

  const nodes: DeployFlowCardNodeType[] = [
    {
      id: 'genesis',
      type: 'deployCard' as const,
      position: { x: (CANVAS_W - 132) / 2, y: 0 },
      data: {
        label: 'Capital',
        color: GENESIS_HEX,
        detail: `${fmtEurCompact(totalAllocated)} allocated`,
        showTarget: false,
        showSource: false,
        collateralSourceHandles: branchIds,
      },
      style: { width: 132, height: 'auto' },
    },
  ];

  const mintW = 176;
  nodes.push({
    id: 'mint',
    type: 'deployCard',
    position: { x: (CANVAS_W - mintW) / 2, y: 88 },
    data: {
      label: 'Minted EVRO',
      color: MINT_HEX,
      detail: fmtEurCompact(totalMinted),
      showTarget: false,
      showSource: true,
      collateralTargetHandles: branchIds,
    },
    style: { width: mintW, height: 'auto' },
  });

  const l2W = 64;
  const l2Gap = 10;
  const l2RowW = DISTRIBUTION_LABELS.length * l2W + Math.max(0, DISTRIBUTION_LABELS.length - 1) * l2Gap;
  const l2StartX = (CANVAS_W - l2RowW) / 2;
  const l2Y = 220;

  for (let i = 0; i < DISTRIBUTION_LABELS.length; i++) {
    const d = DISTRIBUTION_LABELS[i]!;
    const key = d.id as keyof L2Shares;
    const share = l2Shares[key];
    const amount = tm * share;
    nodes.push({
      id: `l2-${d.id}`,
      type: 'deployCard',
      position: { x: l2StartX + i * (l2W + l2Gap), y: l2Y },
      data: {
        label: d.id === 'reserve' ? 'Reserve' : d.name.replace(' Pool', ''),
        color: d.color,
        detail: `${(share * 100).toFixed(0)}% · ${fmtEurCompact(amount)}`,
        showTarget: true,
        showSource: false,
        fillTone: 'pastel',
      },
      style: { width: l2W, height: 'auto' },
    });
  }

  const edges: Edge[] = [];
  const nBranches = branches.length;

  const edgeStroke = {
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  let lane = 0;
  for (const b of branches) {
    const av = Math.max(b.allocated, EPS);
    const mv = Math.max(b.minted, EPS);
    const coll = b.color;
    const wAlloc = strokeWidthFromValue(av, maxAlloc);
    const wMint = strokeWidthFromValue(mv, maxMintedBranch);
    const strokeWidth = Math.max(wAlloc, wMint);

    edges.push({
      id: `e-genesis-mint-${b.id}`,
      source: 'genesis',
      target: 'mint',
      sourceHandle: `out-${b.id}`,
      targetHandle: `in-${b.id}`,
      type: 'collateralBezier',
      animated: false,
      data: {
        branchLabel: b.name,
        accent: coll,
        lane,
        laneCount: nBranches,
      },
      style: {
        stroke: coll,
        strokeWidth,
        ...edgeStroke,
      },
    });
    lane += 1;
  }

  for (const d of DISTRIBUTION_LABELS) {
    const key = d.id as keyof L2Shares;
    const share = l2Shares[key];
    const flow = Math.max(tm * share, EPS);
    edges.push({
      id: `e-mint-l2-${d.id}`,
      source: 'mint',
      target: `l2-${d.id}`,
      type: 'default',
      animated: false,
      style: {
        stroke: MINT_HEX,
        strokeWidth: strokeWidthFromValue(flow, tm),
        ...edgeStroke,
      },
    });
  }

  return { nodes, edges };
}

function DeployFlowCanvas({
  branches,
  totalMinted,
  l2Shares,
}: Pick<DeployFlowSankeyProps, 'branches' | 'totalMinted' | 'l2Shares'>) {
  const built = useMemo(
    () => buildGraph(branches, totalMinted, l2Shares),
    [branches, totalMinted, l2Shares]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(built.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(built.edges);

  useEffect(() => {
    setNodes(built.nodes);
    setEdges(built.edges);
  }, [built, setNodes, setEdges]);

  const onInit = useCallback((instance: ReactFlowInstance<DeployFlowCardNodeType, Edge>) => {
    instance.fitView({ padding: 0.12, duration: 200 });
  }, []);

  return (
    <div className="deploy-flow-sankey__flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
          style: { strokeLinecap: 'round', strokeLinejoin: 'round' },
          zIndex: 0,
        }}
        fitView
        minZoom={0.4}
        maxZoom={1.25}
      >
        <Background gap={20} size={1} color="var(--border)" style={{ opacity: 0.35 }} />
      </ReactFlow>
    </div>
  );
}

export function DeployFlowSankey({
  branches,
  totalMinted,
  l2Shares,
  onAdjustL2,
}: DeployFlowSankeyProps) {
  return (
    <div className="deploy-flow-sankey">
      <p className="label" style={{ marginBottom: '6px', fontSize: '0.58rem' }}>
        Deploy flow
      </p>
      <ReactFlowProvider>
        <DeployFlowCanvas branches={branches} totalMinted={totalMinted} l2Shares={l2Shares} />
      </ReactFlowProvider>

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
                min={0}
                max={1}
                step={0.01}
                value={l2Shares[key]}
                onChange={e => onAdjustL2(key, Number(e.target.value))}
                aria-label={`${short} share of minted EVRO`}
              />
              <span className="deploy-flow-sankey__slider-pct">{(l2Shares[key] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
        <p
          className="body-text"
          style={{
            fontSize: '0.62rem',
            color: 'var(--muted-foreground)',
            margin: '8px 0 0',
            lineHeight: 1.45,
          }}
        >
          Moving one slider redistributes the remainder across the other venues. Totals normalize to 100%.
        </p>
      </div>
    </div>
  );
}
