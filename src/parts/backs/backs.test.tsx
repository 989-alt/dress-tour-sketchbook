import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { BACKS } from './index';
import type { BackType } from '../../types';

const ALL_BACK_TYPES: BackType[] = [
  'closed', 'vBack', 'illusionBack', 'openBack',
  'keyhole', 'buttonRow', 'laceUpCorset', 'drape',
];

const DEFAULT_ARGS = { topY: 120, waistY: 400, openDepth: 0, idPrefix: 'test-' };

// ---------------------------------------------------------------------------
// BACKS record shape
// ---------------------------------------------------------------------------
describe('BACKS record', () => {
  it('has exactly 8 keys', () => {
    expect(Object.keys(BACKS)).toHaveLength(8);
  });

  for (const bt of ALL_BACK_TYPES) {
    it(`${bt}: exists in BACKS`, () => {
      expect(BACKS).toHaveProperty(bt);
    });

    it(`${bt}: type field matches key`, () => {
      expect(BACKS[bt].type).toBe(bt);
    });

    it(`${bt}: has non-empty Korean label`, () => {
      expect(typeof BACKS[bt].label).toBe('string');
      expect(BACKS[bt].label.length).toBeGreaterThan(0);
    });

    it(`${bt}: render() does not throw`, () => {
      expect(() => BACKS[bt].render(DEFAULT_ARGS)).not.toThrow();
    });
  }
});

// ---------------------------------------------------------------------------
// Non-closed types return non-null SVG
// ---------------------------------------------------------------------------
describe('BACKS render — non-closed types return SVG', () => {
  const nonClosed: BackType[] = ['vBack', 'illusionBack', 'openBack', 'keyhole', 'buttonRow', 'laceUpCorset', 'drape'];

  for (const bt of nonClosed) {
    it(`${bt}: render returns non-null element with data-back attribute`, () => {
      const el = BACKS[bt].render(DEFAULT_ARGS);
      expect(el).not.toBeNull();
      const html = renderToStaticMarkup(el!);
      expect(html).toContain(`data-back="${bt}"`);
      expect(html.length).toBeGreaterThan(10);
    });
  }
});

// ---------------------------------------------------------------------------
// closed returns null
// ---------------------------------------------------------------------------
describe('BACKS render — closed', () => {
  it('closed: render returns null', () => {
    expect(BACKS.closed.render(DEFAULT_ARGS)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// openBack depth variation
// ---------------------------------------------------------------------------
describe('BACKS render — openBack depth', () => {
  it('openDepth=0 produces different output than openDepth=5', () => {
    const shallow = BACKS.openBack.render({ ...DEFAULT_ARGS, openDepth: 0 });
    const deep = BACKS.openBack.render({ ...DEFAULT_ARGS, openDepth: 5 });
    const htmlShallow = renderToStaticMarkup(shallow!);
    const htmlDeep = renderToStaticMarkup(deep!);
    expect(htmlShallow).not.toEqual(htmlDeep);
  });

  it('openDepth=0 produces zero-depth notch path (Q 140,)', () => {
    const el = BACKS.openBack.render({ ...DEFAULT_ARGS, openDepth: 0 });
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('data-back="openBack"');
  });
});

// ---------------------------------------------------------------------------
// Korean labels
// ---------------------------------------------------------------------------
describe('BACKS Korean labels', () => {
  it('closed: 막힘', () => expect(BACKS.closed.label).toBe('막힘'));
  it('vBack: V 백', () => expect(BACKS.vBack.label).toBe('V 백'));
  it('illusionBack: 일루전 백', () => expect(BACKS.illusionBack.label).toBe('일루전 백'));
  it('openBack: 오픈백', () => expect(BACKS.openBack.label).toBe('오픈백'));
  it('keyhole: 키홀', () => expect(BACKS.keyhole.label).toBe('키홀'));
  it('buttonRow: 단추 줄', () => expect(BACKS.buttonRow.label).toBe('단추 줄'));
  it('laceUpCorset: 레이스업 코르셋', () => expect(BACKS.laceUpCorset.label).toBe('레이스업 코르셋'));
  it('drape: 드레이프', () => expect(BACKS.drape.label).toBe('드레이프'));
});
