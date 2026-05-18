import type { WaistAccentDef, AccentContext } from '../types';

export const brooch: WaistAccentDef = {
  type: 'brooch',
  label: '브로치',
  render(ctx: AccentContext) {
    const { waistY, centerX, accentColor } = ctx;
    return (
      <g data-accent="brooch">
        <circle cx={centerX} cy={waistY} r="7" fill={accentColor} stroke="#aaa" strokeWidth="1" />
        {/* sparkle marks */}
        <line x1={centerX} y1={waistY - 11} x2={centerX} y2={waistY - 9} stroke="#fff" strokeWidth="1" opacity="0.8" />
        <line x1={centerX + 9} y1={waistY} x2={centerX + 11} y2={waistY} stroke="#fff" strokeWidth="1" opacity="0.8" />
        <line x1={centerX - 9} y1={waistY} x2={centerX - 11} y2={waistY} stroke="#fff" strokeWidth="1" opacity="0.8" />
        <line x1={centerX} y1={waistY + 9} x2={centerX} y2={waistY + 11} stroke="#fff" strokeWidth="1" opacity="0.8" />
      </g>
    );
  },
};
