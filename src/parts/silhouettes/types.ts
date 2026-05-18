import type { SilhouetteReferencePose } from '../../lib/warp';
import type { Point, SilhouetteType } from '../../types';

export interface RegionDef {
  name: 'bodice' | 'waist' | 'skirt' | 'sleeves';
  // One or more closed polygons in canonical viewBox coords.
  // Multiple entries represent disjoint sub-regions (e.g., two arms for sleeves).
  polygons: Point[][];
}

export interface SilhouetteDef {
  type: SilhouetteType;
  viewBox: { width: 400; height: 800 };
  bodyPath: string;
  referencePose: SilhouetteReferencePose;
  regions: RegionDef[];
}
