import type { SkirtTextureDef } from '../types';

export const layeredTulle: SkirtTextureDef = {
  type: 'layeredTulle',
  label: '레이어드 튤',
  render({ topY, leftX, rightX, color }) {
    const clouds = [topY + 15, topY + 35, topY + 55];
    const mid = (leftX + rightX) / 2;
    return (
      <g data-texture="layeredTulle">
        {clouds.map((cy, i) => (
          <path
            key={i}
            d={`M ${leftX} ${cy} Q ${(leftX + mid) / 2} ${cy - 8} ${mid} ${cy} Q ${(mid + rightX) / 2} ${cy + 8} ${rightX} ${cy}`}
            fill="none" stroke={color} strokeWidth="1" opacity="0.3"
          />
        ))}
      </g>
    );
  },
};
