import type { SkirtTextureDef } from '../types';

export const asymmetricDrape: SkirtTextureDef = {
  type: 'asymmetricDrape',
  label: '비대칭 드레이프',
  render({ topY, bottomY, leftX, rightX, color }) {
    const x1 = leftX + 5;
    const y1 = topY + 10;
    const x2 = rightX - 5;
    const y2 = bottomY - 30;
    return (
      <g data-texture="asymmetricDrape">
        <path
          d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 20} ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth="1.2" opacity="0.4"
        />
      </g>
    );
  },
};
