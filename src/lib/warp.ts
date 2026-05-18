import type { Point, AnchorSet } from '../types';

export interface AffineMatrix {
  // 2D affine transform: u = a*x + c*y + tx, v = b*x + d*y + ty
  a: number; b: number; c: number; d: number; tx: number; ty: number;
}

export const IDENTITY: AffineMatrix = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function applyAffine(m: AffineMatrix, p: Point): Point {
  return {
    x: m.a * p.x + m.c * p.y + m.tx,
    y: m.b * p.x + m.d * p.y + m.ty,
  };
}

export function toSvgTransform(m: AffineMatrix): string {
  // SVG matrix(a b c d e f): newX = a*x + c*y + e, newY = b*x + d*y + f
  // Our convention: u = a*x + c*y + tx, v = b*x + d*y + ty
  // Mapping: SVG a→our a, SVG b→our b, SVG c→our c, SVG d→our d, SVG e→our tx, SVG f→our ty
  return `matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.tx} ${m.ty})`;
}

export function solveAffine(
  src: [Point, Point, Point],
  dst: [Point, Point, Point],
): AffineMatrix {
  const [p1, p2, p3] = src;
  const [q1, q2, q3] = dst;

  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;

  const u1 = q1.x, v1 = q1.y;
  const u2 = q2.x, v2 = q2.y;
  const u3 = q3.x, v3 = q3.y;

  // Determinant of [[x1,y1,1],[x2,y2,1],[x3,y3,1]]
  const D = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);

  if (Math.abs(D) < 1e-9) {
    throw new Error('DEGENERATE_TRIANGLE');
  }

  // Solve for [a, c, tx] using Cramer's rule (u coordinates)
  const a  = (u1 * (y2 - y3) + u2 * (y3 - y1) + u3 * (y1 - y2)) / D;
  const c  = (x1 * (u2 - u3) + x2 * (u3 - u1) + x3 * (u1 - u2)) / D;
  const tx = (x1 * (y2 * u3 - y3 * u2) - y1 * (x2 * u3 - x3 * u2) + u1 * (x2 * y3 - x3 * y2)) / D;

  // Solve for [b, d, ty] using Cramer's rule (v coordinates)
  const b  = (v1 * (y2 - y3) + v2 * (y3 - y1) + v3 * (y1 - y2)) / D;
  const d  = (x1 * (v2 - v3) + x2 * (v3 - v1) + x3 * (v1 - v2)) / D;
  const ty = (x1 * (y2 * v3 - y3 * v2) - y1 * (x2 * v3 - x3 * v2) + v1 * (x2 * y3 - x3 * y2)) / D;

  return { a, b, c, d, tx, ty };
}

export function twoTriangleWarp(
  srcShoulderL: Point, srcShoulderR: Point, srcWaist: Point, srcHemL: Point, srcHemR: Point,
  anchors: { shoulderL: Point; shoulderR: Point; waist: Point; hemL: Point; hemR: Point },
): {
  upper: AffineMatrix;
  lower: AffineMatrix;
  upperClip: [Point, Point, Point];
  lowerClip: [Point, Point, Point];
} {
  const upperSrc: [Point, Point, Point] = [srcShoulderL, srcShoulderR, srcWaist];
  const upperDst: [Point, Point, Point] = [anchors.shoulderL, anchors.shoulderR, anchors.waist];

  const lowerSrc: [Point, Point, Point] = [srcWaist, srcHemL, srcHemR];
  const lowerDst: [Point, Point, Point] = [anchors.waist, anchors.hemL, anchors.hemR];

  return {
    upper: solveAffine(upperSrc, upperDst),
    lower: solveAffine(lowerSrc, lowerDst),
    upperClip: upperSrc,
    lowerClip: lowerSrc,
  };
}

// Mesh anchor order — 13 points
export const MESH_ANCHOR_ORDER: readonly (keyof AnchorSet)[] = [
  'headTop',    // 0
  'shoulderL',  // 1
  'shoulderR',  // 2
  'bust',       // 3
  'waist',      // 4
  'hipL',       // 5
  'hipR',       // 6
  'kneeL',      // 7
  'kneeR',      // 8
  'hemL',       // 9
  'hemR',       // 10
  'hemCenter',  // 11
  'neckCenter', // 12
] as const;

export interface MeshTriangle {
  i0: number; i1: number; i2: number;
}

export type MeshAnchorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// 12 triangles covering the body mesh
export const MESH_TRIANGLES: readonly MeshTriangle[] = [
  { i0: 0, i1: 1, i2: 2  },  // T1:  headTop, shoulderL, shoulderR
  { i0: 1, i1: 2, i2: 3  },  // T2:  shoulderL, shoulderR, bust
  { i0: 1, i1: 3, i2: 4  },  // T3:  shoulderL, bust, waist
  { i0: 2, i1: 3, i2: 4  },  // T4:  shoulderR, bust, waist
  { i0: 1, i1: 4, i2: 5  },  // T5:  shoulderL, waist, hipL
  { i0: 2, i1: 4, i2: 6  },  // T6:  shoulderR, waist, hipR
  { i0: 5, i1: 6, i2: 4  },  // T7:  hipL, hipR, waist
  { i0: 5, i1: 7, i2: 6  },  // T8:  hipL, kneeL, hipR
  { i0: 6, i1: 8, i2: 5  },  // T9:  hipR, kneeR, hipL
  { i0: 7, i1: 9, i2: 8  },  // T10: kneeL, hemL, kneeR
  { i0: 8, i1: 10, i2: 7 },  // T11: kneeR, hemR, kneeL
  { i0: 7, i1: 8, i2: 11 },  // T12: kneeL, kneeR, hemCenter
] as const;

export interface SilhouetteReferencePose {
  anchors: Record<keyof AnchorSet, Point>;
}

export interface WarpedTriangle {
  transform: AffineMatrix;
  clipTriangleInSrcSpace: [Point, Point, Point];
}

export function meshWarp(
  reference: SilhouetteReferencePose,
  anchors: AnchorSet,
): WarpedTriangle[] {
  return MESH_TRIANGLES.map((tri) => {
    const keys = [tri.i0, tri.i1, tri.i2].map((i) => MESH_ANCHOR_ORDER[i] as keyof AnchorSet);
    const src: [Point, Point, Point] = [
      reference.anchors[keys[0]],
      reference.anchors[keys[1]],
      reference.anchors[keys[2]],
    ];
    const dst: [Point, Point, Point] = [
      anchors[keys[0]],
      anchors[keys[1]],
      anchors[keys[2]],
    ];
    return {
      transform: solveAffine(src, dst),
      clipTriangleInSrcSpace: src,
    };
  });
}
