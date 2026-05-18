import type { EmbellishmentDef } from './types';
import { gridPositions, intensityToStep } from './gridUtil';

/** 4-petal flower using 4 small circles around a center. */
function Flower({ cx, cy, r, color, id }: { cx: number; cy: number; r: number; color: string; id: string }) {
  return (
    <g key={id}>
      <circle cx={cx}     cy={cy - r} r={r * 0.7} fill={color} opacity={0.5} />
      <circle cx={cx}     cy={cy + r} r={r * 0.7} fill={color} opacity={0.5} />
      <circle cx={cx - r} cy={cy}     r={r * 0.7} fill={color} opacity={0.5} />
      <circle cx={cx + r} cy={cy}     r={r * 0.7} fill={color} opacity={0.5} />
      <circle cx={cx}     cy={cy}     r={r * 0.4} fill={color} opacity={0.8} />
    </g>
  );
}

export const laceApplique: EmbellishmentDef = {
  type: 'laceApplique',
  label: '레이스 어플리케',
  render({ intensity, polygons, color, idPrefix }) {
    const pts = gridPositions(polygons, intensityToStep(intensity) + 10);
    return (
      <g data-embellishment="laceApplique" data-intensity={intensity}>
        {pts.map((p, i) => (
          <Flower key={`${idPrefix}lace-${i}`} id={`${idPrefix}lace-${i}`} cx={p.x} cy={p.y} r={4} color={color} />
        ))}
      </g>
    );
  },
};
