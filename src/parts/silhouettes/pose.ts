import type { SilhouetteReferencePose } from '../../lib/warp';
import type { Point } from '../../types';

/** Build a canonical reference pose for a silhouette.
 *  Only hemL, hemR, hemCenter vary per silhouette. */
export function canonicalPose(
  hemL: Point,
  hemR: Point,
  hemCenter: Point,
): SilhouetteReferencePose {
  return {
    anchors: {
      headTop:    { x: 200, y:  20 },
      chin:       { x: 200, y:  70 },
      neckCenter: { x: 200, y: 100 },
      shoulderL:  { x: 140, y: 120 },
      shoulderR:  { x: 260, y: 120 },
      bust:       { x: 200, y: 220 },
      waist:      { x: 200, y: 400 },
      hipL:       { x: 155, y: 480 },
      hipR:       { x: 245, y: 480 },
      kneeL:      { x: 170, y: 620 },
      kneeR:      { x: 230, y: 620 },
      hemL,
      hemR,
      hemCenter,
    },
  };
}

/** Standard 4-region set. skirtPolygon varies per silhouette. */
export function standardRegions(
  skirtBL: Point,
  skirtBR: Point,
) {
  return [
    {
      name: 'bodice' as const,
      polygons: [
        [
          { x: 140, y: 120 },
          { x: 260, y: 120 },
          { x: 245, y: 400 },
          { x: 155, y: 400 },
        ],
      ],
    },
    {
      name: 'waist' as const,
      polygons: [
        [
          { x: 155, y: 380 },
          { x: 245, y: 380 },
          { x: 245, y: 420 },
          { x: 155, y: 420 },
        ],
      ],
    },
    {
      name: 'skirt' as const,
      polygons: [
        [
          { x: 155, y: 400 },
          { x: 245, y: 400 },
          skirtBR,
          skirtBL,
        ],
      ],
    },
    {
      name: 'sleeves' as const,
      polygons: [
        [
          { x: 100, y: 110 },
          { x: 140, y: 110 },
          { x: 145, y: 300 },
          { x: 100, y: 300 },
        ],
        [
          { x: 260, y: 110 },
          { x: 300, y: 110 },
          { x: 300, y: 300 },
          { x: 255, y: 300 },
        ],
      ],
    },
  ];
}
