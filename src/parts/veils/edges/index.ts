import type { VeilEdge } from '../../../types';
import type { VeilEdgeDef } from '../types';
export type { VeilEdgeDef } from '../types';

import { cut }    from './cut';
import { ribbon } from './ribbon';
import { beaded } from './beaded';
import { lace }   from './lace';

export const VEIL_EDGES: Record<VeilEdge, VeilEdgeDef> = {
  cut,
  ribbon,
  beaded,
  lace,
};
