export type SlitTypeKey = 'none' | 'side' | 'front';

export function slitCutout(type: SlitTypeKey, height: 0 | 1 | 2 | 3 | 4 | 5): string {
  if (type === 'none' || height === 0) return '';
  const bottomY = 780;
  const topY = bottomY - 50 * height;
  if (type === 'side') {
    return `M 240 ${bottomY} L 250 ${bottomY} L 250 ${topY} L 240 ${topY} Z`;
  }
  // front
  return `M 195 ${bottomY} L 205 ${bottomY} L 205 ${topY} L 195 ${topY} Z`;
}
