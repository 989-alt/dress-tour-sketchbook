import type { SkirtTexture } from '../../types';
import type { SkirtTextureDef } from './types';
export type { SkirtTextureDef } from './types';

import { smooth }          from './textures/smooth';
import { gathered }        from './textures/gathered';
import { pleated }         from './textures/pleated';
import { tiered }          from './textures/tiered';
import { layeredTulle }    from './textures/layeredTulle';
import { ruffled }         from './textures/ruffled';
import { ruched }          from './textures/ruched';
import { asymmetricDrape } from './textures/asymmetricDrape';

export { slitCutout } from './slits';
export type { SlitTypeKey } from './slits';

export { trainPath } from './trains';
export type { TrainKey } from './trains';

export const TEXTURES: Record<SkirtTexture, SkirtTextureDef> = {
  smooth,
  gathered,
  pleated,
  tiered,
  layeredTulle,
  ruffled,
  ruched,
  asymmetricDrape,
};
