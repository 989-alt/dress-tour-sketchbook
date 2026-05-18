/* eslint-disable react-refresh/only-export-components */
import type { EmbellishmentDef } from './types';
import { gridPositions, intensityToStep } from './gridUtil';

/** 5-petal flower with ellipses. */
function Floral({ cx, cy, r, color, id }: { cx: number; cy: number; r: number; color: string; id: string }) {
  const angles = [0, 72, 144, 216, 288];
  return (
    <g key={id}>
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const px = cx + Math.cos(rad) * r * 0.7;
        const py = cy + Math.sin(rad) * r * 0.7;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={r * 0.55}
            ry={r * 0.35}
            fill={color}
            opacity={0.65}
            transform={`rotate(${deg},${px},${py})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.3} fill={color} opacity={0.9} />
    </g>
  );
}

export const threeDFlorals: EmbellishmentDef = {
  type: 'threeDFlorals',
  label: '3D 플로럴',
  render({ intensity, polygons, color, extra, idPrefix }) {
    const sizeMap: Record<string, number> = { S: 10, M: 20, L: 30 };
    const size = typeof extra?.size === 'string' ? (sizeMap[extra.size] ?? 20) : 20;
    const step = intensityToStep(intensity) + size;
    const pts = gridPositions(polygons, step);
    return (
      <g data-embellishment="threeDFlorals" data-intensity={intensity}>
        {pts.map((p, i) => (
          <Floral key={`${idPrefix}floral-${i}`} id={`${idPrefix}floral-${i}`} cx={p.x} cy={p.y} r={size / 2} color={color} />
        ))}
      </g>
    );
  },
};
