import type { SilhouetteReferencePose } from '../../lib/warp';
import type { Point, SilhouetteType } from '../../types';

export interface RegionDef {
  name: 'bodice' | 'waist' | 'skirt' | 'sleeves';
  polygon: Point[];
}

export interface SilhouetteDef {
  type: SilhouetteType;
  viewBox: { width: 400; height: 800 };
  bodyPath: string;
  referencePose: SilhouetteReferencePose;
  regions: RegionDef[];
}
