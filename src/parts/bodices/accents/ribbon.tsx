import type { WaistAccentDef, AccentContext } from '../types';

export const ribbon: WaistAccentDef = {
  type: 'ribbon',
  label: '리본',
  render(ctx: AccentContext) {
    const { waistY, centerX, accentColor } = ctx;
    const lx = centerX - 18;
    const rx = centerX + 18;
    return (
      <g data-accent="ribbon">
        {/* left wing */}
        <polygon points={`${centerX - 2},${waistY} ${lx},${waistY - 10} ${lx},${waistY + 10}`} fill={accentColor} opacity="0.9" />
        {/* right wing */}
        <polygon points={`${centerX + 2},${waistY} ${rx},${waistY - 10} ${rx},${waistY + 10}`} fill={accentColor} opacity="0.9" />
        {/* knot */}
        <circle cx={centerX} cy={waistY} r="4" fill={accentColor} stroke="#fff" strokeWidth="0.8" />
      </g>
    );
  },
};
