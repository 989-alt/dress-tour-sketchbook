import type { AccessoryDef } from './types';

export const hairVine: AccessoryDef = {
  type: 'hairVine',
  label: '헤어바인',
  render({ headTopX, headTopY, color, idPrefix }) {
    const startX = headTopX - 38;
    const startY = headTopY + 10;

    const vinePoints = [
      { x: startX,      y: startY },
      { x: startX + 12, y: startY - 6 },
      { x: startX + 24, y: startY + 2 },
      { x: startX + 36, y: startY - 4 },
      { x: startX + 48, y: startY + 6 },
      { x: startX + 58, y: startY - 2 },
    ];

    const linePath = vinePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const flowerOffsets = [1, 3, 5];

    return (
      <g data-accessory="hairVine">
        <path d={linePath} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.7} />
        {flowerOffsets.map((fi, i) => {
          const p = vinePoints[fi];
          return (
            <g key={`${idPrefix}f${i}`}>
              <circle cx={p.x} cy={p.y} r={4} fill={color} opacity={0.6} />
              <circle cx={p.x} cy={p.y} r={1.5} fill="white" opacity={0.9} />
            </g>
          );
        })}
      </g>
    );
  },
};
