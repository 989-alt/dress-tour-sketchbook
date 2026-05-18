import type { WaistAccentDef, AccentContext } from '../types';

export const sash: WaistAccentDef = {
  type: 'sash',
  label: '새시',
  render(ctx: AccentContext) {
    const { waistY, leftX, rightX, accentColor } = ctx;
    return (
      <g data-accent="sash">
        <rect x={leftX} y={waistY - 4} width={rightX - leftX} height={8} fill={accentColor} opacity="0.85" />
        <line x1={leftX + 10} y1={waistY} x2={rightX - 10} y2={waistY + 3} stroke="#fff" strokeWidth="0.8" opacity="0.4" />
      </g>
    );
  },
};
