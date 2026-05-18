import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportAllToJson, importFromJson } from './exportJson';
import type { AppMeta } from '../types';

beforeEach(() => {
  // Mock FileReader
  globalThis.FileReader = class {
    result: string | null = null;
    onload: ((e: ProgressEvent) => void) | null = null;
    onerror: ((e: ProgressEvent) => void) | null = null;
    readAsDataURL(blob: Blob) {
      void blob;
      this.result = 'data:image/png;base64,ZmFrZQ==';
      setTimeout(() => this.onload?.call(this, {} as ProgressEvent), 0);
    }
  } as unknown as typeof FileReader;

  // Mock fetch for importFromJson dataUrl → Blob conversion
  globalThis.fetch = vi.fn().mockResolvedValue({
    blob: () => Promise.resolve(new Blob(['photo'], { type: 'image/png' })),
  });
});

describe('exportAllToJson', () => {
  it('returns valid JSON with meta.basePhotoDataUrl=null when meta is null', async () => {
    const json = await exportAllToJson(null, []);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.meta.basePhotoDataUrl).toBeNull();
    expect(parsed.entries).toEqual([]);
  });

  it('includes exportedAt timestamp', async () => {
    const before = Date.now();
    const json = await exportAllToJson(null, []);
    const after = Date.now();
    const parsed = JSON.parse(json);
    expect(parsed.exportedAt).toBeGreaterThanOrEqual(before);
    expect(parsed.exportedAt).toBeLessThanOrEqual(after);
  });

  it('serializes photo as base64 data URL when meta has basePhoto', async () => {
    const meta: AppMeta = {
      basePhoto: new Blob(['fake'], { type: 'image/png' }),
      poseLandmarks: null,
      createdAt: 1234,
    };
    const json = await exportAllToJson(meta, []);
    const parsed = JSON.parse(json);
    expect(typeof parsed.meta.basePhotoDataUrl).toBe('string');
    expect(parsed.meta.basePhotoDataUrl).toMatch(/^data:/);
  });

  it('includes entries in output', async () => {
    const json = await exportAllToJson(null, [{ id: 'abc' } as never]);
    const parsed = JSON.parse(json);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].id).toBe('abc');
  });
});

describe('importFromJson', () => {
  it('throws on malformed JSON', async () => {
    await expect(importFromJson('not json')).rejects.toMatchObject({
      message: expect.stringContaining('JSON'),
    });
  });

  it('throws when version !== 1', async () => {
    const bundle = JSON.stringify({ version: 2, exportedAt: 0, meta: {}, entries: [] });
    await expect(importFromJson(bundle)).rejects.toMatchObject({
      message: expect.stringContaining('version'),
    });
  });

  it('throws when entries field is missing', async () => {
    const bundle = JSON.stringify({ version: 1, exportedAt: 0, meta: {} });
    await expect(importFromJson(bundle)).rejects.toMatchObject({
      message: expect.stringContaining('entries'),
    });
  });

  it('round-trips: exported JSON can be imported back', async () => {
    const meta: AppMeta = {
      basePhoto: new Blob(['img'], { type: 'image/png' }),
      poseLandmarks: null,
      createdAt: 9999,
    };
    const json = await exportAllToJson(meta, []);
    const result = await importFromJson(json);
    expect(result.meta).not.toBeNull();
    expect(result.meta?.createdAt).toBe(9999);
    expect(result.entries).toEqual([]);
  });

  it('returns null meta when bundle meta is missing', async () => {
    const bundle = JSON.stringify({ version: 1, exportedAt: 0, meta: null, entries: [] });
    const result = await importFromJson(bundle);
    expect(result.meta).toBeNull();
    expect(result.entries).toEqual([]);
  });

  it('converts basePhotoDataUrl back to Blob', async () => {
    const bundle = JSON.stringify({
      version: 1,
      exportedAt: 0,
      meta: { poseLandmarks: null, createdAt: 1, basePhotoDataUrl: 'data:image/png;base64,ZmFrZQ==' },
      entries: [],
    });
    const result = await importFromJson(bundle);
    expect(result.meta?.basePhoto).toBeInstanceOf(Blob);
  });
});
