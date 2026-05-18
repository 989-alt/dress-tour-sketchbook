import type { BodiceStructureDef, BodiceContext } from '../types';

export const corset: BodiceStructureDef = {
  type: 'corset',
  label: '코르셋',
  render(ctx: BodiceContext) {
    const { topY, waistY, shoulderLX, shoulderRX } = ctx;
    const width = shoulderRX - shoulderLX;
    const step = width / 7;
    const lines = [];
    for (let i = 1; i <= 6; i++) {
      const x = shoulderLX + step * i;
      lines.push(<line key={i} x1={x} y1={topY} x2={x} y2={waistY} stroke="#888" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />);
    }
    return <g data-structure="corset">{lines}</g>;
  },
};
