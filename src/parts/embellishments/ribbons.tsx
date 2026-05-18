/* eslint-disable react-refresh/only-export-components */
import type { EmbellishmentDef } from './types';
import type { Point } from '../../types';

/** Placement positions in canonical space. */
const PLACEMENT_POSITIONS: Record<string, Point> = {
  waist:    { x: 200, y: 400 },
  shoulder: { x: 200, y: 130 },
  back:     { x: 200, y: 220 },
  hem:      { x: 200, y: 750 },
};

/** Small bow/ribbon shape centered at (cx, cy). */
function Ribbon({ cx, cy, color, id }: { cx: number; cy: number; color: string; id: string }) {
  // Left wing + right wing + knot
  return (
    <g key={id}>
      <ellipse cx={cx - 8} cy={cy} rx={7} ry={4} fill={color} opacity={0.75} />
      <ellipse cx={cx + 8} cy={cy} rx={7} ry={4} fill={color} opacity={0.75} />
      <circle  cx={cx}     cy={cy} r={3}          fill={color} opacity={0.9}  />
      {/* tails */}
      <line x1={cx - 3} y1={cy + 1} x2={cx - 8} y2={cy + 8} stroke={color} strokeWidth={1.2} opacity={0.6} />
      <line x1={cx + 3} y1={cy + 1} x2={cx + 8} y2={cy + 8} stroke={color} strokeWidth={1.2} opacity={0.6} />
    </g>
  );
}

export const ribbons: EmbellishmentDef = {
  type: 'ribbons',
  label: '리본',
  render({ intensity, color, extra, idPrefix }) {
    const placement = typeof extra?.placement === 'string' ? extra.placement : 'waist';
    const count = typeof extra?.count === 'number' ? Math.min(extra.count, 3) : Math.min(intensity, 3);
    const base = PLACEMENT_POSITIONS[placement] ?? PLACEMENT_POSITIONS.waist;
    const positions = Array.from({ length: count }, (_, i) => ({
      x: base.x + (i - (count - 1) / 2) * 25,
      y: base.y,
    }));
    return (
      <g data-embellishment="ribbons" data-intensity={intensity}>
        {positions.map((p, i) => (
          <Ribbon key={`${idPrefix}ribbon-${i}`} id={`${idPrefix}ribbon-${i}`} cx={p.x} cy={p.y} color={color} />
        ))}
      </g>
    );
  },
};
