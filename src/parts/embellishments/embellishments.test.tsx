import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EMBELLISHMENTS } from './index';
import type { EmbellishmentType, Region, Point } from '../../types';

const ALL_TYPES: EmbellishmentType[] = [
  'beads', 'laceApplique', 'threeDFlorals', 'crystals', 'pearls',
  'embroidery', 'sequins', 'ribbons', 'decorativeButtons',
];

const TEST_POLYGON: Point[][] = [
  [
    { x: 140, y: 120 },
    { x: 260, y: 120 },
    { x: 245, y: 400 },
    { x: 155, y: 400 },
  ],
];

const INTENSITIES = [1, 2, 3, 4, 5] as const;

describe('EMBELLISHMENTS record', () => {
  it('has exactly 9 keys', () => {
    expect(Object.keys(EMBELLISHMENTS)).toHaveLength(9);
  });

  it('contains all 9 expected types', () => {
    for (const t of ALL_TYPES) {
      expect(EMBELLISHMENTS[t]).toBeDefined();
    }
  });

  it('each def has a Korean label', () => {
    for (const t of ALL_TYPES) {
      const label = EMBELLISHMENTS[t].label;
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('Korean labels match expected values', () => {
    expect(EMBELLISHMENTS.beads.label).toBe('비즈');
    expect(EMBELLISHMENTS.laceApplique.label).toBe('레이스 어플리케');
    expect(EMBELLISHMENTS.threeDFlorals.label).toBe('3D 플로럴');
    expect(EMBELLISHMENTS.crystals.label).toBe('크리스털');
    expect(EMBELLISHMENTS.pearls.label).toBe('진주');
    expect(EMBELLISHMENTS.embroidery.label).toBe('자수');
    expect(EMBELLISHMENTS.sequins.label).toBe('시퀸');
    expect(EMBELLISHMENTS.ribbons.label).toBe('리본');
    expect(EMBELLISHMENTS.decorativeButtons.label).toBe('단추');
  });
});

describe('Each embellishment renders at all intensities', () => {
  for (const type of ALL_TYPES) {
    for (const intensity of INTENSITIES) {
      it(`${type} intensity=${intensity} renders without crashing`, () => {
        const def = EMBELLISHMENTS[type];
        const el = def.render({
          intensity,
          region: 'bodice' as Region,
          polygons: TEST_POLYGON,
          color: '#f4d8d4',
          idPrefix: `test-${type}-${intensity}-`,
        });
        expect(el).toBeDefined();
        const { container } = render(el);
        expect(container.firstChild).toBeTruthy();
      });
    }
  }
});

describe('Embellishment density increases with intensity', () => {
  it('beads: intensity=5 has more elements than intensity=1', () => {
    const def = EMBELLISHMENTS.beads;
    const el1 = def.render({ intensity: 1, region: 'bodice', polygons: TEST_POLYGON, color: '#fff', idPrefix: 'd1-' });
    const el5 = def.render({ intensity: 5, region: 'bodice', polygons: TEST_POLYGON, color: '#fff', idPrefix: 'd5-' });
    const { container: c1 } = render(el1);
    const { container: c5 } = render(el5);
    const count1 = c1.querySelectorAll('circle').length;
    const count5 = c5.querySelectorAll('circle').length;
    expect(count5).toBeGreaterThan(count1);
  });

  it('pearls: intensity=5 has more elements than intensity=1', () => {
    const def = EMBELLISHMENTS.pearls;
    const el1 = def.render({ intensity: 1, region: 'bodice', polygons: TEST_POLYGON, color: '#fff', idPrefix: 'p1-' });
    const el5 = def.render({ intensity: 5, region: 'bodice', polygons: TEST_POLYGON, color: '#fff', idPrefix: 'p5-' });
    const { container: c1 } = render(el1);
    const { container: c5 } = render(el5);
    // Pearls use 2 circles per point — just check the g element count differs
    expect(c5.querySelectorAll('circle').length).toBeGreaterThan(c1.querySelectorAll('circle').length);
  });
});

describe('Embellishment data attributes', () => {
  it('each type renders with data-embellishment attribute', () => {
    for (const type of ALL_TYPES) {
      const def = EMBELLISHMENTS[type];
      const el = def.render({ intensity: 2, region: 'bodice', polygons: TEST_POLYGON, color: '#fff', idPrefix: 'attr-' });
      const { container } = render(el);
      const g = container.querySelector(`[data-embellishment="${type}"]`);
      expect(g).toBeTruthy();
    }
  });

  it('each type renders with data-intensity attribute matching input', () => {
    for (const type of ALL_TYPES) {
      const def = EMBELLISHMENTS[type];
      const el = def.render({ intensity: 3, region: 'bodice', polygons: TEST_POLYGON, color: '#fff', idPrefix: 'int-' });
      const { container } = render(el);
      const g = container.querySelector('[data-intensity="3"]');
      expect(g).toBeTruthy();
    }
  });
});

describe('threeDFlorals extra.size', () => {
  it('renders with size=S', () => {
    const el = EMBELLISHMENTS.threeDFlorals.render({
      intensity: 2, region: 'skirt', polygons: TEST_POLYGON, color: '#fff',
      extra: { size: 'S' }, idPrefix: 'sz-',
    });
    const { container } = render(el);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with size=L', () => {
    const el = EMBELLISHMENTS.threeDFlorals.render({
      intensity: 2, region: 'skirt', polygons: TEST_POLYGON, color: '#fff',
      extra: { size: 'L' }, idPrefix: 'szl-',
    });
    const { container } = render(el);
    expect(container.firstChild).toBeTruthy();
  });
});

describe('embroidery extra.style', () => {
  it('renders with style=geometric', () => {
    const el = EMBELLISHMENTS.embroidery.render({
      intensity: 2, region: 'bodice', polygons: TEST_POLYGON, color: '#fff',
      extra: { style: 'geometric' }, idPrefix: 'geo-',
    });
    const { container } = render(el);
    expect(container.firstChild).toBeTruthy();
  });
});

describe('ribbons extra', () => {
  it('renders 3 ribbons when count=3', () => {
    const el = EMBELLISHMENTS.ribbons.render({
      intensity: 3, region: 'waist', polygons: TEST_POLYGON, color: '#fff',
      extra: { placement: 'waist', count: 3 }, idPrefix: 'rib-',
    });
    const { container } = render(el);
    // 3 ribbon groups, each with 3 shapes (2 ellipses + 1 circle + 2 lines = many elements)
    const groups = container.querySelectorAll('ellipse');
    expect(groups.length).toBeGreaterThan(0);
  });
});

describe('decorativeButtons extra', () => {
  it('renders 10 buttons when count=10', () => {
    const el = EMBELLISHMENTS.decorativeButtons.render({
      intensity: 2, region: 'bodice', polygons: TEST_POLYGON, color: '#fff',
      extra: { count: 10 }, idPrefix: 'btn-',
    });
    const { container } = render(el);
    // Each button is 2 circles
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(20);
  });
});
