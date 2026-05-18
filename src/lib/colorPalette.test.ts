import { describe, it, expect } from 'vitest';
import { adjustLightness, COLOR_HEX } from './colorPalette';

describe('adjustLightness', () => {
  it('returns a 7-char hex string', () => {
    const result = adjustLightness('#f4d8d4', 0.08);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('positive delta produces a lighter color (higher R/G/B values)', () => {
    const original = parseInt('f4', 16); // R channel of blush
    const lighter = adjustLightness('#f4d8d4', 0.1);
    const lighterR = parseInt(lighter.slice(1, 3), 16);
    expect(lighterR).toBeGreaterThanOrEqual(original);
  });

  it('negative delta produces a darker color (lower R/G/B values)', () => {
    const originalR = parseInt('e7', 16); // R channel of champagne #e7d3a8
    const darker = adjustLightness('#e7d3a8', -0.1);
    const darkerR = parseInt(darker.slice(1, 3), 16);
    expect(darkerR).toBeLessThanOrEqual(originalR);
  });

  it('delta=0 returns same hex as input (within rounding)', () => {
    // Because we convert to HSL and back, rounding may differ by 1
    const result = adjustLightness('#bdbdbd', 0);
    const origR = parseInt('bd', 16);
    const resultR = parseInt(result.slice(1, 3), 16);
    expect(Math.abs(resultR - origR)).toBeLessThanOrEqual(1);
  });

  it('clamps to white (#ffffff) when delta is very large', () => {
    const result = adjustLightness('#ffffff', 0.5);
    expect(result).toBe('#ffffff');
  });

  it('clamps to black (#000000) when delta is very negative', () => {
    const result = adjustLightness('#222222', -1.0);
    expect(result).toBe('#000000');
  });

  it('works on all 9 COLOR_HEX values without throwing', () => {
    for (const hex of Object.values(COLOR_HEX)) {
      expect(() => adjustLightness(hex, 0.08)).not.toThrow();
      expect(() => adjustLightness(hex, -0.05)).not.toThrow();
    }
  });

  it('satin: lighter value is always lighter or equal to original', () => {
    for (const hex of Object.values(COLOR_HEX)) {
      const lighter = adjustLightness(hex, 0.08);
      const origAvg = (parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16)) / 3;
      const lightAvg = (parseInt(lighter.slice(1, 3), 16) + parseInt(lighter.slice(3, 5), 16) + parseInt(lighter.slice(5, 7), 16)) / 3;
      expect(lightAvg).toBeGreaterThanOrEqual(origAvg - 1); // allow 1 rounding unit
    }
  });

  it('taffeta: darker value is darker or equal to original', () => {
    for (const hex of Object.values(COLOR_HEX)) {
      const darker = adjustLightness(hex, -0.1);
      const origAvg = (parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16)) / 3;
      const darkAvg = (parseInt(darker.slice(1, 3), 16) + parseInt(darker.slice(3, 5), 16) + parseInt(darker.slice(5, 7), 16)) / 3;
      expect(darkAvg).toBeLessThanOrEqual(origAvg + 1);
    }
  });
});
