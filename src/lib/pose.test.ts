/**
 * Unit tests for landmarksToAnchors and helpers.
 *
 * Integration test for detectPose is deferred; requires
 * public/mediapipe-models/ assets and a real image.
 */
import { describe, it, expect } from 'vitest';
import { midpoint, landmarksToAnchors, LANDMARK_NAMES } from './pose';
import type { DetectResult } from './pose';
import type { PoseLandmarks } from '../types';

// Build a synthetic DetectResult where all 33 landmarks are placed at known positions.
// Most landmarks are placed at origin; only those we test are given distinct coords.
function makeSyntheticDetect(): DetectResult {
  const base = { x: 0, y: 0, visibility: 1 };
  const landmarks: PoseLandmarks = {};
  for (const name of LANDMARK_NAMES) {
    landmarks[name] = { ...base };
  }

  // Override landmarks we use in anchor computation
  landmarks['nose'] = { x: 200, y: 50, visibility: 1 };
  landmarks['leftEye'] = { x: 210, y: 40, visibility: 1 };
  landmarks['leftEar'] = { x: 230, y: 60, visibility: 1 };
  landmarks['leftShoulder'] = { x: 100, y: 200, visibility: 1 };
  landmarks['rightShoulder'] = { x: 300, y: 200, visibility: 1 };
  landmarks['leftHip'] = { x: 120, y: 500, visibility: 1 };
  landmarks['rightHip'] = { x: 280, y: 500, visibility: 1 };
  landmarks['leftKnee'] = { x: 130, y: 700, visibility: 1 };
  landmarks['rightKnee'] = { x: 270, y: 700, visibility: 1 };
  landmarks['leftAnkle'] = { x: 140, y: 900, visibility: 1 };
  landmarks['rightAnkle'] = { x: 260, y: 900, visibility: 1 };

  return {
    landmarks,
    confidence: Object.fromEntries(LANDMARK_NAMES.map((n) => [n, 1])),
    imageWidth: 400,
    imageHeight: 1000,
  };
}

describe('LANDMARK_NAMES', () => {
  it('has exactly 33 entries', () => {
    expect(LANDMARK_NAMES).toHaveLength(33);
  });

  it('starts with nose', () => {
    expect(LANDMARK_NAMES[0]).toBe('nose');
  });

  it('ends with rightFootIndex', () => {
    expect(LANDMARK_NAMES[32]).toBe('rightFootIndex');
  });
});

describe('midpoint', () => {
  it('returns the midpoint of two points', () => {
    const result = midpoint({ x: 0, y: 0 }, { x: 100, y: 200 });
    expect(result).toEqual({ x: 50, y: 100 });
  });

  it('works with equal points', () => {
    const p = { x: 42, y: 13 };
    expect(midpoint(p, p)).toEqual(p);
  });
});

describe('landmarksToAnchors', () => {
  const detect = makeSyntheticDetect();
  const anchors = landmarksToAnchors(detect);

  it('shoulderL equals leftShoulder', () => {
    expect(anchors.shoulderL).toEqual({ x: 100, y: 200 });
  });

  it('shoulderR equals rightShoulder', () => {
    expect(anchors.shoulderR).toEqual({ x: 300, y: 200 });
  });

  it('hipL equals leftHip', () => {
    expect(anchors.hipL).toEqual({ x: 120, y: 500 });
  });

  it('hipR equals rightHip', () => {
    expect(anchors.hipR).toEqual({ x: 280, y: 500 });
  });

  it('kneeL equals leftKnee', () => {
    expect(anchors.kneeL).toEqual({ x: 130, y: 700 });
  });

  it('hemCenter == midpoint(leftAnkle, rightAnkle)', () => {
    const expected = midpoint({ x: 140, y: 900 }, { x: 260, y: 900 });
    expect(anchors.hemCenter).toEqual(expected);
  });

  it('hemL equals leftAnkle', () => {
    expect(anchors.hemL).toEqual({ x: 140, y: 900 });
  });

  it('hemR equals rightAnkle', () => {
    expect(anchors.hemR).toEqual({ x: 260, y: 900 });
  });

  it('neckCenter is above shoulder midpoint (smaller y, since y increases downward)', () => {
    // midShoulder.y = 200; neckCenter should be above that
    expect(anchors.neckCenter.y).toBeLessThan(200);
  });

  it('waist is above hip midpoint (y < midHip.y)', () => {
    // midHip.y = 500; waist is midHip + 0.25*(midShoulder - midHip) => y = 500 + 0.25*(200-500) = 425
    expect(anchors.waist.y).toBeLessThan(500);
    expect(anchors.waist.y).toBeCloseTo(425, 1);
  });

  it('headTop is above nose (smaller y)', () => {
    expect(anchors.headTop.y).toBeLessThan(detect.landmarks['nose'].y);
  });

  it('chin is below nose (larger y)', () => {
    expect(anchors.chin.y).toBeGreaterThan(detect.landmarks['nose'].y);
  });

  it('bust.y is between neckCenter.y and waist.y', () => {
    expect(anchors.bust.y).toBeGreaterThan(anchors.neckCenter.y);
    expect(anchors.bust.y).toBeLessThan(anchors.waist.y);
  });
});
