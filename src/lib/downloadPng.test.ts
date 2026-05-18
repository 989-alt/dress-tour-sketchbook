import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { dataUrlToPngBlob, downloadPngBlob } from './downloadPng';

beforeAll(() => {
  // Stub canvas APIs (jsdom has no real canvas rendering)
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: vi.fn(),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;

  HTMLCanvasElement.prototype.toBlob = vi.fn((cb: (blob: Blob | null) => void) => {
    cb(new Blob(['png'], { type: 'image/png' }));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('dataUrlToPngBlob', () => {
  it('rejects with IMG_LOAD_FAILED when image fails to load', async () => {
    // Stub Image so onerror fires immediately
    const OrigImage = globalThis.Image;
    globalThis.Image = class extends OrigImage {
      constructor() {
        super();
        setTimeout(() => this.onerror?.call(this, new Event('error')), 0);
      }
    };

    await expect(dataUrlToPngBlob('data:image/png;base64,INVALID')).rejects.toThrow(
      'IMG_LOAD_FAILED',
    );

    globalThis.Image = OrigImage;
  });
});

describe('downloadPngBlob', () => {
  it('creates an anchor element and clicks it', () => {
    const blob = new Blob(['png'], { type: 'image/png' });
    const createObjectURL = vi.fn(() => 'blob:fake-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    const clickSpy = vi.fn();
    const fakeAnchor = { href: '', download: '', click: clickSpy };
    vi.spyOn(document, 'createElement').mockReturnValueOnce(fakeAnchor as unknown as HTMLElement);

    downloadPngBlob(blob, 'test.png');

    expect(fakeAnchor.download).toBe('test.png');
    expect(fakeAnchor.href).toBe('blob:fake-url');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});
