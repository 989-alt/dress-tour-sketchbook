import { describe, it, expect } from 'vitest';
import { NECKLINES } from './index';
import type { NecklineType } from '../../types';

const ALL_TYPES: NecklineType[] = [
  'sweetheart', 'vRegular', 'vDeep', 'vPlunging', 'halter',
  'offShoulder', 'oneShoulder', 'strapless', 'boat', 'illusionCrew',
  'square', 'scoop', 'portrait', 'highNeck', 'keyhole',
];

describe('NECKLINES record', () => {
  it('exports exactly 15 neckline types', () => {
    expect(Object.keys(NECKLINES)).toHaveLength(15);
  });

  it('contains all 15 NecklineType values as keys', () => {
    for (const type of ALL_TYPES) {
      expect(NECKLINES).toHaveProperty(type);
    }
  });
});

describe.each(ALL_TYPES)('neckline: %s', (type) => {
  const def = NECKLINES[type];

  it('has the correct type field', () => {
    expect(def.type).toBe(type);
  });

  it('cutoutPath is a non-empty string starting with M and ending with Z or z', () => {
    expect(typeof def.cutoutPath).toBe('string');
    expect(def.cutoutPath.length).toBeGreaterThan(0);
    expect(def.cutoutPath.trimStart()[0]).toBe('M');
    expect(def.cutoutPath.trim().slice(-1).toLowerCase()).toBe('z');
  });

  it('label is a non-empty string', () => {
    expect(typeof def.label).toBe('string');
    expect(def.label.length).toBeGreaterThan(0);
  });

  it('topY, if present, is a positive number', () => {
    if (def.topY !== undefined) {
      expect(typeof def.topY).toBe('number');
      expect(def.topY).toBeGreaterThan(0);
    }
  });
});
