import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// Fit & Flare: fitted through waist then gentle flare from hips down
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 130,180 126,280 126,400' +
  ' C 126,450 128,470 120,560' +
  ' C 115,640 112,700 140,780' +
  ' L 260,780' +
  ' C 288,700 285,640 280,560' +
  ' C 272,470 274,450 274,400' +
  ' C 274,280 270,180 260,120' +
  ' Z';

export const fitFlare: SilhouetteDef = {
  type: 'fitFlare',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 140, y: 780 },
    { x: 260, y: 780 },
    { x: 200, y: 780 },
  ),
  regions: standardRegions({ x: 140, y: 780 }, { x: 260, y: 780 }),
};
