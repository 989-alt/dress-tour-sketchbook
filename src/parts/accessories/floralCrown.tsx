import type { AccessoryDef } from './types';

// Petal cluster positions along the crown arc
const CLUSTERS = [
  { angle: -70, r: 42 },
  { angle: -40, r: 46 },
  { angle: -10, r: 48 },
  { angle:  20, r: 46 },
  { angle:  50, r: 42 },
];

export const floralCrown: AccessoryDef = {
  type: 'floralCrown',
  label: '플로럴 크라운',
  render({ headTopX, headTopY, color, idPrefix }) {
    const cx = headTopX;
    const cy = headTopY + 18;

    return (
      <g data-accessory="floralCrown">
        {CLUSTERS.map((c, i) => {
          const rad = (c.angle * Math.PI) / 180;
          const fx = cx + c.r * Math.sin(rad);
          const fy = cy - c.r * Math.cos(rad);
          return (
            <g key={`${idPrefix}cl${i}`}>
              {/* 5 petals */}
              {[0, 72, 144, 216, 288].map((pa, pi) => {
                const pr = ((pa + c.angle * 2) * Math.PI) / 180;
                const px = fx + 5 * Math.cos(pr);
                const py = fy + 5 * Math.sin(pr);
                return (
                  <ellipse
                    key={`${idPrefix}p${i}-${pi}`}
                    cx={px} cy={py}
                    rx={3} ry={2}
                    fill={color}
                    opacity={0.75}
                    transform={`rotate(${pa + c.angle * 2}, ${px}, ${py})`}
                  />
                );
              })}
              <circle cx={fx} cy={fy} r={2} fill="white" opacity={0.9} />
            </g>
          );
        })}
      </g>
    );
  },
};
