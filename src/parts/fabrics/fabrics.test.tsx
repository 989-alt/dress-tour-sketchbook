import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FABRICS } from './index';
import type { FabricType, ColorEnum } from '../../types';

const ALL_FABRIC_TYPES: FabricType[] = ['satin', 'mikado', 'organza', 'tulle', 'lace', 'chiffon', 'taffeta'];

describe('FABRICS record', () => {
  it('has exactly 7 keys', () => {
    expect(Object.keys(FABRICS)).toHaveLength(7);
  });

  it('contains all 7 FabricType keys', () => {
    for (const type of ALL_FABRIC_TYPES) {
      expect(FABRICS[type]).toBeDefined();
    }
  });

  it('each def has a .type matching its key', () => {
    for (const type of ALL_FABRIC_TYPES) {
      expect(FABRICS[type].type).toBe(type);
    }
  });

  it('each def has a non-empty Korean label', () => {
    const expected: Record<FabricType, string> = {
      satin:   '새틴',
      mikado:  '미카도',
      organza: '오간자',
      tulle:   '튤',
      lace:    '레이스',
      chiffon: '시폰',
      taffeta: '태피터',
    };
    for (const type of ALL_FABRIC_TYPES) {
      expect(FABRICS[type].label).toBe(expected[type]);
    }
  });
});

describe('FabricDef.renderDef', () => {
  const color: ColorEnum = 'blush';
  const colorHex = '#f4d8d4';
  const idPrefix = 'test-';

  it('renderDef does not throw for any fabric and color', () => {
    const colors: ColorEnum[] = ['pureWhite', 'offWhite', 'ivory', 'champagne', 'blush', 'gold', 'grey', 'blue', 'black'];
    for (const type of ALL_FABRIC_TYPES) {
      for (const c of colors) {
        expect(() =>
          renderToStaticMarkup(FABRICS[type].renderDef({ idPrefix, color: c, colorHex: '#f4d8d4' }))
        ).not.toThrow();
      }
    }
  });

  it('each renderDef produces an id containing the type and color', () => {
    for (const type of ALL_FABRIC_TYPES) {
      const html = renderToStaticMarkup(FABRICS[type].renderDef({ idPrefix, color, colorHex }));
      expect(html).toContain(`id="${idPrefix}fabric-${type}-${color}"`);
    }
  });

  it('satin: produces a linearGradient element', () => {
    const html = renderToStaticMarkup(FABRICS.satin.renderDef({ idPrefix, color, colorHex }));
    expect(html).toContain('<linearGradient');
    expect(html).toContain('</linearGradient>');
  });

  it('tulle: produces a pattern element with circles', () => {
    const html = renderToStaticMarkup(FABRICS.tulle.renderDef({ idPrefix, color, colorHex }));
    expect(html).toContain('<pattern');
    expect(html).toContain('<circle');
  });

  it('lace: produces a pattern element with circles', () => {
    const html = renderToStaticMarkup(FABRICS.lace.renderDef({ idPrefix, color, colorHex }));
    expect(html).toContain('<pattern');
    expect(html).toContain('<circle');
  });

  it('mikado: produces a linearGradient element', () => {
    const html = renderToStaticMarkup(FABRICS.mikado.renderDef({ idPrefix, color, colorHex }));
    expect(html).toContain('<linearGradient');
  });

  it('organza: produces a linearGradient with stopOpacity attributes', () => {
    const html = renderToStaticMarkup(FABRICS.organza.renderDef({ idPrefix, color, colorHex }));
    expect(html).toContain('<linearGradient');
    expect(html).toContain('stop-opacity');
  });

  it('chiffon: produces a linearGradient element', () => {
    const html = renderToStaticMarkup(FABRICS.chiffon.renderDef({ idPrefix, color, colorHex }));
    expect(html).toContain('<linearGradient');
  });

  it('taffeta: produces a linearGradient with 4 stops', () => {
    const html = renderToStaticMarkup(FABRICS.taffeta.renderDef({ idPrefix, color, colorHex }));
    expect(html).toContain('<linearGradient');
    const stopCount = (html.match(/<stop/g) ?? []).length;
    expect(stopCount).toBe(4);
  });

  it('idPrefix is incorporated into the def id', () => {
    const html = renderToStaticMarkup(FABRICS.satin.renderDef({ idPrefix: 'px-', color, colorHex }));
    expect(html).toContain('id="px-fabric-satin-blush"');
  });
});
