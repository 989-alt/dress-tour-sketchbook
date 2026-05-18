import { describe, it, expect, vi, afterEach } from 'vitest';
import { previewUrl } from './previewImages';

describe('previewUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns correct URL for silhouette/aline with default base', () => {
    vi.stubEnv('BASE_URL', '/');
    const url = previewUrl('silhouette', 'aline');
    expect(url).toBe('/previews/silhouette/aline.webp');
  });

  it('returns correct URL for neckline/sweetheart', () => {
    vi.stubEnv('BASE_URL', '/');
    const url = previewUrl('neckline', 'sweetheart');
    expect(url).toBe('/previews/neckline/sweetheart.webp');
  });

  it('respects a sub-path BASE_URL with trailing slash', () => {
    vi.stubEnv('BASE_URL', '/dress-app/');
    const url = previewUrl('fabric', 'satin');
    expect(url).toBe('/dress-app/previews/fabric/satin.webp');
  });

  it('respects a sub-path BASE_URL without trailing slash', () => {
    vi.stubEnv('BASE_URL', '/dress-app');
    const url = previewUrl('color', 'ivory');
    expect(url).toBe('/dress-app/previews/color/ivory.webp');
  });

  it('includes .webp extension', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(previewUrl('sleeve', 'puff')).toMatch(/\.webp$/);
  });

  it('uses .webp not .png', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(previewUrl('color', 'ivory')).not.toMatch(/\.png$/);
  });

  it('includes category in path', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(previewUrl('embellishment', 'crystals')).toContain('/embellishment/');
  });

  it('includes value in path', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(previewUrl('accessory', 'tiara')).toContain('/tiara.webp');
  });
});
