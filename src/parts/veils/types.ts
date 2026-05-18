import type { ReactElement } from 'react';
import type { VeilLength, VeilEdge } from '../../types';

export interface VeilLengthDef {
  type: VeilLength;
  label: string;
  render(args: {
    edge: VeilEdge;
    layers: 1 | 2;
    color: string;
    headTopY: number;
    chinY: number;
    shoulderLX: number;
    shoulderRX: number;
    idPrefix: string;
  }): { back: ReactElement | null; front: ReactElement | null };
}

export interface VeilEdgeDef {
  type: VeilEdge;
  label: string;
  renderEdge(args: {
    veilOutlinePath: string;
    color: string;
    idPrefix: string;
  }): ReactElement | null;
}
