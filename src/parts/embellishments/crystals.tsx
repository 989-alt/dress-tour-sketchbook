import type { EmbellishmentDef } from './types';
import { gridPositions, intensityToStep } from './gridUtil';

export const crystals: EmbellishmentDef = {
  type: 'crystals',
  label: '크리스털',
  render({ intensity, polygons, color, idPrefix }) {
    const pts = gridPositions(polygons, intensityToStep(intensity));
    const s = 3; // half-size
    return (
      <g data-embellishment="crystals" data-intensity={intensity}>
        {pts.map((p, i) => (
          // Rotated square = diamond shape
          <rect
            key={`${idPrefix}crystal-${i}`}
            x={p.x - s}
            y={p.y - s}
            width={s * 2}
            height={s * 2}
            fill={color}
            opacity={0.75}
            transform={`rotate(45,${p.x},${p.y})`}
          />
        ))}
      </g>
    );
  },
};
