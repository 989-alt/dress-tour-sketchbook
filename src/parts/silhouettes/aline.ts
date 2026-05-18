import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// A-line: fitted bodice, progressive flare from waist to hem (width ~180 at floor)
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 125,180 118,280 115,400' +
  ' C 112,460 108,520 110,780' +
  ' L 290,780' +
  ' C 292,520 288,460 285,400' +
  ' C 282,280 275,180 260,120' +
  ' Z';

export const aline: SilhouetteDef = {
  type: 'aline',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 110, y: 780 },
    { x: 290, y: 780 },
    { x: 200, y: 780 },
  ),
  regions: standardRegions({ x: 110, y: 780 }, { x: 290, y: 780 }),
};
