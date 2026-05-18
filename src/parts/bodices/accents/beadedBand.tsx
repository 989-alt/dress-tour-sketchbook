import type { WaistAccentDef, AccentContext } from '../types';

export const beadedBand: WaistAccentDef = {
  type: 'beadedBand',
  label: '비즈 밴드',
  render(ctx: AccentContext) {
    const { waistY, leftX, rightX, accentColor } = ctx;
    const beads = [];
    const spacing = 8;
    for (let x = leftX + 4; x <= rightX - 4; x += spacing) {
      beads.push(<circle key={x} cx={x} cy={waistY} r="3" fill={accentColor} stroke="#aaa" strokeWidth="0.5" />);
    }
    return <g data-accent="beadedBand">{beads}</g>;
  },
};
