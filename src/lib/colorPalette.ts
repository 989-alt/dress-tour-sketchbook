import type { ColorEnum } from '../types';

export const COLOR_HEX: Record<ColorEnum, string> = {
  pureWhite:  '#ffffff',
  offWhite:   '#fbfaf5',
  ivory:      '#f8efdc',
  champagne:  '#e7d3a8',
  blush:      '#f4d8d4',
  gold:       '#d4b676',
  grey:       '#bdbdbd',
  blue:       '#cbd9ee',
  black:      '#222222',
};

export const COLOR_LABELS: Record<ColorEnum, string> = {
  pureWhite:  '순백',
  offWhite:   '오프 화이트',
  ivory:      '아이보리',
  champagne:  '샴페인',
  blush:      '블러쉬',
  gold:       '골드',
  grey:       '그레이',
  blue:       '블루',
  black:      '블랙',
};

/**
 * Adjust the lightness of a hex color.
 * @param hex  6-digit hex string, e.g. '#f4d8d4'
 * @param delta  fractional lightness change (e.g. 0.08 → +8%, -0.05 → -5%)
 * @returns adjusted 6-digit hex string
 */
export function adjustLightness(hex: string, delta: number): string {
  // Parse hex → RGB (0–1)
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // RGB → HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // Clamp new lightness
  const newL = Math.min(1, Math.max(0, l + delta));

  // HSL → RGB
  function hue2rgb(p: number, q: number, t: number): number {
    let tc = t;
    if (tc < 0) tc += 1;
    if (tc > 1) tc -= 1;
    if (tc < 1 / 6) return p + (q - p) * 6 * tc;
    if (tc < 1 / 2) return q;
    if (tc < 2 / 3) return p + (q - p) * (2 / 3 - tc) * 6;
    return p;
  }

  let nr: number, ng: number, nb: number;
  if (s === 0) {
    nr = ng = nb = newL;
  } else {
    const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
    const p = 2 * newL - q;
    nr = hue2rgb(p, q, h + 1 / 3);
    ng = hue2rgb(p, q, h);
    nb = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
}
