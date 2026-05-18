import type { BackType } from '../../types';
import type { BackDef } from './types';
export type { BackDef } from './types';

import { closed }        from './closed';
import { vBack }         from './vBack';
import { illusionBack }  from './illusionBack';
import { openBack }      from './openBack';
import { keyhole }       from './keyhole';
import { buttonRow }     from './buttonRow';
import { laceUpCorset }  from './laceUpCorset';
import { drape }         from './drape';

export const BACKS: Record<BackType, BackDef> = {
  closed,
  vBack,
  illusionBack,
  openBack,
  keyhole,
  buttonRow,
  laceUpCorset,
  drape,
};
