import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { STRUCTURES, ACCENTS, WAIST_Y_OFFSET } from './index';
import type { BodiceStructure, WaistAccent, WaistPosition } from '../../types';

const ALL_STRUCTURES: BodiceStructure[] = ['corset', 'softFit', 'peplum', 'mockPeplum'];
const ALL_ACCENTS: WaistAccent[] = ['none', 'sash', 'ribbon', 'brooch', 'beadedBand'];
const ALL_WAIST_POSITIONS: WaistPosition[] = ['natural', 'empire', 'basque', 'drop', 'asymmetric'];

const DEFAULT_BODICE_CTX = {
  topY: 120,
  waistY: 400,
  leftX: 140,
  rightX: 260,
  shoulderLX: 140,
  shoulderRX: 260,
};

const DEFAULT_ACCENT_CTX = {
  waistY: 400,
  leftX: 140,
  rightX: 260,
  centerX: 200,
  accentColor: '#ffffff',
};

// ---------------------------------------------------------------------------
// STRUCTURES record
// ---------------------------------------------------------------------------
describe('STRUCTURES record', () => {
  it('has all 4 structure types', () => {
    expect(Object.keys(STRUCTURES)).toHaveLength(4);
    for (const s of ALL_STRUCTURES) {
      expect(STRUCTURES).toHaveProperty(s);
    }
  });

  for (const s of ALL_STRUCTURES) {
    it(`${s}: type field matches`, () => {
      expect(STRUCTURES[s].type).toBe(s);
    });

    it(`${s}: has non-empty Korean label`, () => {
      expect(typeof STRUCTURES[s].label).toBe('string');
      expect(STRUCTURES[s].label.length).toBeGreaterThan(0);
    });

    it(`${s}: render() returns without throwing`, () => {
      expect(() =>
        STRUCTURES[s].render(DEFAULT_BODICE_CTX, '#fff', '#fff'),
      ).not.toThrow();
    });
  }

  it('corset: render produces SVG output with data-structure=corset', () => {
    const el = STRUCTURES.corset.render(DEFAULT_BODICE_CTX, '#fff', '#fff');
    expect(el).not.toBeNull();
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('data-structure="corset"');
  });

  it('softFit: render returns null (no visible overlay)', () => {
    const el = STRUCTURES.softFit.render(DEFAULT_BODICE_CTX, '#fff', '#fff');
    expect(el).toBeNull();
  });

  it('peplum: render produces SVG output with data-structure=peplum', () => {
    const el = STRUCTURES.peplum.render(DEFAULT_BODICE_CTX, '#f4d8d4', '#f4d8d4');
    expect(el).not.toBeNull();
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('data-structure="peplum"');
  });

  it('mockPeplum: render produces SVG output with data-structure=mockPeplum', () => {
    const el = STRUCTURES.mockPeplum.render(DEFAULT_BODICE_CTX, '#fff', '#fff');
    expect(el).not.toBeNull();
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('data-structure="mockPeplum"');
  });

  it('Korean labels are correct', () => {
    expect(STRUCTURES.corset.label).toBe('코르셋');
    expect(STRUCTURES.softFit.label).toBe('소프트핏');
    expect(STRUCTURES.peplum.label).toBe('페플럼');
    expect(STRUCTURES.mockPeplum.label).toBe('모크 페플럼');
  });
});

// ---------------------------------------------------------------------------
// ACCENTS record
// ---------------------------------------------------------------------------
describe('ACCENTS record', () => {
  it('has all 5 accent types', () => {
    expect(Object.keys(ACCENTS)).toHaveLength(5);
    for (const a of ALL_ACCENTS) {
      expect(ACCENTS).toHaveProperty(a);
    }
  });

  for (const a of ALL_ACCENTS) {
    it(`${a}: type field matches`, () => {
      expect(ACCENTS[a].type).toBe(a);
    });

    it(`${a}: has non-empty Korean label`, () => {
      expect(typeof ACCENTS[a].label).toBe('string');
      expect(ACCENTS[a].label.length).toBeGreaterThan(0);
    });

    it(`${a}: render() returns without throwing`, () => {
      expect(() => ACCENTS[a].render(DEFAULT_ACCENT_CTX)).not.toThrow();
    });
  }

  it('none: render returns null', () => {
    expect(ACCENTS.none.render(DEFAULT_ACCENT_CTX)).toBeNull();
  });

  it('sash: render produces SVG with data-accent=sash', () => {
    const el = ACCENTS.sash.render(DEFAULT_ACCENT_CTX);
    expect(el).not.toBeNull();
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('data-accent="sash"');
  });

  it('ribbon: render produces SVG with data-accent=ribbon', () => {
    const el = ACCENTS.ribbon.render(DEFAULT_ACCENT_CTX);
    expect(el).not.toBeNull();
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('data-accent="ribbon"');
  });

  it('brooch: render produces SVG with data-accent=brooch', () => {
    const el = ACCENTS.brooch.render(DEFAULT_ACCENT_CTX);
    expect(el).not.toBeNull();
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('data-accent="brooch"');
  });

  it('beadedBand: render produces SVG with data-accent=beadedBand', () => {
    const el = ACCENTS.beadedBand.render(DEFAULT_ACCENT_CTX);
    expect(el).not.toBeNull();
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('data-accent="beadedBand"');
  });

  it('Korean accent labels are correct', () => {
    expect(ACCENTS.none.label).toBe('없음');
    expect(ACCENTS.sash.label).toBe('새시');
    expect(ACCENTS.ribbon.label).toBe('리본');
    expect(ACCENTS.brooch.label).toBe('브로치');
    expect(ACCENTS.beadedBand.label).toBe('비즈 밴드');
  });
});

// ---------------------------------------------------------------------------
// WAIST_Y_OFFSET record
// ---------------------------------------------------------------------------
describe('WAIST_Y_OFFSET', () => {
  it('has all 5 waist positions', () => {
    for (const p of ALL_WAIST_POSITIONS) {
      expect(WAIST_Y_OFFSET).toHaveProperty(p);
    }
  });

  it('natural offset is 0', () => expect(WAIST_Y_OFFSET.natural).toBe(0));
  it('empire offset is -100', () => expect(WAIST_Y_OFFSET.empire).toBe(-100));
  it('basque offset is 50', () => expect(WAIST_Y_OFFSET.basque).toBe(50));
  it('drop offset is 100', () => expect(WAIST_Y_OFFSET.drop).toBe(100));
  it('asymmetric offset is 30', () => expect(WAIST_Y_OFFSET.asymmetric).toBe(30));
});
