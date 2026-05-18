import type { BodiceStructureDef, BodiceContext } from '../types';

export const mockPeplum: BodiceStructureDef = {
  type: 'mockPeplum',
  label: '모크 페플럼',
  render(ctx: BodiceContext, color: string) {
    const { waistY, leftX, rightX } = ctx;
    return (
      <g data-structure="mockPeplum">
        <rect x={leftX} y={waistY - 5} width={rightX - leftX} height={10} fill={color} stroke="#888" strokeWidth="0.8" opacity="0.7" />
      </g>
    );
  },
};
