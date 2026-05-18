import type { BodiceStructure, WaistAccent, WaistPosition } from '../../types';
import type { BodiceStructureDef, WaistAccentDef } from './types';
export type { BodiceStructureDef, WaistAccentDef, BodiceContext, AccentContext } from './types';

import { corset }     from './structures/corset';
import { softFit }    from './structures/softFit';
import { peplum }     from './structures/peplum';
import { mockPeplum } from './structures/mockPeplum';

import { noneAccent } from './accents/none';
import { sash }       from './accents/sash';
import { ribbon }     from './accents/ribbon';
import { brooch }     from './accents/brooch';
import { beadedBand } from './accents/beadedBand';

export const STRUCTURES: Record<BodiceStructure, BodiceStructureDef> = {
  corset,
  softFit,
  peplum,
  mockPeplum,
};

export const ACCENTS: Record<WaistAccent, WaistAccentDef> = {
  none:       noneAccent,
  sash,
  ribbon,
  brooch,
  beadedBand,
};

export const WAIST_Y_OFFSET: Record<WaistPosition, number> = {
  natural:    0,
  empire:   -100,
  basque:     50,
  drop:      100,
  asymmetric: 30,
};
