import type { ReactElement } from 'react';
import type { VeilEdge } from '../../../types';
import { VEIL_EDGES } from '../edges';

interface VeilShapeProps {
  outlinePath: string;
  color: string;
  edge: VeilEdge;
  idPrefix: string;
  opacity?: number;
  dataLayer?: string;
}

export function VeilShape({
  outlinePath,
  color,
  edge,
  idPrefix,
  opacity = 0.55,
  dataLayer,
}: VeilShapeProps): ReactElement {
  const edgeDef = VEIL_EDGES[edge];
  const edgeEl = edgeDef.renderEdge({ veilOutlinePath: outlinePath, color, idPrefix });
  return (
    <g data-veil-layer={dataLayer}>
      <path d={outlinePath} fill={color} opacity={opacity} />
      {edgeEl}
    </g>
  );
}
