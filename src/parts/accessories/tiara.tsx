import type { AccessoryDef } from './types';

export const tiara: AccessoryDef = {
  type: 'tiara',
  label: '티아라',
  render({ headTopX, headTopY, color, idPrefix }) {
    const cx = headTopX;
    const baseY = headTopY - 2;
    const archTop = headTopY - 32;
    const left = cx - 40;
    const right = cx + 40;

    const archPath = `M ${left} ${baseY} Q ${cx - 20} ${archTop} ${cx} ${archTop - 4} Q ${cx + 20} ${archTop} ${right} ${baseY}`;

    const jewels = [
      { x: cx, y: archTop - 4 },
      { x: cx - 20, y: archTop + 4 },
      { x: cx + 20, y: archTop + 4 },
      { x: cx - 36, y: baseY - 4 },
      { x: cx + 36, y: baseY - 4 },
    ];

    return (
      <g data-accessory="tiara">
        <path
          d={archPath}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        {jewels.map((j, i) => (
          <circle key={`${idPrefix}j${i}`} id={`${idPrefix}j${i}`} cx={j.x} cy={j.y} r={3} fill={color} opacity={0.9} />
        ))}
      </g>
    );
  },
};
