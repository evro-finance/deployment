import { useMemo } from 'react';
import { sankey as d3Sankey } from 'd3-sankey';
import { linkVertical } from 'd3-shape';
import { DISTRIBUTION_LABELS, type L2Shares } from '../data/branches';

/** d3-sankey lays out left→right; we transpose coords so flow reads top→bottom. */
const LAYOUT_DEPTH = 320;
const LAYOUT_BREADTH = 300;

type SankeyNode = {
  id: string;
  label: string;
  color: string;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
};

type SankeyLink = {
  source: SankeyNode;
  target: SankeyNode;
  y0?: number;
  y1?: number;
  width?: number;
};

function transposeSankeyGraph(graph: { nodes: SankeyNode[]; links: SankeyLink[] }) {
  for (const n of graph.nodes) {
    const x0 = n.x0 ?? 0;
    const x1 = n.x1 ?? 0;
    const y0 = n.y0 ?? 0;
    const y1 = n.y1 ?? 0;
    n.x0 = y0;
    n.x1 = y1;
    n.y0 = x0;
    n.y1 = x1;
  }
}

function sankeyLinkVerticalPath() {
  return linkVertical()
    .source((d: unknown) => {
      const l = d as SankeyLink;
      return [l.y0 ?? 0, l.source.y1 ?? 0] as [number, number];
    })
    .target((d: unknown) => {
      const l = d as SankeyLink;
      return [l.y1 ?? 0, l.target.y0 ?? 0] as [number, number];
    });
}

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

const EPS = 2;

const L2_META: { key: keyof L2Shares; short: string }[] = [
  { key: 'sp', short: 'SP' },
  { key: 'anchor', short: 'Anchor' },
  { key: 'bridge', short: 'Bridge' },
  { key: 'reserve', short: 'Reserve' },
];

export function DeployFlowSankey({
  branches,
  totalMinted,
  l2Shares,
  onAdjustL2,
}: DeployFlowSankeyProps) {
  const viewPad = 6;
  const vbW = LAYOUT_BREADTH + viewPad * 2;
  const vbH = LAYOUT_DEPTH + viewPad * 2;

  const { graph, linkPath } = useMemo(() => {
    const nodes: SankeyNode[] = [
      { id: 'genesis', label: 'Capital', color: '#95929E' },
      ...branches.map(b => ({ id: `br-${b.id}`, label: b.name, color: b.color })),
      { id: 'mint', label: 'Minted EVRO', color: '#A082F5' },
      ...DISTRIBUTION_LABELS.map(d => ({
        id: `l2-${d.id}`,
        label: d.id === 'reserve' ? 'Reserve' : d.name.replace(' Pool', ''),
        color: d.color,
      })),
    ];

    const links: Array<{ source: string; target: string; value: number }> = [];
    for (const b of branches) {
      links.push({
        source: 'genesis',
        target: `br-${b.id}`,
        value: Math.max(b.allocated, EPS),
      });
      links.push({
        source: `br-${b.id}`,
        target: 'mint',
        value: Math.max(b.minted, EPS),
      });
    }
    const tm = Math.max(totalMinted, EPS);
    links.push({ source: 'mint', target: 'l2-sp', value: Math.max(tm * l2Shares.sp, EPS) });
    links.push({ source: 'mint', target: 'l2-anchor', value: Math.max(tm * l2Shares.anchor, EPS) });
    links.push({ source: 'mint', target: 'l2-bridge', value: Math.max(tm * l2Shares.bridge, EPS) });
    links.push({ source: 'mint', target: 'l2-reserve', value: Math.max(tm * l2Shares.reserve, EPS) });

    const layout = d3Sankey<SankeyNode, { value: number }>()
      .nodeId((d: SankeyNode) => d.id)
      .nodeWidth(6)
      .nodePadding(4)
      .extent([[1, 4], [LAYOUT_DEPTH - 1, LAYOUT_BREADTH - 4]]);

    const g = layout({
      nodes: nodes.map(n => ({ ...n })),
      links: links.map(l => ({ ...l })),
    });

    transposeSankeyGraph(g as { nodes: SankeyNode[]; links: SankeyLink[] });

    const gen = sankeyLinkVerticalPath();
    return { graph: g, linkPath: gen };
  }, [branches, totalMinted, l2Shares]);

  return (
    <div className="deploy-flow-sankey">
      <p className="label" style={{ marginBottom: '6px', fontSize: '0.58rem' }}>Deploy flow</p>
      <svg
        width="100%"
        height={vbH}
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', maxWidth: '100%', flexShrink: 0 }}
        aria-hidden
      >
        <g transform={`translate(${viewPad}, ${viewPad})`}>
          {(graph.links as SankeyLink[]).map((link, i) => {
            const src = link.source;
            const stroke =
              src.id === 'genesis'
                ? 'rgba(160, 130, 245, 0.45)'
                : src.id.startsWith('br-')
                  ? `${src.color}99`
                  : 'rgba(160, 130, 245, 0.42)';
            return (
              <path
                key={i}
                d={String(linkPath(link as never) ?? '')}
                fill="none"
                stroke={stroke}
                strokeWidth={Math.max(0.6, link.width ?? 1)}
              />
            );
          })}
          {graph.nodes.map(n => (
            <rect
              key={n.id}
              x={n.x0 ?? 0}
              y={n.y0 ?? 0}
              width={(n.x1 ?? 0) - (n.x0 ?? 0)}
              height={(n.y1 ?? 0) - (n.y0 ?? 0)}
              fill={n.color}
              rx={2}
              opacity={0.88}
            />
          ))}
        </g>
      </svg>

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
        <p className="body-text" style={{ fontSize: '0.62rem', color: 'var(--muted-foreground)', margin: '8px 0 0', lineHeight: 1.45 }}>
          Moving one slider redistributes the remainder across the other venues. Totals normalize to 100%.
        </p>
      </div>
    </div>
  );
}
