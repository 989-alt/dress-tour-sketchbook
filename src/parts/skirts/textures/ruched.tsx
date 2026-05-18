import type { SkirtTextureDef } from '../types';

export const ruched: SkirtTextureDef = {
  type: 'ruched',
  label: '루시',
  render({ topY, bottomY, leftX, rightX, color }) {
    const lines: Array<[number, number, number, number]> = [];
    const count = 6;
    const w = rightX - leftX;
    const h = bottomY - topY;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      lines.push([leftX + t * w * 0.3, topY + t * h * 0.2, leftX + t * w * 0.7 + w * 0.3, topY + t * h]);
    }
    return (
      <g data-texture="ruched">
        {lines.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth="0.8" opacity="0.3"
          />
        ))}
      </g>
    );
  },
};
