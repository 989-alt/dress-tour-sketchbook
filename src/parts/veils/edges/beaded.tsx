import type { VeilEdgeDef } from '../types';

export const beaded: VeilEdgeDef = {
  type: 'beaded',
  label: '비즈',
  renderEdge({ veilOutlinePath, color, idPrefix }) {
    // Approximate bead positions along the outline using a dash pattern.
    // For a proper implementation, circle stamping along the path would need
    // getTotalLength/getPointAtLength which aren't available at render time.
    // We use a short-dash stroke to simulate beads.
    return (
      <path
        key={`${idPrefix}beaded-edge`}
        d={veilOutlinePath}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray="2 16"
        strokeLinecap="round"
        opacity={0.85}
      />
    );
  },
};
