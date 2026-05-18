import type { SkirtTextureDef } from '../types';

export const ruffled: SkirtTextureDef = {
  type: 'ruffled',
  label: '러플',
  render({ topY, leftX, rightX, color }) {
    const rows = [topY + 12, topY + 30];
    const sCount = 6;
    const step = (rightX - leftX) / sCount;
    return (
      <g data-texture="ruffled">
        {rows.map((ry, ri) =>
          Array.from({ length: sCount }, (_, i) => {
            const x0 = leftX + i * step;
            const x1 = x0 + step / 2;
            const x2 = x0 + step;
            return (
              <path
                key={`${ri}-${i}`}
                d={`M ${x0} ${ry} C ${x1} ${ry - 6} ${x1} ${ry + 6} ${x2} ${ry}`}
                fill="none" stroke={color} strokeWidth="0.9" opacity="0.35"
              />
            );
          })
        )}
      </g>
    );
  },
};
