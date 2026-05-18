import { describe, it, expect } from 'vitest';
import { SLEEVES } from './index';
import type { SleeveType } from '../../types';

const ALL_SLEEVE_TYPES: SleeveType[] = [
  'sleeveless', 'cap', 'short', 'threeQuarter', 'long',
  'bishop', 'puff', 'bell', 'legOfMutton', 'illusion',
];

describe('SLEEVES record', () => {
  it('has all 10 sleeve types', () => {
    expect(Object.keys(SLEEVES)).toHaveLength(10);
    for (const type of ALL_SLEEVE_TYPES) {
      expect(SLEEVES).toHaveProperty(type);
    }
  });

  for (const type of ALL_SLEEVE_TYPES) {
    describe(`${type}`, () => {
      it('has correct type field', () => {
        expect(SLEEVES[type].type).toBe(type);
      });

      it('has a non-empty Korean label', () => {
        expect(typeof SLEEVES[type].label).toBe('string');
        expect(SLEEVES[type].label.length).toBeGreaterThan(0);
      });

      it('has paths.left and paths.right fields', () => {
        expect(SLEEVES[type].paths).toHaveProperty('left');
        expect(SLEEVES[type].paths).toHaveProperty('right');
      });

      it('has renders boolean', () => {
        expect(typeof SLEEVES[type].renders).toBe('boolean');
      });
    });
  }

  it('sleeveless has renders=false and empty paths', () => {
    expect(SLEEVES.sleeveless.renders).toBe(false);
    expect(SLEEVES.sleeveless.paths.left).toBe('');
    expect(SLEEVES.sleeveless.paths.right).toBe('');
  });

  it('all non-sleeveless types have renders=true', () => {
    const renderableTypes = ALL_SLEEVE_TYPES.filter((t) => t !== 'sleeveless');
    for (const type of renderableTypes) {
      expect(SLEEVES[type].renders).toBe(true);
    }
  });

  it('all renderable types have non-empty left paths', () => {
    const renderableTypes = ALL_SLEEVE_TYPES.filter((t) => t !== 'sleeveless');
    for (const type of renderableTypes) {
      expect(SLEEVES[type].paths.left.length).toBeGreaterThan(0);
    }
  });

  it('all renderable types have non-empty right paths', () => {
    const renderableTypes = ALL_SLEEVE_TYPES.filter((t) => t !== 'sleeveless');
    for (const type of renderableTypes) {
      expect(SLEEVES[type].paths.right.length).toBeGreaterThan(0);
    }
  });

  it('Korean labels are correct', () => {
    const expected: Record<SleeveType, string> = {
      sleeveless: '민소매',
      cap: '캡',
      short: '짧은',
      threeQuarter: '7부',
      long: '긴',
      bishop: '비숍',
      puff: '퍼프',
      bell: '벨',
      legOfMutton: '양다리',
      illusion: '일루전',
    };
    for (const type of ALL_SLEEVE_TYPES) {
      expect(SLEEVES[type].label).toBe(expected[type]);
    }
  });
});
