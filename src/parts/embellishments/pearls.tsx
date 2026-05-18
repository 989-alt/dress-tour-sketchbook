import type { EmbellishmentDef } from './types';
import { gridPositions, intensityToStep } from './gridUtil';

export const pearls: EmbellishmentDef = {
  type: 'pearls',
  label: '진주',
  render({ intensity, polygons, color, idPrefix }) {
    const pts = gridPositions(polygons, intensityToStep(intensity));
    return (
      <g data-embellishment="pearls" data-intensity={intensity}>
        {pts.map((p, i) => (
          <g key={`${idPrefix}pearl-${i}`}>
            <circle cx={p.x} cy={p.y} r={4} fill={color} opacity={0.85} />
            {/* highlight */}
            <circle cx={p.x - 1} cy={p.y - 1} r={1.2} fill="#ffffff" opacity={0.7} />
          </g>
        ))}
      </g>
    );
  },
};
