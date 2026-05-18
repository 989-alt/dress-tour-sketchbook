import { describe, it, expect } from 'vitest';
import {
  midpoint,
  applyAffine,
  toSvgTransform,
  solveAffine,
  twoTriangleWarp,
  meshWarp,
  IDENTITY,
  MESH_ANCHOR_ORDER,
  MESH_TRIANGLES,
} from './warp';
import type { SilhouetteReferencePose } from './warp';
import type { AnchorSet } from '../types';

// ---- 1. midpoint ----
describe('midpoint', () => {
  it('returns the average of two points', () => {
    expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 20 })).toEqual({ x: 5, y: 10 });
  });

  it('works with non-integer coordinates', () => {
    const r = midpoint({ x: 1, y: 3 }, { x: 2, y: 5 });
    expect(r.x).toBeCloseTo(1.5);
    expect(r.y).toBeCloseTo(4);
  });
});

// ---- 2. applyAffine with IDENTITY ----
describe('applyAffine', () => {
  it('IDENTITY returns the same point', () => {
    const p = { x: 37, y: 42 };
    expect(applyAffine(IDENTITY, p)).toEqual(p);
  });

  it('scale + translate produces correct result', () => {
    // u = 2*x + 0*y + 10, v = 0*x + 3*y + 5
    const m = { a: 2, b: 0, c: 0, d: 3, tx: 10, ty: 5 };
    const r = applyAffine(m, { x: 4, y: 6 });
    expect(r.x).toBeCloseTo(18); // 2*4 + 10
    expect(r.y).toBeCloseTo(23); // 3*6 + 5
  });

  it('handles rotation matrix', () => {
    // 90° CCW: u = -y, v = x  → a=0, c=-1, tx=0, b=1, d=0, ty=0
    const m = { a: 0, b: 1, c: -1, d: 0, tx: 0, ty: 0 };
    const r = applyAffine(m, { x: 1, y: 0 });
    expect(r.x).toBeCloseTo(0);
    expect(r.y).toBeCloseTo(1);
  });
});

// ---- 4 & 5. toSvgTransform ----
describe('toSvgTransform', () => {
  it('IDENTITY produces "matrix(1 0 0 1 0 0)"', () => {
    expect(toSvgTransform(IDENTITY)).toBe('matrix(1 0 0 1 0 0)');
  });

  it('non-trivial matrix produces correct SVG matrix() string', () => {
    // a=2, b=3, c=4, d=5, tx=6, ty=7
    // SVG matrix(a b c d e f) where our mapping: a→a, b→b, c→c, d→d, tx→e, ty→f
    const m = { a: 2, b: 3, c: 4, d: 5, tx: 6, ty: 7 };
    expect(toSvgTransform(m)).toBe('matrix(2 3 4 5 6 7)');
  });

  it('produces correct string for scale matrix', () => {
    const m = { a: 0.5, b: 0, c: 0, d: 2, tx: 10, ty: -5 };
    expect(toSvgTransform(m)).toBe('matrix(0.5 0 0 2 10 -5)');
  });
});

// ---- 6–11. solveAffine ----
describe('solveAffine', () => {
  // Test 6: src == dst → IDENTITY
  it('returns IDENTITY when src == dst', () => {
    const pts: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 },
    ];
    const m = solveAffine(pts, pts);
    expect(m.a).toBeCloseTo(1);
    expect(m.b).toBeCloseTo(0);
    expect(m.c).toBeCloseTo(0);
    expect(m.d).toBeCloseTo(1);
    expect(m.tx).toBeCloseTo(0);
    expect(m.ty).toBeCloseTo(0);
  });

  // Test 7: diagonal scale
  it('src=(0,0),(1,0),(0,1) dst=(0,0),(2,0),(0,3) → scale {a:2,d:3}', () => {
    const src: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 },
    ];
    const dst: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 3 },
    ];
    const m = solveAffine(src, dst);
    expect(m.a).toBeCloseTo(2);
    expect(m.b).toBeCloseTo(0);
    expect(m.c).toBeCloseTo(0);
    expect(m.d).toBeCloseTo(3);
    expect(m.tx).toBeCloseTo(0);
    expect(m.ty).toBeCloseTo(0);
  });

  // Test 8: 90° rotation
  it('src=(0,0),(1,0),(0,1) dst=(0,0),(0,1),(-1,0) → 90° CCW rotation', () => {
    const src: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 },
    ];
    const dst: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
    ];
    const m = solveAffine(src, dst);
    // 90° CCW: u = 0*x + (-1)*y + 0, v = 1*x + 0*y + 0
    expect(m.a).toBeCloseTo(0);
    expect(m.c).toBeCloseTo(-1);
    expect(m.b).toBeCloseTo(1);
    expect(m.d).toBeCloseTo(0);
    expect(m.tx).toBeCloseTo(0);
    expect(m.ty).toBeCloseTo(0);
  });

  // Test 9: translation
  it('src=(0,0),(1,0),(0,1) dst=(5,7),(6,7),(5,8) → translation by (5,7)', () => {
    const src: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 },
    ];
    const dst: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 8 },
    ];
    const m = solveAffine(src, dst);
    expect(m.a).toBeCloseTo(1);
    expect(m.b).toBeCloseTo(0);
    expect(m.c).toBeCloseTo(0);
    expect(m.d).toBeCloseTo(1);
    expect(m.tx).toBeCloseTo(5);
    expect(m.ty).toBeCloseTo(7);
  });

  // Test 10: degenerate triangle throws
  it('throws DEGENERATE_TRIANGLE for collinear source points', () => {
    const src: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 },
    ];
    const dst: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 },
    ];
    expect(() => solveAffine(src, dst)).toThrow('DEGENERATE_TRIANGLE');
  });

  // Test 11: round-trip property test
  it('round-trip: applyAffine(solveAffine(src, dst), src[i]) ≈ dst[i]', () => {
    const src: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 10, y: 30 }, { x: 200, y: 50 }, { x: 80, y: 400 },
    ];
    const dst: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 50, y: 70 }, { x: 300, y: 100 }, { x: 150, y: 600 },
    ];
    const m = solveAffine(src, dst);
    for (let i = 0; i < 3; i++) {
      const mapped = applyAffine(m, src[i]);
      expect(mapped.x).toBeCloseTo(dst[i].x, 5);
      expect(mapped.y).toBeCloseTo(dst[i].y, 5);
    }
  });

  // Additional: another round-trip with shear
  it('round-trip with shear transform', () => {
    const src: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 200 },
    ];
    const dst: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }] = [
      { x: 10, y: 20 }, { x: 130, y: 40 }, { x: 80, y: 250 },
    ];
    const m = solveAffine(src, dst);
    for (let i = 0; i < 3; i++) {
      const mapped = applyAffine(m, src[i]);
      expect(mapped.x).toBeCloseTo(dst[i].x, 5);
      expect(mapped.y).toBeCloseTo(dst[i].y, 5);
    }
  });
});

// ---- 12. twoTriangleWarp ----
describe('twoTriangleWarp', () => {
  const srcSL = { x: 50, y: 100 };
  const srcSR = { x: 350, y: 100 };
  const srcW = { x: 200, y: 300 };
  const srcHL = { x: 80, y: 600 };
  const srcHR = { x: 320, y: 600 };

  const anchors = {
    shoulderL: { x: 60, y: 120 },
    shoulderR: { x: 340, y: 120 },
    waist: { x: 190, y: 310 },
    hemL: { x: 90, y: 620 },
    hemR: { x: 310, y: 620 },
  };

  it('returns upper and lower matrices that correctly map their input triangles', () => {
    const result = twoTriangleWarp(srcSL, srcSR, srcW, srcHL, srcHR, anchors);

    // Upper: (srcSL, srcSR, srcW) → (shoulderL, shoulderR, waist)
    const upperSrc = [srcSL, srcSR, srcW];
    const upperDst = [anchors.shoulderL, anchors.shoulderR, anchors.waist];
    for (let i = 0; i < 3; i++) {
      const mapped = applyAffine(result.upper, upperSrc[i]);
      expect(mapped.x).toBeCloseTo(upperDst[i].x, 4);
      expect(mapped.y).toBeCloseTo(upperDst[i].y, 4);
    }

    // Lower: (srcW, srcHL, srcHR) → (waist, hemL, hemR)
    const lowerSrc = [srcW, srcHL, srcHR];
    const lowerDst = [anchors.waist, anchors.hemL, anchors.hemR];
    for (let i = 0; i < 3; i++) {
      const mapped = applyAffine(result.lower, lowerSrc[i]);
      expect(mapped.x).toBeCloseTo(lowerDst[i].x, 4);
      expect(mapped.y).toBeCloseTo(lowerDst[i].y, 4);
    }
  });

  it('clip triangles are the source triangles', () => {
    const result = twoTriangleWarp(srcSL, srcSR, srcW, srcHL, srcHR, anchors);
    expect(result.upperClip).toEqual([srcSL, srcSR, srcW]);
    expect(result.lowerClip).toEqual([srcW, srcHL, srcHR]);
  });
});

// ---- 13–16. meshWarp + constants ----
describe('MESH_ANCHOR_ORDER', () => {
  it('has length 13', () => {
    expect(MESH_ANCHOR_ORDER).toHaveLength(13);
  });

  it('starts with headTop', () => {
    expect(MESH_ANCHOR_ORDER[0]).toBe('headTop');
  });

  it('contains all expected anchor names', () => {
    const expected = [
      'headTop', 'shoulderL', 'shoulderR', 'bust', 'waist',
      'hipL', 'hipR', 'kneeL', 'kneeR', 'hemL', 'hemR', 'hemCenter', 'neckCenter',
    ];
    expect([...MESH_ANCHOR_ORDER]).toEqual(expected);
  });
});

describe('MESH_TRIANGLES', () => {
  it('has length 12', () => {
    expect(MESH_TRIANGLES).toHaveLength(12);
  });

  it('first triangle is T1 = (0,1,2)', () => {
    expect(MESH_TRIANGLES[0]).toEqual({ i0: 0, i1: 1, i2: 2 });
  });
});

// Build a synthetic reference and anchors for meshWarp tests
function makeReferenceAndAnchors(): { reference: SilhouetteReferencePose; anchors: AnchorSet } {
  const refAnchors: AnchorSet = {
    headTop:    { x: 200, y: 50 },
    shoulderL:  { x: 100, y: 200 },
    shoulderR:  { x: 300, y: 200 },
    bust:       { x: 200, y: 300 },
    waist:      { x: 200, y: 400 },
    hipL:       { x: 120, y: 500 },
    hipR:       { x: 280, y: 500 },
    kneeL:      { x: 130, y: 620 },
    kneeR:      { x: 270, y: 620 },
    hemL:       { x: 140, y: 750 },
    hemR:       { x: 260, y: 750 },
    hemCenter:  { x: 200, y: 760 },
    neckCenter: { x: 200, y: 160 },
    chin:       { x: 200, y: 90 },
  };

  // Anchors = reference + a shift (simulating a different pose)
  const s = 20, t = 30;
  const anchors: AnchorSet = {
    headTop:    { x: refAnchors.headTop.x + s,    y: refAnchors.headTop.y + t },
    shoulderL:  { x: refAnchors.shoulderL.x + s,  y: refAnchors.shoulderL.y + t },
    shoulderR:  { x: refAnchors.shoulderR.x + s,  y: refAnchors.shoulderR.y + t },
    bust:       { x: refAnchors.bust.x + s,        y: refAnchors.bust.y + t },
    waist:      { x: refAnchors.waist.x + s,       y: refAnchors.waist.y + t },
    hipL:       { x: refAnchors.hipL.x + s,        y: refAnchors.hipL.y + t },
    hipR:       { x: refAnchors.hipR.x + s,        y: refAnchors.hipR.y + t },
    kneeL:      { x: refAnchors.kneeL.x + s,       y: refAnchors.kneeL.y + t },
    kneeR:      { x: refAnchors.kneeR.x + s,       y: refAnchors.kneeR.y + t },
    hemL:       { x: refAnchors.hemL.x + s,        y: refAnchors.hemL.y + t },
    hemR:       { x: refAnchors.hemR.x + s,        y: refAnchors.hemR.y + t },
    hemCenter:  { x: refAnchors.hemCenter.x + s,   y: refAnchors.hemCenter.y + t },
    neckCenter: { x: refAnchors.neckCenter.x + s,  y: refAnchors.neckCenter.y + t },
    chin:       { x: refAnchors.chin.x + s,        y: refAnchors.chin.y + t },
  };

  return {
    reference: { anchors: refAnchors },
    anchors,
  };
}

describe('meshWarp', () => {
  it('returns 12 entries', () => {
    const { reference, anchors } = makeReferenceAndAnchors();
    const result = meshWarp(reference, anchors);
    expect(result).toHaveLength(12);
  });

  it('first triangle T1 maps reference (headTop, shoulderL, shoulderR) → anchor positions', () => {
    const { reference, anchors } = makeReferenceAndAnchors();
    const result = meshWarp(reference, anchors);

    const t1 = result[0];
    // T1: indices 0,1,2 = headTop, shoulderL, shoulderR
    const refPts = [reference.anchors.headTop, reference.anchors.shoulderL, reference.anchors.shoulderR];
    const dstPts = [anchors.headTop, anchors.shoulderL, anchors.shoulderR];

    for (let i = 0; i < 3; i++) {
      const mapped = applyAffine(t1.transform, refPts[i]);
      expect(mapped.x).toBeCloseTo(dstPts[i].x, 4);
      expect(mapped.y).toBeCloseTo(dstPts[i].y, 4);
    }
  });

  it('clip triangles are reference-space triangles', () => {
    const { reference, anchors } = makeReferenceAndAnchors();
    const result = meshWarp(reference, anchors);
    const t1 = result[0];
    // T1 clip = (headTop, shoulderL, shoulderR) in reference space
    expect(t1.clipTriangleInSrcSpace[0]).toEqual(reference.anchors.headTop);
    expect(t1.clipTriangleInSrcSpace[1]).toEqual(reference.anchors.shoulderL);
    expect(t1.clipTriangleInSrcSpace[2]).toEqual(reference.anchors.shoulderR);
  });

  it('all 12 triangles produce transforms that round-trip correctly', () => {
    const { reference, anchors } = makeReferenceAndAnchors();
    const result = meshWarp(reference, anchors);

    for (let t = 0; t < 12; t++) {
      const tri = MESH_TRIANGLES[t];
      const { transform } = result[t];
      const keys = [tri.i0, tri.i1, tri.i2].map((i) => MESH_ANCHOR_ORDER[i]);
      for (const key of keys) {
        const refPt = reference.anchors[key as keyof AnchorSet];
        const dstPt = anchors[key as keyof AnchorSet];
        const mapped = applyAffine(transform, refPt);
        expect(mapped.x).toBeCloseTo(dstPt.x, 4);
        expect(mapped.y).toBeCloseTo(dstPt.y, 4);
      }
    }
  });
});
