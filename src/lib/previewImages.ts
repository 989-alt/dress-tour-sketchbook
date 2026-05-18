export type PreviewCategory =
  | 'silhouette' | 'neckline' | 'sleeve' | 'sleeveMaterial'
  | 'waistPosition' | 'bodiceStructure' | 'waistAccent'
  | 'back' | 'skirtTexture' | 'slit' | 'train'
  | 'fabric' | 'color' | 'embellishment'
  | 'veilLength' | 'veilEdge' | 'accessory';

export function previewUrl(category: PreviewCategory, value: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}previews/${category}/${value}.png`;
}
