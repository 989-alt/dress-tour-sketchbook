import type { ReactElement } from 'react';
import type { VeilEdge } from '../../../types';
import { VEIL_EDGES } from '../edges';

/**
 * Build an SVG path for a veil drape shape.
 * The shape fans out from the head crown downward.
 */
export function veilBackPath(
  headTopY: number,
  shoulderLX: number,
  shoulderRX: number,
  bottomY: number,
): string {
  const centerX = (shoulderLX + shoulderRX) / 2;
  const topWidth = (shoulderRX - shoulderLX) * 0.6;
  const bottomWidth = (shoulderRX - shoulderLX) * 1.2;
  const tl = centerX - topWidth;
  const tr = centerX + topWidth;
  const bl = centerX - bottomWidth;
  const br = centerX + bottomWidth;
  const startY = headTopY - 10;
  return (
    `M ${centerX} ${startY} ` +
    `C ${tl - 10} ${startY + 30} ${bl} ${(startY + bottomY) * 0.5} ${bl} ${bottomY} ` +
    `L ${br} ${bottomY} ` +
    `C ${br} ${(startY + bottomY) * 0.5} ${tr + 10} ${startY + 30} ${centerX} ${startY} Z`
  );
}

export function veilFrontPath(
  headTopY: number,
  chinY: number,
  shoulderLX: number,
  shoulderRX: number,
): string {
  const centerX = (shoulderLX + shoulderRX) / 2;
  const halfW = (shoulderRX - shoulderLX) * 0.55;
  const startY = headTopY - 5;
  const endY = chinY + 20;
  return (
    `M ${centerX} ${startY} ` +
    `C ${centerX - halfW} ${startY + 10} ${centerX - halfW} ${endY - 10} ${centerX - halfW * 0.7} ${endY} ` +
    `L ${centerX + halfW * 0.7} ${endY} ` +
    `C ${centerX + halfW} ${endY - 10} ${centerX + halfW} ${startY + 10} ${centerX} ${startY} Z`
  );
}

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
