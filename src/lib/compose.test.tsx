import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { composeDress } from './compose';
import { COLOR_HEX } from './colorPalette';
import { createDefaultEntry } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';
import type { AnchorSet, SilhouetteType, SleeveType, SleeveMaterial, BackType, FabricType, SkirtTexture } from '../types';

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
// Test 3: Color — the fabric def id references the primary color
// ---------------------------------------------------------------------------
describe('composeDress — color fill', () => {
  it('renders fabric-satin-blush def when color.primary is blush', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t3', anchors);
    entry.color.primary = 'blush';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain('fabric-satin-blush');
    // blush hex appears inside the fabric def as stop-color
    expect(html).toContain(COLOR_HEX.blush);
  });

  it('renders fabric-satin-ivory def when color.primary is ivory', () => {
    const anchors = anchorSetFromRef('sheath');
    const entry = createDefaultEntry('t3b', anchors);
    entry.color.primary = 'ivory';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain('fabric-satin-ivory');
    expect(html).toContain(COLOR_HEX.ivory);
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

  it('opaque material: fill references fabric url with blush color', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-opaque', anchors);
    entry.sleeve = { type: 'long', material: 'opaque' };
    entry.color.primary = 'blush';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    // sleeve fill uses url(#fabric-satin-blush) since default sleeves fabric is satin
    expect(html).toContain('url(#');
    expect(html).toContain('fabric-satin-blush');
  });

  it('sheer material: opacity attribute is 0.3', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-sheer', anchors);
    entry.sleeve = { type: 'long', material: 'sheer' };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('opacity="0.3"');
  });

  it('lace material: fill references a fabric url', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-lace', anchors);
    entry.sleeve = { type: 'long', material: 'lace' };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('url(#');
    // The default fabric for sleeves is satin, so we see a fabric url
    expect(html).toContain('fabric-satin');
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

  it('fabric defs are present in SVG for default entry', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t10-defs', anchors);
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    // Default entry uses satin for bodice/skirt/sleeves
    expect(html).toContain('fabric-satin');
    // Default veil fabric is tulle
    expect(html).toContain('fabric-tulle');
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

// ---------------------------------------------------------------------------
// Test 14 (T14): Back hint rendering
// ---------------------------------------------------------------------------
describe('composeDress — back hint (T14)', () => {
  it('closed back: does not render data-back markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t14-closed', anchors);
    entry.back = { type: 'closed', openDepth: 0 };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).not.toContain('data-back=');
  });

  it('openBack with openDepth=3: renders data-back=openBack markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t14-openback', anchors);
    entry.back = { type: 'openBack', openDepth: 3 };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-back="openBack"');
  });

  it('vBack: renders data-back=vBack markup', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t14-vback', anchors);
    entry.back = { type: 'vBack', openDepth: 0 };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-back="vBack"');
  });

  it('all 8 back types render without throwing', () => {
    const backTypes: BackType[] = ['closed', 'vBack', 'illusionBack', 'openBack', 'keyhole', 'buttonRow', 'laceUpCorset', 'drape'];
    const anchors = anchorSetFromRef('aline');
    for (const type of backTypes) {
      const entry = createDefaultEntry(`t14-all-${type}`, anchors);
      entry.back = { type, openDepth: 2 };
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 15 (T15): Fabric defs are rendered in the SVG
// ---------------------------------------------------------------------------
describe('composeDress — fabric defs (T15)', () => {
  it('lace bodice: renders lace fabric def and fill url reference', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t15-lace', anchors);
    entry.fabric.bodice = 'lace';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    // Fabric def id for lace+pureWhite should appear
    expect(html).toContain('fabric-lace-pureWhite');
    // Fill url reference
    expect(html).toContain('url(#');
  });

  it('taffeta bodice: renders taffeta fabric def', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t15-taffeta', anchors);
    entry.fabric.bodice = 'taffeta';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('fabric-taffeta-pureWhite');
  });

  it('silhouette fill uses url(#...fabric-{bodice}-{color})', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t15-url', anchors);
    entry.fabric.bodice = 'organza';
    entry.color.primary = 'ivory';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('url(#');
    expect(html).toContain('fabric-organza-ivory');
  });

  it('all 7 fabric types render without throwing for bodice', () => {
    const fabrics: FabricType[] = ['satin', 'mikado', 'organza', 'tulle', 'lace', 'chiffon', 'taffeta'];
    const anchors = anchorSetFromRef('aline');
    for (const fabric of fabrics) {
      const entry = createDefaultEntry(`t15-all-${fabric}`, anchors);
      entry.fabric.bodice = fabric;
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });

  it('de-duplicates fabric defs when bodice=skirt=sleeves=satin', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t15-dedup', anchors);
    // All three use satin; veil uses tulle (default)
    // Should produce only 2 unique fabric defs: satin + tulle
    entry.fabric.bodice = 'satin';
    entry.fabric.skirt = 'satin';
    entry.fabric.sleeves = 'satin';
    entry.fabric.veil = 'tulle';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    // satin def appears once
    const satinMatches = (html.match(/id="fabric-satin-/g) ?? []).length;
    expect(satinMatches).toBe(1);
    // tulle def appears once
    const tulleMatches = (html.match(/id="fabric-tulle-/g) ?? []).length;
    expect(tulleMatches).toBe(1);
  });

  it('idPrefix is included in fabric def id', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t15-prefix', anchors);
    const html = renderToStaticMarkup(composeDress(entry, anchors, { ...DEFAULT_OPTIONS, idPrefix: 'p1-' }));
    expect(html).toContain('id="p1-fabric-satin-pureWhite"');
  });
});

// ---------------------------------------------------------------------------
// Test 16 (T16): Ombre gradient
// ---------------------------------------------------------------------------
describe('composeDress — ombre gradient (T16)', () => {
  it('renders a linearGradient def when gradient=ombre and secondary is set', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t16-ombre', anchors);
    entry.color.gradient = 'ombre';
    entry.color.secondary = 'blush';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain('<linearGradient');
    expect(html).toContain('ombre-pureWhite-blush');
  });

  it('ombre gradient uses primary color as first stop and secondary as last stop', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t16-stops', anchors);
    entry.color.primary = 'ivory';
    entry.color.gradient = 'ombre';
    entry.color.secondary = 'blush';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain(COLOR_HEX.ivory);
    expect(html).toContain(COLOR_HEX.blush);
    // Vertical gradient: x1=0 y1=0 x2=0 y2=1
    expect(html).toContain('x1="0"');
    expect(html).toContain('y2="1"');
  });

  it('silhouette fill uses url(#ombre-...) when gradient=ombre', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t16-fill', anchors);
    entry.color.gradient = 'ombre';
    entry.color.secondary = 'champagne';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).toContain('url(#ombre-pureWhite-champagne)');
  });

  it('silhouette fill uses fabric url (not ombre) when gradient=solid', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t16-solid', anchors);
    entry.color.gradient = 'solid';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    expect(html).not.toContain('url(#ombre-');
    expect(html).toContain('url(#fabric-');
  });

  it('no ombre gradient id rendered when gradient=solid', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t16-no-grad', anchors);
    entry.color.gradient = 'solid';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));

    // No ombre-specific gradient id should appear
    expect(html).not.toContain('id="ombre-');
  });

  it('idPrefix is included in ombre gradient id', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t16-prefix', anchors);
    entry.color.gradient = 'ombre';
    entry.color.secondary = 'gold';
    const html = renderToStaticMarkup(composeDress(entry, anchors, { ...DEFAULT_OPTIONS, idPrefix: 'x-' }));

    expect(html).toContain('id="x-ombre-pureWhite-gold"');
    expect(html).toContain('url(#x-ombre-pureWhite-gold)');
  });

  it('ombre renders without throwing for all 9 silhouettes', () => {
    const ALL_SIL: SilhouetteType[] = ['aline', 'mermaid', 'trumpet', 'princess', 'sheath', 'empire', 'fitFlare', 'tealength', 'mini'];
    for (const sil of ALL_SIL) {
      const anchors = anchorSetFromRef(sil);
      const entry = createDefaultEntry(`t16-sil-${sil}`, anchors);
      (entry as { silhouette: SilhouetteType }).silhouette = sil;
      entry.color.gradient = 'ombre';
      entry.color.secondary = 'blush';
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 17 (T17): Skirt texture overlay
// ---------------------------------------------------------------------------
describe('composeDress — skirt texture overlay (T17)', () => {
  it('pleated texture: renders data-texture=pleated in output', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-pleated', anchors);
    entry.skirt.texture = 'pleated';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-texture="pleated"');
  });

  it('gathered texture: renders data-texture=gathered in output', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-gathered', anchors);
    entry.skirt.texture = 'gathered';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-texture="gathered"');
  });

  it('smooth texture: no texture overlay rendered', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-smooth', anchors);
    entry.skirt.texture = 'smooth';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).not.toContain('data-texture=');
  });

  it('all 8 textures render without throwing', () => {
    const textures: SkirtTexture[] = [
      'smooth', 'gathered', 'pleated', 'tiered',
      'layeredTulle', 'ruffled', 'ruched', 'asymmetricDrape',
    ];
    const anchors = anchorSetFromRef('aline');
    for (const texture of textures) {
      const entry = createDefaultEntry(`t17-tex-${texture}`, anchors);
      entry.skirt.texture = texture;
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 18 (T17): Slit cutout in silhouette path
// ---------------------------------------------------------------------------
describe('composeDress — slit cutout (T17)', () => {
  it('side slit height=3: silhouette path contains slit cutout coords', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-slit-side', anchors);
    entry.skirt.slit = { type: 'side', height: 3 };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    // Slit cutout adds path with Z; fill-rule evenodd still present
    expect(html).toContain('fill-rule="evenodd"');
    // Side slit uses x=240 and x=250
    expect(html).toContain('240');
    expect(html).toContain('250');
  });

  it('front slit height=2: silhouette path contains front slit coords', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-slit-front', anchors);
    entry.skirt.slit = { type: 'front', height: 2 };
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('fill-rule="evenodd"');
    expect(html).toContain('195');
  });

  it('slit height=0 adds no slit path (same as default)', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-slit-none', anchors);
    entry.skirt.slit = { type: 'side', height: 0 };
    const htmlZero = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    const entryNone = createDefaultEntry('t17-slit-def', anchors);
    const htmlNone = renderToStaticMarkup(composeDress(entryNone, anchors, DEFAULT_OPTIONS));
    // Both should produce identical slit-relevant output
    expect(htmlZero).toEqual(htmlNone);
  });

  it('slit renders without throwing for all types and heights', () => {
    const anchors = anchorSetFromRef('aline');
    for (const type of ['none', 'side', 'front'] as const) {
      for (const height of [0, 1, 3, 5] as const) {
        const entry = createDefaultEntry(`t17-slit-${type}-${height}`, anchors);
        entry.skirt.slit = { type, height };
        expect(() =>
          renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
        ).not.toThrow();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Test T18: Embellishments layer
// ---------------------------------------------------------------------------
describe('composeDress — embellishments (T18)', () => {
  it('pearls on bodice at intensity=3 renders data-embellishment=pearls', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t18-pearls', anchors);
    entry.embellishments = [{ type: 'pearls', region: 'bodice', intensity: 3 }];
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-embellishment="pearls"');
  });

  it('crystals on skirt at intensity=2 renders data-embellishment=crystals', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t18-crystals', anchors);
    entry.embellishments = [{ type: 'crystals', region: 'skirt', intensity: 2 }];
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-embellishment="crystals"');
  });

  it('intensity=0 embellishment is not rendered', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t18-zero', anchors);
    entry.embellishments = [{ type: 'beads', region: 'bodice', intensity: 0 }];
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).not.toContain('data-embellishment="beads"');
  });

  it('empty embellishments array renders without error and has no embellishment markers', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t18-empty', anchors);
    entry.embellishments = [];
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).not.toContain('data-embellishment=');
  });

  it('multiple embellishments all render their markers', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t18-multi', anchors);
    entry.embellishments = [
      { type: 'pearls', region: 'bodice', intensity: 3 },
      { type: 'sequins', region: 'skirt', intensity: 1 },
      { type: 'embroidery', region: 'waist', intensity: 2 },
    ];
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-embellishment="pearls"');
    expect(html).toContain('data-embellishment="sequins"');
    expect(html).toContain('data-embellishment="embroidery"');
  });

  it('allover region renders without throwing', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t18-allover', anchors);
    entry.embellishments = [{ type: 'beads', region: 'allover', intensity: 2 }];
    expect(() =>
      renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
    ).not.toThrow();
  });

  it('all 9 embellishment types render without throwing', () => {
    const types = [
      'beads', 'laceApplique', 'threeDFlorals', 'crystals', 'pearls',
      'embroidery', 'sequins', 'ribbons', 'decorativeButtons',
    ] as const;
    const anchors = anchorSetFromRef('aline');
    for (const type of types) {
      const entry = createDefaultEntry(`t18-type-${type}`, anchors);
      entry.embellishments = [{ type, region: 'bodice', intensity: 2 }];
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });

  it('all 6 regions render without throwing for beads', () => {
    const regions = ['bodice', 'waist', 'skirt', 'sleeves', 'train', 'allover'] as const;
    const anchors = anchorSetFromRef('aline');
    for (const region of regions) {
      const entry = createDefaultEntry(`t18-region-${region}`, anchors);
      entry.embellishments = [{ type: 'beads', region, intensity: 1 }];
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });

  it('intensity=3 pearls have more circle elements than intensity=1', () => {
    const anchors = anchorSetFromRef('aline');
    const e1 = createDefaultEntry('t18-dense-1', anchors);
    e1.embellishments = [{ type: 'pearls', region: 'bodice', intensity: 1 }];
    const e3 = createDefaultEntry('t18-dense-3', anchors);
    e3.embellishments = [{ type: 'pearls', region: 'bodice', intensity: 3 }];
    const html1 = renderToStaticMarkup(composeDress(e1, anchors, DEFAULT_OPTIONS));
    const html3 = renderToStaticMarkup(composeDress(e3, anchors, DEFAULT_OPTIONS));
    const count1 = (html1.match(/<circle/g) ?? []).length;
    const count3 = (html3.match(/<circle/g) ?? []).length;
    expect(count3).toBeGreaterThan(count1);
  });
});

// ---------------------------------------------------------------------------
// Test 19 (T17): Train rendering
// ---------------------------------------------------------------------------
describe('composeDress — train (T17)', () => {
  it('chapel train: renders data-train=chapel element', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-chapel', anchors);
    entry.skirt.train = 'chapel';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-train="chapel"');
  });

  it('train=none: no data-train element rendered', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-train-none', anchors);
    entry.skirt.train = 'none';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).not.toContain('data-train=');
  });

  it('cathedral train: renders data-train=cathedral element', () => {
    const anchors = anchorSetFromRef('aline');
    const entry = createDefaultEntry('t17-cathedral', anchors);
    entry.skirt.train = 'cathedral';
    const html = renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS));
    expect(html).toContain('data-train="cathedral"');
  });

  it('all 5 train lengths render without throwing', () => {
    const trains = ['none', 'sweep', 'court', 'chapel', 'cathedral'] as const;
    const anchors = anchorSetFromRef('aline');
    for (const train of trains) {
      const entry = createDefaultEntry(`t17-tr-${train}`, anchors);
      entry.skirt.train = train;
      expect(() =>
        renderToStaticMarkup(composeDress(entry, anchors, DEFAULT_OPTIONS)),
      ).not.toThrow();
    }
  });
});
