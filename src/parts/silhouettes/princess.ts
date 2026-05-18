import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// Princess: fitted bodice with continuous gentle flare from natural waist, wide hem
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 128,180 122,280 120,400' +
  ' C 118,460 116,540 130,780' +
  ' L 270,780' +
  ' C 284,540 282,460 280,400' +
  ' C 278,280 272,180 260,120' +
  ' Z';

export const princess: SilhouetteDef = {
  type: 'princess',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 130, y: 780 },
    { x: 270, y: 780 },
    { x: 200, y: 780 },
  ),
  regions: standardRegions({ x: 130, y: 780 }, { x: 270, y: 780 }),
};
