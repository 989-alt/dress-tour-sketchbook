import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TEXTURES, slitCutout, trainPath } from './index';
import type { SkirtTexture } from '../../types';

// ---------------------------------------------------------------------------
// TEXTURES — 8 entries
// ---------------------------------------------------------------------------
describe('TEXTURES record', () => {
  it('has exactly 8 texture entries', () => {
    expect(Object.keys(TEXTURES)).toHaveLength(8);
  });

  const ALL_TEXTURES: SkirtTexture[] = [
    'smooth', 'gathered', 'pleated', 'tiered',
    'layeredTulle', 'ruffled', 'ruched', 'asymmetricDrape',
  ];

  it.each(ALL_TEXTURES)('%s: type property matches key', (t) => {
    expect(TEXTURES[t].type).toBe(t);
  });

  it.each(ALL_TEXTURES)('%s: has a Korean label', (t) => {
    expect(TEXTURES[t].label.length).toBeGreaterThan(0);
  });

  it.each(ALL_TEXTURES)('%s: render returns null or renderable element', (t) => {
    const args = { topY: 400, bottomY: 780, leftX: 150, rightX: 250, color: '#fff', idPrefix: 'test-' };
    expect(() => TEXTURES[t].render(args)).not.toThrow();
  });

  it('smooth: render returns null', () => {
    const args = { topY: 400, bottomY: 780, leftX: 150, rightX: 250, color: '#fff', idPrefix: '' };
    expect(TEXTURES.smooth.render(args)).toBeNull();
  });

  it('gathered: render returns a g element with data-texture=gathered', () => {
    const args = { topY: 400, bottomY: 780, leftX: 150, rightX: 250, color: '#ccc', idPrefix: '' };
    const el = TEXTURES.gathered.render(args)!;
    const html = renderToStaticMarkup(el);
    expect(html).toContain('data-texture="gathered"');
  });

  it('pleated: render returns a g element with data-texture=pleated', () => {
    const args = { topY: 400, bottomY: 780, leftX: 150, rightX: 250, color: '#ccc', idPrefix: '' };
    const el = TEXTURES.pleated.render(args)!;
    const html = renderToStaticMarkup(el);
    expect(html).toContain('data-texture="pleated"');
  });

  it('tiered: renders layers-1 divider lines when layers=3', () => {
    const args = { topY: 400, bottomY: 780, leftX: 150, rightX: 250, color: '#ccc', idPrefix: '', layers: 3 };
    const el = TEXTURES.tiered.render(args)!;
    const html = renderToStaticMarkup(el);
    // 3 layers → 2 dividers → 2 <line> elements
    const lineCount = (html.match(/<line /g) ?? []).length;
    expect(lineCount).toBe(2);
  });

  it('tiered: renders 4 dividers when layers=5', () => {
    const args = { topY: 400, bottomY: 780, leftX: 150, rightX: 250, color: '#ccc', idPrefix: '', layers: 5 };
    const el = TEXTURES.tiered.render(args)!;
    const html = renderToStaticMarkup(el);
    const lineCount = (html.match(/<line /g) ?? []).length;
    expect(lineCount).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// slitCutout
// ---------------------------------------------------------------------------
describe('slitCutout', () => {
  it('returns empty string for type=none', () => {
    expect(slitCutout('none', 3)).toBe('');
  });

  it('returns empty string for height=0 regardless of type', () => {
    expect(slitCutout('side', 0)).toBe('');
    expect(slitCutout('front', 0)).toBe('');
  });

  it('returns a non-empty path string for side slit with height>0', () => {
    const result = slitCutout('side', 3);
    expect(result).toBeTruthy();
    expect(result).toContain('M');
    expect(result).toContain('Z');
  });

  it('returns a non-empty path string for front slit with height>0', () => {
    const result = slitCutout('front', 2);
    expect(result).toBeTruthy();
    expect(result).toContain('M');
    expect(result).toContain('Z');
  });

  it('side slit at height=5 reaches y=530 (780-250)', () => {
    const result = slitCutout('side', 5);
    expect(result).toContain('530');
  });

  it('front slit references center x coords 195 and 205', () => {
    const result = slitCutout('front', 1);
    expect(result).toContain('195');
    expect(result).toContain('205');
  });
});

// ---------------------------------------------------------------------------
// trainPath
// ---------------------------------------------------------------------------
describe('trainPath', () => {
  it('returns empty string for train=none', () => {
    expect(trainPath('none', 200, 780)).toBe('');
  });

  it('returns a non-empty path for sweep', () => {
    const result = trainPath('sweep', 200, 780);
    expect(result).toBeTruthy();
    expect(result).toContain('M');
    expect(result).toContain('Z');
  });

  it('returns a non-empty path for court', () => {
    expect(trainPath('court', 200, 780)).toBeTruthy();
  });

  it('returns a non-empty path for chapel', () => {
    expect(trainPath('chapel', 200, 780)).toBeTruthy();
  });

  it('returns a non-empty path for cathedral', () => {
    expect(trainPath('cathedral', 200, 780)).toBeTruthy();
  });

  it('cathedral path extends further than sweep (larger y value)', () => {
    const sweepPath = trainPath('sweep', 200, 780);
    const cathedralPath = trainPath('cathedral', 200, 780);
    // Cathedral extends 250px below hem; sweep extends 30px
    expect(cathedralPath).toContain('1030'); // 780 + 250
    expect(sweepPath).toContain('810');       // 780 + 30
  });
});
