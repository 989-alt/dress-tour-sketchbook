import type { Point } from '../../types';

/** Compute bounding box of a polygon. */
function bbox(poly: Point[]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of poly) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

/** Returns grid points inside the bounding box of a polygon at given step spacing.
 *  Visual approximation: some may fall outside polygon edges. */
export function gridPositions(polygons: Point[][], step: number): Point[] {
  if (!polygons.length) return [];
  const pts: Point[] = [];
  for (const poly of polygons) {
    const { minX, maxX, minY, maxY } = bbox(poly);
    const halfStep = step / 2;
    for (let y = minY + halfStep; y < maxY; y += step) {
      for (let x = minX + halfStep; x < maxX; x += step) {
        pts.push({ x, y });
      }
    }
  }
  return pts;
}

/** Step size from intensity (1=sparse, 5=dense). */
export function intensityToStep(intensity: 1 | 2 | 3 | 4 | 5): number {
  // intensity 1 → step 60, intensity 5 → step 20
  return 70 - intensity * 10;
}
