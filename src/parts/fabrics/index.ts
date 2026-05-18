import type { FabricType } from '../../types';
import type { FabricDef } from './types';
import { satinDef } from './satin';
import { mikadoDef } from './mikado';
import { organzaDef } from './organza';
import { tulleDef } from './tulle';
import { laceDef } from './lace';
import { chiffonDef } from './chiffon';
import { taffetaDef } from './taffeta';

export type { FabricDef } from './types';

export const FABRICS: Record<FabricType, FabricDef> = {
  satin:   satinDef,
  mikado:  mikadoDef,
  organza: organzaDef,
  tulle:   tulleDef,
  lace:    laceDef,
  chiffon: chiffonDef,
  taffeta: taffetaDef,
};
