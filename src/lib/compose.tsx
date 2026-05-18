import type { ReactElement } from 'react';
import type { DressEntry, AnchorSet } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';
import { NECKLINES } from '../parts/necklines';
import { SLEEVES } from '../parts/sleeves';
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

/** Render the 12 warped silhouette triangles as clipPath+g pairs. */
function renderSilhouette(
  entry: DressEntry,
  anchors: AnchorSet,
  idPrefix: string,
): ReactElement {
  const def = SILHOUETTES[entry.silhouette];
  const warps = meshWarp(def.referencePose, entry.anchors ?? anchors);
  const fill = COLOR_HEX[entry.color.primary];

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
  const necklineDef = NECKLINES[entry.neckline];
  const combinedPath = `${def.bodyPath} ${necklineDef.cutoutPath}`;

  const groups = warps.map((w, idx) => (
    <g
      key={idx}
      clipPath={`url(#${idPrefix}tri-${idx})`}
      transform={toSvgTransform(w.transform)}
    >
      <path d={combinedPath} fillRule="evenodd" fill={fill} />
    </g>
  ));

  return (
    <>
      <defs>{clipPaths}</defs>
      <g style={{ opacity: entry.opacity }}>{groups}</g>
    </>
  );
}

// ---------------------------------------------------------------------------
// Canonical reference shoulder/bust positions (must match silhouette pose.ts)
// ---------------------------------------------------------------------------
const REF_SHOULDER_L = { x: 140, y: 120 };
const REF_SHOULDER_R = { x: 260, y: 120 };
const REF_BUST       = { x: 200, y: 220 };

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

  // T15 will expand fabric patterns; for now we use opacity for sheer/lace/beaded.
  // lace and beaded patterns are defined in <defs> and referenced by fill.
  let fillProps: Record<string, string | number>;
  if (material === 'sheer') {
    fillProps = { fill: colorHex, opacity: 0.3 };
  } else if (material === 'lace') {
    fillProps = { fill: `url(#${idPrefix}lace-pattern)`, stroke: colorHex, strokeWidth: '0.5' };
  } else if (material === 'beaded') {
    fillProps = { fill: colorHex, opacity: 0.85 };
  } else {
    // opaque
    fillProps = { fill: colorHex };
  }

  return (
    <g transform={toSvgTransform(xform)}>
      <path d={def.paths.left}  {...fillProps} />
      <path d={def.paths.right} {...fillProps} />
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
      {/* Material patterns for sleeves — T15 will expand these */}
      <defs>
        <pattern id={`${idPrefix}lace-pattern`} patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="2" cy="2" r="0.8" fill="white" stroke="#cccccc" strokeWidth="0.3" />
          <circle cx="6" cy="6" r="0.8" fill="white" stroke="#cccccc" strokeWidth="0.3" />
        </pattern>
        <pattern id={`${idPrefix}beaded-pattern`} patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="3" cy="3" r="1.2" fill="#eeeeee" />
        </pattern>
      </defs>
      {renderSilhouette(entry, anchors, idPrefix)}
      {/* T12: sleeve layer */}
      {renderSleeves(entry, anchors, idPrefix)}
      {/* T13+ bodice layer goes here */}
      {/* T17+ skirt layer goes here */}
      {/* T18+ embellishments go here */}
    </svg>
  );
}
