import type { SleeveType } from '../../types';

export interface SleeveSidePaths {
  /** SVG path d-string in canonical 400×800 space, left sleeve. */
  left: string;
  /** SVG path d-string in canonical 400×800 space, right sleeve (mirrored). */
  right: string;
}

export interface SleeveDef {
  type: SleeveType;
  /** Korean display label */
  label: string;
  paths: SleeveSidePaths;
  /**
   * If false, the sleeve is never rendered (e.g., sleeveless).
   * If true, render the path shapes.
   */
  renders: boolean;
}
