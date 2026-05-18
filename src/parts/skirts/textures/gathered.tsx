import type { SkirtTextureDef } from '../types';

export const gathered: SkirtTextureDef = {
  type: 'gathered',
  label: '개더링',
  render({ topY, leftX, rightX, color }) {
    const lines: string[] = [];
    for (let i = 0; i < 7; i++) {
      const y = topY + 10 + i * 8;
      const amp = 4;
      const mid = (leftX + rightX) / 2;
      lines.push(
        `M ${leftX} ${y} Q ${(leftX + mid) / 2} ${y - amp} ${mid} ${y} Q ${(mid + rightX) / 2} ${y + amp} ${rightX} ${y}`,
      );
    }
    return (
      <g data-texture="gathered">
        {lines.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={color} strokeWidth="0.8" opacity="0.35" />
        ))}
      </g>
    );
  },
};
