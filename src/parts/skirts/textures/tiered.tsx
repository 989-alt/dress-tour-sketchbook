import type { SkirtTextureDef } from '../types';

export const tiered: SkirtTextureDef = {
  type: 'tiered',
  label: '티어드',
  render({ topY, bottomY, leftX, rightX, layers = 3, color }) {
    const n = Math.max(2, Math.min(5, layers));
    const dividers: number[] = [];
    for (let i = 1; i < n; i++) {
      dividers.push(topY + (i * (bottomY - topY)) / n);
    }
    return (
      <g data-texture="tiered">
        {dividers.map((y, i) => (
          <line
            key={i}
            x1={leftX} y1={y}
            x2={rightX} y2={y}
            stroke={color} strokeWidth="1.2" opacity="0.4"
          />
        ))}
      </g>
    );
  },
};
