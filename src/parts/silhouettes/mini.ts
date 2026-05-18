import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// Mini: very short hem above knee (y=540), A-line silhouette
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 130,180 126,280 126,400' +
  ' C 124,450 122,490 165,540' +
  ' L 235,540' +
  ' C 278,490 276,450 274,400' +
  ' C 274,280 270,180 260,120' +
  ' Z';

export const mini: SilhouetteDef = {
  type: 'mini',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 165, y: 540 },
    { x: 235, y: 540 },
    { x: 200, y: 540 },
  ),
  regions: standardRegions({ x: 165, y: 540 }, { x: 235, y: 540 }),
};
