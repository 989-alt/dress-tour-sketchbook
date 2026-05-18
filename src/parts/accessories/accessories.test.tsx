import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ACCESSORIES, ACCESSORY_ORDER } from './index';
import type { AccessoryType } from '../../types';

const ALL_TYPES: AccessoryType[] = ['none', 'tiara', 'headband', 'hairVine', 'hairComb', 'floralCrown'];

const RENDER_ARGS = {
  headTopX: 200,
  headTopY: 20,
  color: '#fff',
  idPrefix: 'test-',
};

describe('ACCESSORIES record', () => {
  it('has exactly 6 keys', () => {
    expect(Object.keys(ACCESSORIES)).toHaveLength(6);
  });

  it('contains all required AccessoryType keys', () => {
    for (const type of ALL_TYPES) {
      expect(ACCESSORIES).toHaveProperty(type);
    }
  });

  it('ACCESSORY_ORDER has 6 entries', () => {
    expect(ACCESSORY_ORDER).toHaveLength(6);
  });

  it('each def has a non-empty Korean label', () => {
    for (const type of ALL_TYPES) {
      expect(ACCESSORIES[type].label.length).toBeGreaterThan(0);
    }
  });
});

describe('none accessory', () => {
  it('render returns null', () => {
    expect(ACCESSORIES.none.render(RENDER_ARGS)).toBeNull();
  });
});

describe('non-none accessories render non-null', () => {
  const nonNone: AccessoryType[] = ['tiara', 'headband', 'hairVine', 'hairComb', 'floralCrown'];

  for (const type of nonNone) {
    it(`${type}: render returns a non-null ReactElement`, () => {
      const el = ACCESSORIES[type].render(RENDER_ARGS);
      expect(el).not.toBeNull();
    });

    it(`${type}: rendered HTML contains data-accessory="${type}"`, () => {
      const el = ACCESSORIES[type].render(RENDER_ARGS);
      expect(el).not.toBeNull();
      const html = renderToStaticMarkup(el!);
      expect(html).toContain(`data-accessory="${type}"`);
    });
  }
});

describe('accessory SVG structure', () => {
  it('tiara: includes path and circles for jewels', () => {
    const el = ACCESSORIES.tiara.render(RENDER_ARGS);
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('<path');
    expect(html).toContain('<circle');
  });

  it('headband: includes a path element', () => {
    const el = ACCESSORIES.headband.render(RENDER_ARGS);
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('<path');
  });

  it('hairVine: includes a path and circles for flowers', () => {
    const el = ACCESSORIES.hairVine.render(RENDER_ARGS);
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('<path');
    expect(html).toContain('<circle');
  });

  it('hairComb: includes rect and line elements', () => {
    const el = ACCESSORIES.hairComb.render(RENDER_ARGS);
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('<rect');
    expect(html).toContain('<line');
  });

  it('floralCrown: includes ellipse and circle elements', () => {
    const el = ACCESSORIES.floralCrown.render(RENDER_ARGS);
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('<ellipse');
    expect(html).toContain('<circle');
  });

  it('idPrefix is reflected in rendered output for tiara jewels', () => {
    const el = ACCESSORIES.tiara.render({ ...RENDER_ARGS, idPrefix: 'pfx-' });
    const html = renderToStaticMarkup(el!);
    expect(html).toContain('pfx-');
  });
});
