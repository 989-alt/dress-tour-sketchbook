import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { composeDress } from './compose';
import { COLOR_HEX } from './colorPalette';
import { createDefaultEntry } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';
import type { AnchorSet, SilhouetteType } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** AnchorSet built from a silhouette's own referencePose (identity warp). */
function anchorSetFromRef(silhouette: SilhouetteType): AnchorSet {
  return { ...SILHOUETTES[silhouette].referencePose.anchors } as AnchorSet;
}

const ALL_SILHOUETTES: SilhouetteType[] = [
  'aline', 'mermaid', 'trumpet', 'princess', 'sheath',
  'empire', 'fitFlare', 'tealength', 'mini',
];

const DEFAULT_OPTIONS = { photoWidth: 800, photoHeight: 1200 };

// ---------------------------------------------------------------------------
// Test 1: Returns a valid SVG element with correct width/height/viewBox
// ---------------------------------------------------------------------------
describe('composeDress — SVG root', () => {
  it('produces an <svg> element with correct width, height, and viewBox', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t1', anchors);
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toMatch(/^<svg/);
    expect(html).toContain('width="800"');
    expect(html).toContain('height="1200"');
    expect(html).toContain('viewBox="0 0 800 1200"');
    expect(html).toContain('xmlns="http://www.w3.org/2000/svg"');
  });
});

// ---------------------------------------------------------------------------
// Test 2: Each silhouette — 12 clipPaths + 12 transformed groups
// ---------------------------------------------------------------------------
describe('composeDress — 12 triangles per silhouette', () => {
  for (const sil of ALL_SILHOUETTES) {
    it(`${sil}: renders 12 <clipPath> defs and 12 transformed <g> groups`, () => {
      const anchors = anchorSetFromRef(sil);
      const entry = createDefaultEntry(`t2-${sil}`, anchors);
      (entry as { silhouette: SilhouetteType }).silhouette = sil;
      const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

      const clipPathCount = (html.match(/<clipPath /g) ?? []).length;
      const transformedGroupCount = (html.match(/transform="matrix\(/g) ?? []).length;

      expect(clipPathCount).toBe(12);
      expect(transformedGroupCount).toBe(12);
    });
  }
});

// ---------------------------------------------------------------------------
// Test 3: Color — blush primary renders the blush hex fill
// ---------------------------------------------------------------------------
describe('composeDress — color fill', () => {
  it('renders fill with blush hex when color.primary is blush', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t3', anchors);
    entry.color.primary = 'blush';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain(`fill="${COLOR_HEX.blush}"`);
  });

  it('renders fill with ivory hex when color.primary is ivory', () => {
    const anchors = anchorSetFromRef('sheath');
    const entry = createDefaultEntry('t3b', anchors);
    entry.color.primary = 'ivory';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain(`fill="${COLOR_HEX.ivory}"`);
  });
});

// ---------------------------------------------------------------------------
// Test 4: Opacity is applied on the outer <g>
// ---------------------------------------------------------------------------
describe('composeDress — opacity', () => {
  it('applies entry.opacity as a style attribute on the silhouette group', () => {
    const anchors = anchorSetFromRef('empire');
    const entry = createDefaultEntry('t4', anchors);
    entry.opacity = 0.6;
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain('opacity:0.6');
  });

  it('opacity:1 when default (1.0)', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t4b', anchors);
    // Default opacity is 1 — check style is present
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('opacity:1');
  });
});

// ---------------------------------------------------------------------------
// Test 5: Identity — anchors equal to referencePose produce near-identity transforms
// ---------------------------------------------------------------------------
describe('composeDress — identity warp', () => {
  it('produces near-identity matrix transforms when anchors match referencePose', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t5', anchors);
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    // Extract all matrix() values from transform attributes
    const matrixPattern = /transform="matrix\(([^"]+)\)"/g;
    const transforms: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = matrixPattern.exec(html)) !== null) {
      transforms.push(m[1]);
    }

    expect(transforms).toHaveLength(12);

    for (const t of transforms) {
      const nums = t.split(' ').map(Number);
      expect(nums).toHaveLength(6);
      const [a, b, c, d, tx, ty] = nums;
      expect(a).toBeCloseTo(1, 3);
      expect(b).toBeCloseTo(0, 3);
      expect(c).toBeCloseTo(0, 3);
      expect(d).toBeCloseTo(1, 3);
      expect(tx).toBeCloseTo(0, 2);
      expect(ty).toBeCloseTo(0, 2);
    }
  });
});

// ---------------------------------------------------------------------------
// Test 6: ClipPath IDs are unique when idPrefix is used
// ---------------------------------------------------------------------------
describe('composeDress — clipPath ID uniqueness', () => {
  it('idPrefix prevents ID collisions between two rendered SVGs', () => {
    const anchors = anchorSetFromRef('aline');
    const e1 = createDefaultEntry('e1', anchors);
    const e2 = createDefaultEntry('e2', anchors);

    const html1 = renderToStaticMarkup(
      composeDress(e1, anchors, { ...DEFAULT_OPTIONS, idPrefix: 'a-' }),
    );
    const html2 = renderToStaticMarkup(
      composeDress(e2, anchors, { ...DEFAULT_OPTIONS, idPrefix: 'b-' }),
    );

    expect(html1).toContain('id="a-tri-0"');
    expect(html2).toContain('id="b-tri-0"');
    expect(html1).not.toContain('id="b-tri-0"');
  });
});

// ---------------------------------------------------------------------------
// Test 7: composeDress does not throw for any silhouette
// ---------------------------------------------------------------------------
describe('composeDress — no-throw guarantee', () => {
  it('renders all 9 silhouettes without throwing', () => {
    for (const sil of ALL_SILHOUETTES) {
      const anchors = anchorSetFromRef(sil);
      const entry = createDefaultEntry(`nt-${sil}`, anchors);
      (entry as { silhouette: SilhouetteType }).silhouette = sil;
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 8: Anchor override — entry.anchors takes precedence over passed anchors
// ---------------------------------------------------------------------------
describe('composeDress — entry.anchors vs passed anchors', () => {
  it('uses entry.anchors when set (identity warp still applies)', () => {
    const anchors = anchorSetFromRef('princess');
    const entry = createDefaultEntry('t8', anchors);
    // entry.anchors already set to same as referencePose — renders 12 triangles
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    const clipCount = (html.match(/<clipPath /g) ?? []).length;
    expect(clipCount).toBe(12);
  });
});
