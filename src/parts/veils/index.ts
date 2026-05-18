import type { VeilLength, VeilEdge } from '../../types';
import type { VeilLengthDef } from './types';
export type { VeilLengthDef, VeilEdgeDef } from './types';

import { none }      from './lengths/none';
import { blusher }   from './lengths/blusher';
import { elbow }     from './lengths/elbow';
import { fingertip } from './lengths/fingertip';
import { waltz }     from './lengths/waltz';
import { chapel }    from './lengths/chapel';
import { cathedral } from './lengths/cathedral';

export { VEIL_EDGES } from './edges';

export const VEIL_LENGTHS: Record<VeilLength, VeilLengthDef> = {
  none,
  blusher,
  elbow,
  fingertip,
  waltz,
  chapel,
  cathedral,
};

export const VEIL_LENGTH_ORDER: VeilLength[] = [
  'none', 'blusher', 'elbow', 'fingertip', 'waltz', 'chapel', 'cathedral',
];

export const VEIL_EDGE_ORDER: VeilEdge[] = ['cut', 'ribbon', 'beaded', 'lace'];
