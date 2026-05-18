import type { SilhouetteType } from '../../types';
import type { SilhouetteDef } from './types';

export type { SilhouetteDef, RegionDef } from './types';

import { aline }     from './aline';
import { mermaid }   from './mermaid';
import { trumpet }   from './trumpet';
import { princess }  from './princess';
import { sheath }    from './sheath';
import { empire }    from './empire';
import { fitFlare }  from './fitFlare';
import { tealength } from './tealength';
import { mini }      from './mini';

export const SILHOUETTES: Record<SilhouetteType, SilhouetteDef> = {
  aline,
  mermaid,
  trumpet,
  princess,
  sheath,
  empire,
  fitFlare,
  tealength,
  mini,
};
