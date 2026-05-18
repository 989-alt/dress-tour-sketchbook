import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VEIL_LENGTHS, VEIL_EDGES, VEIL_LENGTH_ORDER, VEIL_EDGE_ORDER } from './index';
import type { VeilLength, VeilEdge } from '../../types';

const ALL_LENGTHS: VeilLength[] = ['none', 'blusher', 'elbow', 'fingertip', 'waltz', 'chapel', 'cathedral'];
const ALL_EDGES: VeilEdge[] = ['cut', 'ribbon', 'beaded', 'lace'];

const RENDER_ARGS = {
  edge: 'cut' as VeilEdge,
  layers: 1 as const,
  color: '#f0eeec',
  headTopY: 20,
  chinY: 70,
  shoulderLX: 140,
  shoulderRX: 260,
  idPrefix: 'test-',
};

describe('VEIL_LENGTHS record', () => {
  it('has exactly 7 keys', () => {
    expect(Object.keys(VEIL_LENGTHS)).toHaveLength(7);
  });

  it('contains all 7 expected lengths', () => {
    for (const l of ALL_LENGTHS) {
      expect(VEIL_LENGTHS[l]).toBeDefined();
    }
  });

  it('each length has a Korean label', () => {
    for (const l of ALL_LENGTHS) {
      const label = VEIL_LENGTHS[l].label;
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('Korean labels match expected values', () => {
    expect(VEIL_LENGTHS.none.label).toBe('없음');
    expect(VEIL_LENGTHS.blusher.label).toBe('블러셔');
    expect(VEIL_LENGTHS.elbow.label).toBe('엘보우');
    expect(VEIL_LENGTHS.fingertip.label).toBe('핑거팁');
    expect(VEIL_LENGTHS.waltz.label).toBe('왈츠');
    expect(VEIL_LENGTHS.chapel.label).toBe('채플');
    expect(VEIL_LENGTHS.cathedral.label).toBe('캐서드럴');
  });

  it('LENGTH_ORDER contains all 7 lengths', () => {
    expect(VEIL_LENGTH_ORDER).toHaveLength(7);
    for (const l of ALL_LENGTHS) {
      expect(VEIL_LENGTH_ORDER).toContain(l);
    }
  });
});

describe('VEIL_EDGES record', () => {
  it('has exactly 4 keys', () => {
    expect(Object.keys(VEIL_EDGES)).toHaveLength(4);
  });

  it('contains all 4 expected edges', () => {
    for (const e of ALL_EDGES) {
      expect(VEIL_EDGES[e]).toBeDefined();
    }
  });

  it('each edge has a Korean label', () => {
    for (const e of ALL_EDGES) {
      const label = VEIL_EDGES[e].label;
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('Korean labels match expected values', () => {
    expect(VEIL_EDGES.cut.label).toBe('컷');
    expect(VEIL_EDGES.ribbon.label).toBe('리본');
    expect(VEIL_EDGES.beaded.label).toBe('비즈');
    expect(VEIL_EDGES.lace.label).toBe('레이스');
  });

  it('EDGE_ORDER contains all 4 edges', () => {
    expect(VEIL_EDGE_ORDER).toHaveLength(4);
    for (const e of ALL_EDGES) {
      expect(VEIL_EDGE_ORDER).toContain(e);
    }
  });
});

describe('veil render returns { back, front } shape', () => {
  it('none returns { back: null, front: null }', () => {
    const result = VEIL_LENGTHS.none.render(RENDER_ARGS);
    expect(result.back).toBeNull();
    expect(result.front).toBeNull();
  });

  it('blusher returns { back: null, front: element }', () => {
    const result = VEIL_LENGTHS.blusher.render(RENDER_ARGS);
    expect(result.back).toBeNull();
    expect(result.front).not.toBeNull();
  });

  it.each(['elbow', 'fingertip', 'waltz', 'chapel', 'cathedral'] as VeilLength[])(
    '%s with layers=1 returns { back: element, front: null }',
    (l) => {
      const result = VEIL_LENGTHS[l].render({ ...RENDER_ARGS, layers: 1 });
      expect(result.back).not.toBeNull();
      expect(result.front).toBeNull();
    },
  );

  it.each(['elbow', 'fingertip', 'waltz', 'chapel', 'cathedral'] as VeilLength[])(
    '%s with layers=2 returns { back: element, front: element }',
    (l) => {
      const result = VEIL_LENGTHS[l].render({ ...RENDER_ARGS, layers: 2 });
      expect(result.back).not.toBeNull();
      expect(result.front).not.toBeNull();
    },
  );
});

describe('veil render does not crash with all edges', () => {
  it.each(ALL_EDGES)('fingertip with edge=%s renders without error', (edge) => {
    const result = VEIL_LENGTHS.fingertip.render({ ...RENDER_ARGS, edge });
    expect(result.back).not.toBeNull();
    const { container } = render(result.back!);
    expect(container.firstChild).toBeTruthy();
  });
});

describe('veil edge renderEdge', () => {
  const TEST_PATH = 'M 200 20 C 100 50 80 250 80 480 L 320 480 C 320 250 300 50 200 20 Z';

  it('cut returns null', () => {
    expect(VEIL_EDGES.cut.renderEdge({ veilOutlinePath: TEST_PATH, color: '#fff', idPrefix: 'e-' })).toBeNull();
  });

  it('ribbon returns a path element', () => {
    const el = VEIL_EDGES.ribbon.renderEdge({ veilOutlinePath: TEST_PATH, color: '#fff', idPrefix: 'r-' });
    expect(el).not.toBeNull();
    const { container } = render(el!);
    expect(container.querySelector('path')).toBeTruthy();
  });

  it('beaded returns a path element', () => {
    const el = VEIL_EDGES.beaded.renderEdge({ veilOutlinePath: TEST_PATH, color: '#fff', idPrefix: 'b-' });
    expect(el).not.toBeNull();
    const { container } = render(el!);
    expect(container.querySelector('path')).toBeTruthy();
  });

  it('lace returns elements', () => {
    const el = VEIL_EDGES.lace.renderEdge({ veilOutlinePath: TEST_PATH, color: '#fff', idPrefix: 'l-' });
    expect(el).not.toBeNull();
    const { container } = render(el!);
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(1);
  });
});
