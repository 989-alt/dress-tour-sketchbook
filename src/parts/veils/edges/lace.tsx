import type { VeilEdgeDef } from '../types';

export const lace: VeilEdgeDef = {
  type: 'lace',
  label: '레이스',
  renderEdge({ veilOutlinePath, color, idPrefix }) {
    // Lace edge: two strokes — a scalloped/wavy outer stroke and a finer inner line
    return (
      <g key={`${idPrefix}lace-edge`}>
        <path
          d={veilOutlinePath}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray="4 3 2 3"
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d={veilOutlinePath}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.5}
        />
      </g>
    );
  },
};
