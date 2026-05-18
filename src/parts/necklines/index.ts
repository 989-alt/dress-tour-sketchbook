import type { NecklineType } from '../../types';
import type { NecklineDef } from './types';
export type { NecklineDef } from './types';

import { sweetheart }   from './sweetheart';
import { vRegular }     from './vRegular';
import { vDeep }        from './vDeep';
import { vPlunging }    from './vPlunging';
import { halter }       from './halter';
import { offShoulder }  from './offShoulder';
import { oneShoulder }  from './oneShoulder';
import { strapless }    from './strapless';
import { boat }         from './boat';
import { illusionCrew } from './illusionCrew';
import { square }       from './square';
import { scoop }        from './scoop';
import { portrait }     from './portrait';
import { highNeck }     from './highNeck';
import { keyhole }      from './keyhole';

export const NECKLINES: Record<NecklineType, NecklineDef> = {
  sweetheart,
  vRegular,
  vDeep,
  vPlunging,
  halter,
  offShoulder,
  oneShoulder,
  strapless,
  boat,
  illusionCrew,
  square,
  scoop,
  portrait,
  highNeck,
  keyhole,
};
