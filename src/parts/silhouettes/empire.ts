import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// Empire: high waist right under bust (~y=240), then flowing skirt drapes to hem
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 135,160 132,200 130,240' +
  ' C 122,300 115,400 112,500' +
  ' C 110,600 110,700 120,780' +
  ' L 280,780' +
  ' C 290,700 290,600 288,500' +
  ' C 285,400 278,300 270,240' +
  ' C 268,200 265,160 260,120' +
  ' Z';

export const empire: SilhouetteDef = {
  type: 'empire',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 120, y: 780 },
    { x: 280, y: 780 },
    { x: 200, y: 780 },
  ),
  regions: standardRegions({ x: 120, y: 780 }, { x: 280, y: 780 }),
};
