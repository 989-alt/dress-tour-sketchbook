import type { SkirtTextureDef } from '../types';

export const pleated: SkirtTextureDef = {
  type: 'pleated',
  label: '플리츠',
  render({ topY, bottomY, leftX, rightX, color }) {
    const count = 8;
    const step = (rightX - leftX) / count;
    const lines: Array<{ x: number }> = [];
    for (let i = 1; i < count; i++) {
      lines.push({ x: leftX + i * step });
    }
    return (
      <g data-texture="pleated">
        {lines.map(({ x }, i) => (
          <line
            key={i}
            x1={x} y1={topY}
            x2={x} y2={bottomY}
            stroke={color} strokeWidth="0.8" opacity="0.3"
          />
        ))}
      </g>
    );
  },
};
