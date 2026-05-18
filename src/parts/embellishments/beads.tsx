import type { EmbellishmentDef } from './types';
import { gridPositions, intensityToStep } from './gridUtil';

export const beads: EmbellishmentDef = {
  type: 'beads',
  label: '비즈',
  render({ intensity, polygons, color, idPrefix }) {
    const pts = gridPositions(polygons, intensityToStep(intensity));
    return (
      <g data-embellishment="beads" data-intensity={intensity}>
        {pts.map((p, i) => (
          <circle
            key={`${idPrefix}bead-${i}`}
            cx={p.x}
            cy={p.y}
            r={2}
            fill={color}
            opacity={0.7}
          />
        ))}
      </g>
    );
  },
};
