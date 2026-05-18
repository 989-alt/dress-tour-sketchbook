import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// Tea-length: classic A-line shape but hem stops at mid-calf (y=670)
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 126,180 120,280 118,400' +
  ' C 116,480 115,560 130,670' +
  ' L 270,670' +
  ' C 285,560 284,480 282,400' +
  ' C 280,280 274,180 260,120' +
  ' Z';

export const tealength: SilhouetteDef = {
  type: 'tealength',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 130, y: 670 },
    { x: 270, y: 670 },
    { x: 200, y: 670 },
  ),
  regions: standardRegions({ x: 130, y: 670 }, { x: 270, y: 670 }),
};
