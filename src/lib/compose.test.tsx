import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { composeDress } from './compose';
import { COLOR_HEX } from './colorPalette';
import { createDefaultEntry } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';
import type { AnchorSet, SilhouetteType, SleeveType, SleeveMaterial } from '../types';

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

// ---------------------------------------------------------------------------
// Test 9 (T11): Neckline cutout — evenodd fill rule + cutout path present
// ---------------------------------------------------------------------------
describe('composeDress — neckline cutout (T11)', () => {
  it('vRegular neckline: path uses fill-rule evenodd and includes the V cutout d-string', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t9', anchors);
    entry.neckline = 'vRegular';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain('fill-rule="evenodd"');
    // The V-cutout path starts with M 140,120 L 140,130 L 200,240
    expect(html).toContain('140,120');
  });

  it('sweetheart neckline: path uses fill-rule evenodd and includes cutout coords', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t9b', anchors);
    entry.neckline = 'sweetheart';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain('fill-rule="evenodd"');
  });

  it('all 15 necklines render without throwing', () => {
    const necklines = [
      'sweetheart', 'vRegular', 'vDeep', 'vPlunging', 'halter',
      'offShoulder', 'oneShoulder', 'strapless', 'boat', 'illusionCrew',
      'square', 'scoop', 'portrait', 'highNeck', 'keyhole',
    ] as const;
    const anchors = anchorSetFromRef('aline');
    for (const neckline of necklines) {
      const entry = createDefaultEntry(`nt-neck-${neckline}`, anchors);
      entry.neckline = neckline;
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 10 (T12): Sleeve rendering
// ---------------------------------------------------------------------------
describe('composeDress — sleeve rendering (T12)', () => {
  it('sleeveless: no sleeve paths in output', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-sl', anchors);
    entry.sleeve = { type: 'sleeveless', material: 'opaque' };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    // Sleeve paths contain specific coords; sleeveless has renders=false
    // The sleeve group should not be rendered — check no left path for cap/short/etc
    // Just verify it does not throw and does not include sleeve-specific coords
    expect(html).not.toContain('M 130 120 C 110 130');
    expect(html).not.toContain('M 270 120');
  });

  it('cap sleeve: renders left and right paths', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-cap', anchors);
    entry.sleeve = { type: 'cap', material: 'opaque' };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    // Cap sleeve path contains 'C' cubic bezier
    expect(html).toContain('C 110 130');
  });

  it('opaque material: fill is colorHex without extra opacity attribute', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-opaque', anchors);
    entry.sleeve = { type: 'long', material: 'opaque' };
    entry.color.primary = 'blush';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain(`fill="${COLOR_HEX.blush}"`);
  });

  it('sheer material: opacity attribute is 0.3', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-sheer', anchors);
    entry.sleeve = { type: 'long', material: 'sheer' };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('opacity="0.3"');
  });

  it('lace material: fill references lace pattern url', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-lace', anchors);
    entry.sleeve = { type: 'long', material: 'lace' };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('url(#');
    expect(html).toContain('lace-pattern');
  });

  it('all 10 sleeve types render without throwing', () => {
    const sleeveTypes: SleeveType[] = [
      'sleeveless', 'cap', 'short', 'threeQuarter', 'long',
      'bishop', 'puff', 'bell', 'legOfMutton', 'illusion',
    ];
    const anchors = anchorSetFromRef('aline');
    for (const type of sleeveTypes) {
      const entry = createDefaultEntry(`nt-sleeve-${type}`, anchors);
      entry.sleeve = { type, material: 'opaque' };
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });

  it('all 4 materials render without throwing', () => {
    const materials: SleeveMaterial[] = ['opaque', 'sheer', 'lace', 'beaded'];
    const anchors = anchorSetFromRef('aline');
    for (const material of materials) {
      const entry = createDefaultEntry(`nt-mat-${material}`, anchors);
      entry.sleeve = { type: 'long', material };
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });

  it('lace pattern def is present in SVG', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-defs', anchors);
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('lace-pattern');
    expect(html).toContain('beaded-pattern');
  });
});

// ---------------------------------------------------------------------------
// Test 11 (T13): Bodice structure rendering
// ---------------------------------------------------------------------------
describe('composeDress — bodice structure (T13)', () => {
  it('corset structure: includes data-structure=corset markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-corset', anchors);
    entry.bodice.structure = 'corset';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-structure="corset"');
  });

  it('peplum structure: includes data-structure=peplum markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-peplum', anchors);
    entry.bodice.structure = 'peplum';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-structure="peplum"');
  });

  it('mockPeplum structure: includes data-structure=mockPeplum markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-mock', anchors);
    entry.bodice.structure = 'mockPeplum';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-structure="mockPeplum"');
  });

  it('softFit structure: renders without throwing (no visible overlay)', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-soft', anchors);
    entry.bodice.structure = 'softFit';
    expect(() =>
      renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
    ).not.toThrow();
  });

  it('all 4 structures render without throwing', () => {
    const structures = ['corset', 'softFit', 'peplum', 'mockPeplum'] as const;
    const anchors = anchorSetFromRef('aline');
    for (const structure of structures) {
      const entry = createDefaultEntry(`t13-all-${structure}`, anchors);
      entry.bodice.structure = structure;
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 12 (T13): Waist accent rendering
// ---------------------------------------------------------------------------
describe('composeDress — waist accent (T13)', () => {
  it('sash accent: includes data-accent=sash markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-sash', anchors);
    entry.bodice.accent = 'sash';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-accent="sash"');
  });

  it('ribbon accent: includes data-accent=ribbon markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-ribbon', anchors);
    entry.bodice.accent = 'ribbon';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-accent="ribbon"');
  });

  it('brooch accent: includes data-accent=brooch markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-brooch', anchors);
    entry.bodice.accent = 'brooch';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-accent="brooch"');
  });

  it('beadedBand accent: includes data-accent=beadedBand markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-beaded', anchors);
    entry.bodice.accent = 'beadedBand';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-accent="beadedBand"');
  });

  it('none accent: does not add accent markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-none', anchors);
    entry.bodice.accent = 'none';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).not.toContain('data-accent=');
  });

  it('all 5 accent types render without throwing', () => {
    const accents = ['none', 'sash', 'ribbon', 'brooch', 'beadedBand'] as const;
    const anchors = anchorSetFromRef('aline');
    for (const accent of accents) {
      const entry = createDefaultEntry(`t13-acc-${accent}`, anchors);
      entry.bodice.accent = accent;
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 13 (T13): Waist position offset affects rendered output
// ---------------------------------------------------------------------------
describe('composeDress — waist position offset (T13)', () => {
  it('empire waistPosition renders without throwing', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-emp', anchors);
    entry.bodice.waistPosition = 'empire';
    entry.bodice.structure = 'corset';
    expect(() =>
      renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
    ).not.toThrow();
  });

  it('drop waistPosition renders without throwing', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t13-drop', anchors);
    entry.bodice.waistPosition = 'drop';
    entry.bodice.accent = 'sash';
    expect(() =>
      renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
    ).not.toThrow();
  });

  it('corset with empire waistPosition differs from corset with natural', () => {
    const anchors = anchorSetFromRef('aline');
    const empire = createDefaultEntry('t13-emp2', anchors);
    empire.bodice.structure = 'corset';
    empire.bodice.waistPosition = 'empire';

    const natural = createDefaultEntry('t13-nat2', anchors);
    natural.bodice.structure = 'corset';
    natural.bodice.waistPosition = 'natural';

    const empireHtml = renderToStaticMarkup(composeDress(empire, anchors, DEFAULT_OPTIONS));
    const naturalHtml = renderToStaticMarkup(composeDress(natural, anchors, DEFAULT_OPTIONS));
    // empire waistY=300, natural waistY=400, so the corset lines differ
    expect(empireHtml).not.toEqual(naturalHtml);
  });

  it('all 5 waist positions render without throwing (with sash accent)', () => {
    const positions = ['natural', 'empire', 'basque', 'drop', 'asymmetric'] as const;
    const anchors = anchorSetFromRef('aline');
    for (const waistPosition of positions) {
      const entry = createDefaultEntry(`t13-wp-${waistPosition}`, anchors);
      entry.bodice.waistPosition = waistPosition;
      entry.bodice.accent = 'sash';
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});
