import type { SilhouetteDef } from './types';
import { canonicalPose, standardRegions } from './pose';

// Trumpet: fitted bodice, flare begins at mid-hip (higher than mermaid)
const bodyPath =
  'M 200,100' +
  ' L 140,120' +
  ' C 130,180 126,280 126,400' +
  ' C 126,440 130,460 135,500' +
  ' C 130,570 128,650 160,780' +
  ' L 240,780' +
  ' C 272,650 270,570 265,500' +
  ' C 270,460 274,440 274,400' +
  ' C 274,280 270,180 260,120' +
  ' Z';

export const trumpet: SilhouetteDef = {
  type: 'trumpet',
  viewBox: { width: 400, height: 800 },
  bodyPath,
  referencePose: canonicalPose(
    { x: 160, y: 780 },
    { x: 240, y: 780 },
    { x: 200, y: 780 },
  ),
  regions: standardRegions({ x: 160, y: 780 }, { x: 240, y: 780 }),
};
