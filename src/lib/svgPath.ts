/**
 * SVG path utilities for sleeve rendering.
 * Only handles absolute commands (M, L, C) and Z. Relative commands not used.
 */

/**
 * Mirror all x-coordinates in an absolute SVG path across x=200
 * (canonical 400-wide space: x → 400 - x).
 * Handles M, L, C (with 1, 1, 3 coordinate pairs respectively) and Z.
 */
export function mirrorPath(d: string): string {
  const tokens = d.trim().split(/\s+/);
  const result: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === 'M' || token === 'L') {
      result.push(token);
      i++;
      const x = parseFloat(tokens[i++]);
      const y = tokens[i++];
      result.push(String(400 - x), y);
    } else if (token === 'C') {
      result.push(token);
      i++;
      for (let p = 0; p < 3; p++) {
        const x = parseFloat(tokens[i++]);
        const y = tokens[i++];
        result.push(String(400 - x), y);
      }
    } else if (token === 'Z') {
      result.push(token);
      i++;
    } else {
      result.push(token);
      i++;
    }
  }
  return result.join(' ');
}
