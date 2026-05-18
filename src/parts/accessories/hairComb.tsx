import type { AccessoryDef } from './types';

export const hairComb: AccessoryDef = {
  type: 'hairComb',
  label: '헤어콤',
  render({ headTopX, headTopY, color, idPrefix }) {
    const cx = headTopX + 32;
    const cy = headTopY + 12;
    const combW = 18;
    const combH = 10;
    const teeth = 5;

    const toothSpacing = combW / (teeth - 1);

    return (
      <g data-accessory="hairComb">
        {/* comb base */}
        <rect x={cx - combW / 2} y={cy} width={combW} height={4} rx={2} fill={color} opacity={0.85} />
        {/* teeth */}
        {Array.from({ length: teeth }).map((_, i) => (
          <line
            key={`${idPrefix}t${i}`}
            x1={cx - combW / 2 + i * toothSpacing}
            y1={cy + 4}
            x2={cx - combW / 2 + i * toothSpacing}
            y2={cy + combH}
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
        {/* sparkle dots */}
        <circle cx={cx - 6} cy={cy - 5} r={2} fill={color} opacity={0.9} />
        <circle cx={cx}     cy={cy - 8} r={2.5} fill={color} opacity={0.9} />
        <circle cx={cx + 6} cy={cy - 4} r={2} fill={color} opacity={0.9} />
      </g>
    );
  },
};
