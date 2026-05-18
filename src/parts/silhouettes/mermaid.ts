import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// Mermaid: very fitted shoulder→knee, dramatic flare from mid-thigh to hem
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 130,180 126,280 125,400' +
  ' C 124,450 156,470 158,540' +
  ' C 160,610 140,660 170,780' +
  ' L 230,780' +
  ' C 260,660 240,610 242,540' +
  ' C 244,470 276,450 275,400' +
  ' C 274,280 270,180 260,120' +
  ' Z';

export const mermaid: SilhouetteDef = {
  type: 'mermaid',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 170, y: 780 },
    { x: 230, y: 780 },
    { x: 200, y: 780 },
  ),
  regions: standardRegions({ x: 170, y: 780 }, { x: 230, y: 780 }),
};
