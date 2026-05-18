/* eslint-disable react-refresh/only-export-components */
import type { EmbellishmentDef } from './types';
import { gridPositions, intensityToStep } from './gridUtil';

/** One swirl vine at position. */
function Swirl({ cx, cy, r, color, id }: { cx: number; cy: number; r: number; color: string; id: string }) {
  const d = `M ${cx} ${cy + r} C ${cx - r} ${cy + r} ${cx - r} ${cy - r} ${cx} ${cy} C ${cx + r * 0.5} ${cy - r * 0.5} ${cx + r} ${cy} ${cx + r * 0.8} ${cy + r * 0.5}`;
  return <path key={id} d={d} fill="none" stroke={color} strokeWidth={1.2} opacity={0.6} />;
}

/** Geometric grid at position. */
function Geo({ cx, cy, r, color, id }: { cx: number; cy: number; r: number; color: string; id: string }) {
  return (
    <g key={id}>
      <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="none" stroke={color} strokeWidth={0.8} opacity={0.5} />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={color} strokeWidth={0.6} opacity={0.4} />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={color} strokeWidth={0.6} opacity={0.4} />
    </g>
  );
}

export const embroidery: EmbellishmentDef = {
  type: 'embroidery',
  label: '자수',
  render({ intensity, polygons, color, extra, idPrefix }) {
    const style = typeof extra?.style === 'string' ? extra.style : 'floral';
    const pts = gridPositions(polygons, intensityToStep(intensity) + 8);
    return (
      <g data-embellishment="embroidery" data-intensity={intensity}>
        {pts.map((p, i) =>
          style === 'geometric'
            ? <Geo key={`${idPrefix}emb-${i}`} id={`${idPrefix}emb-${i}`} cx={p.x} cy={p.y} r={6} color={color} />
            : <Swirl key={`${idPrefix}emb-${i}`} id={`${idPrefix}emb-${i}`} cx={p.x} cy={p.y} r={7} color={color} />
        )}
      </g>
    );
  },
};
