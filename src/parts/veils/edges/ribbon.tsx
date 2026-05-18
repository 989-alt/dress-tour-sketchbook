import type { VeilEdgeDef } from '../types';

export const ribbon: VeilEdgeDef = {
  type: 'ribbon',
  label: '리본',
  renderEdge({ veilOutlinePath, color, idPrefix }) {
    return (
      <path
        key={`${idPrefix}ribbon-edge`}
        d={veilOutlinePath}
        fill="none"
        stroke={color}
        strokeWidth={4}
        opacity={0.9}
      />
    );
  },
};
