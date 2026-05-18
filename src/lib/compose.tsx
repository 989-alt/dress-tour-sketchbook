import type { ReactElement } from 'react';
import type { DressEntry, AnchorSet } from '../types';
import { SILHOUETTES } from '../parts/silhouettes';
import { meshWarp, toSvgTransform } from './warp';
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

  const groups = warps.map((w, idx) => (
    <g
      key={idx}
      clipPath={`url(#${idPrefix}tri-${idx})`}
      transform={toSvgTransform(w.transform)}
    >
      <path d={def.bodyPath} fill={fill} />
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
      {renderSilhouette(entry, anchors, idPrefix)}
      {/* T11+ neckline layer goes here */}
      {/* T12+ sleeve layer goes here */}
      {/* T13+ bodice layer goes here */}
      {/* T17+ skirt layer goes here */}
      {/* T18+ embellishments go here */}
    </svg>
  );
}
