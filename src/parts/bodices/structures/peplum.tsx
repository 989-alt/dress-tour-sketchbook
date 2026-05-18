import type { BodiceStructureDef, BodiceContext } from '../types';

export const peplum: BodiceStructureDef = {
  type: 'peplum',
  label: '페플럼',
  render(ctx: BodiceContext, color: string) {
    const { waistY, leftX, rightX } = ctx;
    const flareY = waistY + 50;
    const flareLeft = leftX - 20;
    const flareRight = rightX + 20;
    const d = `M ${leftX} ${waistY} Q ${flareLeft} ${waistY + 25} ${flareLeft + 10} ${flareY} L ${flareRight - 10} ${flareY} Q ${flareRight} ${waistY + 25} ${rightX} ${waistY} Z`;
    return (
      <g data-structure="peplum">
        <path d={d} fill={color} stroke="#888" strokeWidth="0.8" opacity="0.7" />
      </g>
    );
  },
};
