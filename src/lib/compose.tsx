import type { ReactElement } from 'react';
import type { DressEntry, AnchorSet, FabricType, ColorEnum } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';
import { NECKLINES } from '../parts/necklines';
import { SLEEVES } from '../parts/sleeves';
import { STRUCTURES, ACCENTS, WAIST_Y_OFFSET } from '../parts/bodices';
import { BACKS } from '../parts/backs';
import { FABRICS } from '../parts/fabrics';
import { TEXTURES, slitCutout, trainPath } from '../parts/skirts';
import { meshWarp, solveAffine, toSvgTransform } from './warp';
import { COLOR_HEX } from './colorPalette';

export interface ComposeOptions {
  /** Photo dimensions in pixels — sets the SVG viewBox to photo space. */
  photoWidth: number;
  photoHeight: number;
  /** Optional prefix for clipPath IDs to avoid collisions when multiple SVGs render. */
  idPrefix?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Build the SVG def id for a fabric+color pair. */
function fabricDefId(idPrefix: string, fabric: FabricType, color: ColorEnum): string {
  return `${idPrefix}fabric-${fabric}-${color}`;
}

/**
 * Render the unique fabric <defs> elements needed by this entry.
 * We only render the defs actually used (bodice + sleeves), de-duplicated.
 */
function renderFabricDefs(entry: DressEntry, idPrefix: string): ReactElement[] {
  const color = entry.color.primary;
  const colorHex = COLOR_HEX[color];
  const used = new Set<FabricType>([
    entry.fabric.bodice,
    entry.fabric.skirt,
    entry.fabric.sleeves,
    entry.fabric.veil,
  ]);
  return Array.from(used).map((fabric) =>
    FABRICS[fabric].renderDef({ idPrefix, color, colorHex }),
  );
}

/** Build the SVG def id for an ombre gradient. */
function ombreDefId(idPrefix: string, primary: ColorEnum, secondary: ColorEnum): string {
  return `${idPrefix}ombre-${primary}-${secondary}`;
}

/** Render the 12 warped silhouette triangles as clipPath+g pairs. */
function renderSilhouette(
  entry: DressEntry,
  anchors: AnchorSet,
  idPrefix: string,
): ReactElement {
  const def = SILHOUETTES[entry.silhouette];
  const warps = meshWarp(def.referencePose, entry.anchors ?? anchors);

  const isOmbre = entry.color.gradient === 'ombre' && !!entry.color.secondary;
  // NOTE: ombre overrides fabric for v1; fabric+ombre combo is not supported.
  const fill = isOmbre
    ? `url(#${ombreDefId(idPrefix, entry.color.primary, entry.color.secondary!)})`
    : `url(#${fabricDefId(idPrefix, entry.fabric.bodice, entry.color.primary)})`;

  const clipPaths = warps.map((w, idx) => {
    const [p0, p1, p2] = w.clipTriangleInSrcSpace;
    const pts = `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`;
    return (
      <clipPath key={idx} id={`${idPrefix}tri-${idx}`}>
        <polygon points={pts} />
      </clipPath>
    );
  });

  // T11: combine bodyPath + neckline cutoutPath with evenodd fill rule to punch the opening
  // T17: also include slit cutout if present
  const necklineDef = NECKLINES[entry.neckline];
  const slitPath = slitCutout(entry.skirt.slit.type, entry.skirt.slit.height);
  const combinedPath = `${def.bodyPath} ${necklineDef.cutoutPath} ${slitPath}`.trim();

  const groups = warps.map((w, idx) => (
    <g
      key={idx}
      clipPath={`url(#${idPrefix}tri-${idx})`}
      transform={toSvgTransform(w.transform)}
    >
      <path d={combinedPath} fillRule="evenodd" fill={fill} />
    </g>
  ));

  // T16: ombre gradient def
  const ombreDef = isOmbre ? (
    <linearGradient
      id={ombreDefId(idPrefix, entry.color.primary, entry.color.secondary!)}
      x1="0" y1="0" x2="0" y2="1"
    >
      <stop offset="0" stopColor={COLOR_HEX[entry.color.primary]} />
      <stop offset="1" stopColor={COLOR_HEX[entry.color.secondary!]} />
    </linearGradient>
  ) : null;

  return (
    <>
      <defs>
        {ombreDef}
        {clipPaths}
      </defs>
      <g style={{ opacity: entry.opacity }}>{groups}</g>
    </>
  );
}

// ---------------------------------------------------------------------------
// Canonical reference shoulder/bust/waist positions (must match silhouette pose.ts)
// ---------------------------------------------------------------------------
const REF_SHOULDER_L = { x: 140, y: 120 };
const REF_SHOULDER_R = { x: 260, y: 120 };
const REF_BUST       = { x: 200, y: 220 };
const REF_WAIST      = { x: 200, y: 400 };

/** Render sleeves using a shoulder+bust affine transform. */
function renderSleeves(
  entry: DressEntry,
  anchors: AnchorSet,
  idPrefix: string,
): ReactElement | null {
  const def = SLEEVES[entry.sleeve.type];
  if (!def.renders) return null;

  const xform = solveAffine(
    [REF_SHOULDER_L, REF_SHOULDER_R, REF_BUST],
    [anchors.shoulderL, anchors.shoulderR, anchors.bust],
  );

  const colorHex = COLOR_HEX[entry.color.primary];
  const { material } = entry.sleeve;
  const sleeveFabricFill = `url(#${fabricDefId(idPrefix, entry.fabric.sleeves, entry.color.primary)})`;

  // Use fabric fill for the sleeve; material modifiers override for sheer/beaded
  let fillProps: Record<string, string | number>;
  if (material === 'sheer') {
    fillProps = { fill: colorHex, opacity: 0.3 };
  } else if (material === 'beaded') {
    fillProps = { fill: colorHex, opacity: 0.85 };
  } else {
    // opaque or lace — use the fabric def fill
    fillProps = { fill: sleeveFabricFill };
  }

  return (
    <g transform={toSvgTransform(xform)}>
      <path d={def.paths.left}  {...fillProps} />
      <path d={def.paths.right} {...fillProps} />
    </g>
  );
}

/** Render bodice structure overlay (corset lines, peplum, etc.). */
function renderBodice(
  entry: DressEntry,
  anchors: AnchorSet,
): ReactElement | null {
  const def = STRUCTURES[entry.bodice.structure];
  const waistY = REF_WAIST.y + WAIST_Y_OFFSET[entry.bodice.waistPosition];
  const ctx = {
    topY: 120,
    waistY,
    leftX: REF_SHOULDER_L.x,
    rightX: REF_SHOULDER_R.x,
    shoulderLX: REF_SHOULDER_L.x,
    shoulderRX: REF_SHOULDER_R.x,
  };
  const colorHex = COLOR_HEX[entry.color.primary];
  const element = def.render(ctx, colorHex, colorHex);
  if (!element) return null;

  const xform = solveAffine(
    [REF_SHOULDER_L, REF_SHOULDER_R, REF_WAIST],
    [anchors.shoulderL, anchors.shoulderR, anchors.waist],
  );
  return <g transform={toSvgTransform(xform)}>{element}</g>;
}

/** Render back hint at side edges (minimal visual cue). */
function renderBackHint(
  entry: DressEntry,
  anchors: AnchorSet,
  idPrefix: string,
): ReactElement | null {
  const def = BACKS[entry.back.type];
  const waistY = REF_WAIST.y + WAIST_Y_OFFSET[entry.bodice.waistPosition];
  const element = def.render({ topY: 120, waistY, openDepth: entry.back.openDepth, idPrefix });
  if (!element) return null;

  const xform = solveAffine(
    [REF_SHOULDER_L, REF_SHOULDER_R, REF_BUST],
    [anchors.shoulderL, anchors.shoulderR, anchors.bust],
  );
  return <g transform={toSvgTransform(xform)}>{element}</g>;
}

/** Render waist accent (sash, ribbon, brooch, beadedBand). */
function renderAccent(
  entry: DressEntry,
  anchors: AnchorSet,
): ReactElement | null {
  const def = ACCENTS[entry.bodice.accent];
  const waistY = REF_WAIST.y + WAIST_Y_OFFSET[entry.bodice.waistPosition];
  const ctx = {
    waistY,
    leftX: REF_SHOULDER_L.x,
    rightX: REF_SHOULDER_R.x,
    centerX: (REF_SHOULDER_L.x + REF_SHOULDER_R.x) / 2,
    accentColor: COLOR_HEX[entry.bodice.accentColor],
  };
  const element = def.render(ctx);
  if (!element) return null;

  const xform = solveAffine(
    [REF_SHOULDER_L, REF_SHOULDER_R, REF_WAIST],
    [anchors.shoulderL, anchors.shoulderR, anchors.waist],
  );
  return <g transform={toSvgTransform(xform)}>{element}</g>;
}

// ---------------------------------------------------------------------------
// Canonical skirt reference anchors (must align with silhouette pose.ts)
// ---------------------------------------------------------------------------
const REF_WAIST_SKIRT = { x: 200, y: 400 };
const REF_HIP_L = { x: 150, y: 500 };
const REF_HIP_R = { x: 250, y: 500 };
const REF_KNEE_L = { x: 170, y: 620 };
const REF_KNEE_R = { x: 230, y: 620 };
const REF_HEM_CENTER = { x: 200, y: 780 };

/** Render skirt texture overlay warped to skirt region. */
function renderSkirtTexture(
  entry: DressEntry,
  anchors: AnchorSet,
  idPrefix: string,
): ReactElement | null {
  const def = TEXTURES[entry.skirt.texture];
  const colorHex = COLOR_HEX[entry.color.primary];
  const element = def.render({
    topY: 400,
    bottomY: 780,
    leftX: 150,
    rightX: 250,
    layers: entry.skirt.layers,
    color: colorHex,
    idPrefix,
  });
  if (!element) return null;

  const xform = solveAffine(
    [REF_WAIST_SKIRT, REF_HIP_L, REF_HIP_R],
    [anchors.waist, anchors.hipL, anchors.hipR],
  );
  return <g transform={toSvgTransform(xform)}>{element}</g>;
}

/** Render train extending below the hem. */
function renderTrain(
  entry: DressEntry,
  anchors: AnchorSet,
): ReactElement | null {
  const path = trainPath(entry.skirt.train, REF_HEM_CENTER.x, REF_HEM_CENTER.y);
  if (!path) return null;

  const colorHex = COLOR_HEX[entry.color.primary];
  // Use kneeL/kneeR/hemCenter — hem points are collinear in reference pose,
  // so we use knees as the third reference point to form a proper triangle.
  const xform = solveAffine(
    [REF_KNEE_L, REF_KNEE_R, REF_HEM_CENTER],
    [anchors.kneeL, anchors.kneeR, anchors.hemCenter],
  );
  return (
    <g transform={toSvgTransform(xform)}>
      <path d={path} fill={colorHex} data-train={entry.skirt.train} opacity={entry.opacity} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compose a dress SVG from a DressEntry and an AnchorSet.
 *
 * v1: silhouette + single flat color fill. No fabric patterns or extra layers yet.
 * Future layers (neckline, sleeves, bodice, skirt, embellishments, …) will plug
 * in alongside renderSilhouette() inside the outer <g>.
 */
export function composeDress(
  entry: DressEntry,
  anchors: AnchorSet,
  options: ComposeOptions,
): ReactElement {
  const { photoWidth, photoHeight, idPrefix = '' } = options;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={photoWidth}
      height={photoHeight}
      viewBox={`0 0 ${photoWidth} ${photoHeight}`}
    >
      {/* Fabric defs for the current entry */}
      <defs>
        {renderFabricDefs(entry, idPrefix)}
      </defs>
      {/* T17: train behind silhouette */}
      {renderTrain(entry, anchors)}
      {renderSilhouette(entry, anchors, idPrefix)}
      {/* T17: skirt texture overlay */}
      {renderSkirtTexture(entry, anchors, idPrefix)}
      {/* T12: sleeve layer */}
      {renderSleeves(entry, anchors, idPrefix)}
      {/* T13: bodice structure + accent layers */}
      {renderBodice(entry, anchors)}
      {renderAccent(entry, anchors)}
      {/* T14: back hint layer */}
      {renderBackHint(entry, anchors, idPrefix)}
      {/* T18+ embellishments go here */}
    </svg>
  );
}
