import { describe, it, expect } from 'vitest';
import { SILHOUETTES } from './index';
import { MESH_ANCHOR_ORDER } from '../../lib/warp';
import type { SilhouetteType } from '../../types';

const ALL_TYPES: SilhouetteType[] = [
  'aline', 'mermaid', 'trumpet', 'princess', 'sheath',
  'empire', 'fitFlare', 'tealength', 'mini',
];

const REGION_NAMES = ['bodice', 'waist', 'skirt', 'sleeves'] as const;

describe('SILHOUETTES record', () => {
  it('exports all 9 silhouette types', () => {
    expect(Object.keys(SILHOUETTES)).toHaveLength(9);
    for (const type of ALL_TYPES) {
      expect(SILHOUETTES).toHaveProperty(type);
    }
  });
});

describe.each(ALL_TYPES)('silhouette: %s', (type) => {
  const def = SILHOUETTES[type];

  it('has correct viewBox dimensions', () => {
    expect(def.viewBox.width).toBe(400);
    expect(def.viewBox.height).toBe(800);
  });

  it('has type set correctly', () => {
    expect(def.type).toBe(type);
  });

  it('has a valid bodyPath (non-empty, starts with M, ends with Z)', () => {
    expect(typeof def.bodyPath).toBe('string');
    expect(def.bodyPath.length).toBeGreaterThan(0);
    expect(def.bodyPath.trimStart()[0]).toBe('M');
    expect(def.bodyPath.trim().slice(-1).toLowerCase()).toBe('z');
  });

  it('has all 13 MESH_ANCHOR_ORDER keys in referencePose.anchors', () => {
    const anchorKeys = Object.keys(def.referencePose.anchors);
    for (const key of MESH_ANCHOR_ORDER) {
      expect(anchorKeys).toContain(key);
    }
    expect(anchorKeys).toHaveLength(14); // AnchorSet has 14 keys (incl. chin)
  });

  it('has exactly 4 regions', () => {
    expect(def.regions).toHaveLength(4);
  });

  it('has all 4 required region names', () => {
    const names = def.regions.map((r) => r.name);
    for (const name of REGION_NAMES) {
      expect(names).toContain(name);
    }
  });

  it('each region polygon has at least 3 points', () => {
    for (const region of def.regions) {
      for (const polygon of region.polygons) {
        expect(polygon.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('sleeves region has exactly 2 polygons; all other regions have exactly 1', () => {
    for (const region of def.regions) {
      if (region.name === 'sleeves') {
        expect(region.polygons).toHaveLength(2);
      } else {
        expect(region.polygons).toHaveLength(1);
      }
    }
  });

  it('canonical shared anchors match expected positions', () => {
    const a = def.referencePose.anchors;
    expect(a.headTop).toEqual({ x: 200, y: 20 });
    expect(a.chin).toEqual({ x: 200, y: 70 });
    expect(a.neckCenter).toEqual({ x: 200, y: 100 });
    expect(a.shoulderL).toEqual({ x: 140, y: 120 });
    expect(a.shoulderR).toEqual({ x: 260, y: 120 });
    expect(a.bust).toEqual({ x: 200, y: 220 });
    expect(a.waist).toEqual({ x: 200, y: 400 });
    expect(a.hipL).toEqual({ x: 155, y: 480 });
    expect(a.hipR).toEqual({ x: 245, y: 480 });
    expect(a.kneeL).toEqual({ x: 170, y: 620 });
    expect(a.kneeR).toEqual({ x: 230, y: 620 });
  });

  it('hemL/hemR/hemCenter x coords are consistent (hemCenter between hemL and hemR)', () => {
    const { hemL, hemR, hemCenter } = def.referencePose.anchors;
    expect(hemCenter.x).toBeGreaterThanOrEqual(hemL.x);
    expect(hemCenter.x).toBeLessThanOrEqual(hemR.x);
    expect(hemL.y).toBe(hemR.y);
    expect(hemCenter.y).toBe(hemL.y);
  });
});

describe('hem y-positions by silhouette', () => {
  it('tealength hem is above floor (y=670)', () => {
    const { hemL } = SILHOUETTES.tealength.referencePose.anchors;
    expect(hemL.y).toBe(670);
  });

  it('mini hem is above knee (y=540)', () => {
    const { hemL } = SILHOUETTES.mini.referencePose.anchors;
    expect(hemL.y).toBe(540);
  });

  it('floor-length silhouettes have hem at y=780', () => {
    const floorTypes: SilhouetteType[] = ['aline', 'mermaid', 'trumpet', 'princess', 'sheath', 'empire', 'fitFlare'];
    for (const t of floorTypes) {
      expect(SILHOUETTES[t].referencePose.anchors.hemL.y).toBe(780);
    }
  });
});
