import type { AccessoryType } from '../../types';
import type { AccessoryDef } from './types';
export type { AccessoryDef } from './types';

import { none }        from './none';
import { tiara }       from './tiara';
import { headband }    from './headband';
import { hairVine }    from './hairVine';
import { hairComb }    from './hairComb';
import { floralCrown } from './floralCrown';

export const ACCESSORIES: Record<AccessoryType, AccessoryDef> = {
  none,
  tiara,
  headband,
  hairVine,
  hairComb,
  floralCrown,
};

export const ACCESSORY_ORDER: AccessoryType[] = [
  'none', 'tiara', 'headband', 'hairVine', 'hairComb', 'floralCrown',
];
