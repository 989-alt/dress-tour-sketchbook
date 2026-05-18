import type { EmbellishmentType } from '../../types';
import type { EmbellishmentDef } from './types';
export type { EmbellishmentDef } from './types';

import { beads }             from './beads';
import { laceApplique }      from './laceApplique';
import { threeDFlorals }     from './threeDFlorals';
import { crystals }          from './crystals';
import { pearls }            from './pearls';
import { embroidery }        from './embroidery';
import { sequins }           from './sequins';
import { ribbons }           from './ribbons';
import { decorativeButtons } from './decorativeButtons';

export const EMBELLISHMENTS: Record<EmbellishmentType, EmbellishmentDef> = {
  beads,
  laceApplique,
  threeDFlorals,
  crystals,
  pearls,
  embroidery,
  sequins,
  ribbons,
  decorativeButtons,
};
