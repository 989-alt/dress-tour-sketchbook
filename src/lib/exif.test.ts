import { describe, it, expect } from 'vitest';
import { loadImageWithCorrectOrientation } from './exif';

describe('loadImageWithCorrectOrientation', () => {
  it('is a function', () => {
    expect(typeof loadImageWithCorrectOrientation).toBe('function');
  });

  it('rejects in jsdom because createImageBitmap is not supported', async () => {
    // jsdom does not implement createImageBitmap, so we expect a clear rejection
    const blob = new Blob(['fake image data'], { type: 'image/jpeg' });
    await expect(loadImageWithCorrectOrientation(blob)).rejects.toThrow(
      'createImageBitmap is not supported in this environment',
    );
  });
});
