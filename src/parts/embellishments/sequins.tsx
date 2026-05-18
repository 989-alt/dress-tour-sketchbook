import type { EmbellishmentDef } from './types';
import { gridPositions, intensityToStep } from './gridUtil';

export const sequins: EmbellishmentDef = {
  type: 'sequins',
  label: '시퀸',
  render({ intensity, polygons, color, idPrefix }) {
    const pts = gridPositions(polygons, intensityToStep(intensity));
    const s = 3.5;
    return (
      <g data-embellishment="sequins" data-intensity={intensity}>
        {pts.map((p, i) => (
          <g key={`${idPrefix}sequin-${i}`}>
            <rect
              x={p.x - s}
              y={p.y - s}
              width={s * 2}
              height={s * 2}
              fill={color}
              opacity={0.8}
              transform={`rotate(45,${p.x},${p.y})`}
            />
            {/* slight shine highlight */}
            <circle cx={p.x - 1} cy={p.y - 1} r={0.8} fill="#ffffff" opacity={0.5} />
          </g>
        ))}
      </g>
    );
  },
};
