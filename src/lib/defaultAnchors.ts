import type { AnchorSet } from '../types';

export function defaultAnchors(w: number, h: number): AnchorSet {
  // Rough proportional defaults when no pose detection is available
  const cx = w / 2;
  return {
    headTop:    { x: cx,            y: h * 0.02 },
    chin:       { x: cx,            y: h * 0.10 },
    neckCenter: { x: cx,            y: h * 0.13 },
    shoulderL:  { x: cx - w * 0.10, y: h * 0.17 },
    shoulderR:  { x: cx + w * 0.10, y: h * 0.17 },
    bust:       { x: cx,            y: h * 0.27 },
    waist:      { x: cx,            y: h * 0.42 },
    hipL:       { x: cx - w * 0.08, y: h * 0.52 },
    hipR:       { x: cx + w * 0.08, y: h * 0.52 },
    kneeL:      { x: cx - w * 0.06, y: h * 0.70 },
    kneeR:      { x: cx + w * 0.06, y: h * 0.70 },
    hemL:       { x: cx - w * 0.10, y: h * 0.90 },
    hemR:       { x: cx + w * 0.10, y: h * 0.90 },
    hemCenter:  { x: cx,            y: h * 0.92 },
  };
}
