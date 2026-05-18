import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// Sheath: narrow column dress, same width waist to floor
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 132,180 128,280 127,400' +
  ' C 127,500 128,640 170,780' +
  ' L 230,780' +
  ' C 272,640 273,500 273,400' +
  ' C 272,280 268,180 260,120' +
  ' Z';

export const sheath: SilhouetteDef = {
  type: 'sheath',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 170, y: 780 },
    { x: 230, y: 780 },
    { x: 200, y: 780 },
  ),
  regions: standardRegions({ x: 170, y: 780 }, { x: 230, y: 780 }),
};
