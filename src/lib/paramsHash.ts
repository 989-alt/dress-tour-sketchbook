import type { DressEntry } from '../types';

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/**
 * Deterministic hash of the prompt-affecting subset of a DressEntry.
 * Used to detect when the entry has been edited since the last AI generation.
 */
export function paramsHash(entry: DressEntry): string {
  const subset = {
    silhouette: entry.silhouette,
    neckline: entry.neckline,
    sleeve: entry.sleeve,
    bodice: entry.bodice,
    back: entry.back,
    skirt: entry.skirt,
    fabric: entry.fabric,
    color: entry.color,
    embellishments: [...entry.embellishments]
      .filter((e) => e.intensity > 0)
      .sort((a, b) => (a.type + a.region).localeCompare(b.type + b.region)),
    veil: entry.veil,
    accessory: entry.accessory,
    refHash: entry.referenceDress?.dataUrl ? fnv1a(entry.referenceDress.dataUrl) : null,
  };
  return fnv1a(JSON.stringify(subset));
}
