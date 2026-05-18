import type { NecklineType } from '../../types';

export interface NecklineDef {
  type: NecklineType;
  /**
   * SVG path d-string for the cutout polygon, in the canonical 400×800 viewBox.
   * The cutout is removed from the bodice top (i.e., the neckline opening).
   * Must be a closed path ending with Z.
   */
  cutoutPath: string;
  /** Topmost y above which the silhouette body is unaffected. Defaults to 80. */
  topY?: number;
  /** Korean display name */
  label: string;
}
