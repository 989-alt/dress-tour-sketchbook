import { describe, it, expect, vi, afterEach } from 'vitest';
import { previewUrl } from './previewImages';

describe('previewUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns correct URL for silhouette/aline with default base', () => {
    vi.stubEnv('BASE_URL', '/');
    const url = previewUrl('silhouette', 'aline');
    expect(url).toBe('/previews/silhouette/aline.png');
  });

  it('returns correct URL for neckline/sweetheart', () => {
    vi.stubEnv('BASE_URL', '/');
    const url = previewUrl('neckline', 'sweetheart');
    expect(url).toBe('/previews/neckline/sweetheart.png');
  });

  it('respects a sub-path BASE_URL with trailing slash', () => {
    vi.stubEnv('BASE_URL', '/dress-app/');
    const url = previewUrl('fabric', 'satin');
    expect(url).toBe('/dress-app/previews/fabric/satin.png');
  });

  it('respects a sub-path BASE_URL without trailing slash', () => {
    vi.stubEnv('BASE_URL', '/dress-app');
    const url = previewUrl('color', 'ivory');
    expect(url).toBe('/dress-app/previews/color/ivory.png');
  });

  it('includes .png extension', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(previewUrl('sleeve', 'puff')).toMatch(/\.png$/);
  });

  it('includes category in path', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(previewUrl('embellishment', 'crystals')).toContain('/embellishment/');
  });

  it('includes value in path', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(previewUrl('accessory', 'tiara')).toContain('/tiara.png');
  });
});
