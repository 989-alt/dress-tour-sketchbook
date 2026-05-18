import type { AccessoryDef } from './types';

export const headband: AccessoryDef = {
  type: 'headband',
  label: '헤드밴드',
  render({ headTopX, headTopY, color }) {
    const cx = headTopX;
    const y = headTopY + 14;
    const left = cx - 50;
    const right = cx + 50;

    return (
      <g data-accessory="headband">
        <path
          d={`M ${left} ${y} Q ${cx} ${y - 8} ${right} ${y}`}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
      </g>
    );
  },
};
