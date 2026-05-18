import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportAllToJson, importFromJson } from './exportJson';
import type { AppMeta, DressEntry } from '../types';
import { createDefaultEntry } from '../types';
import { defaultAnchors } from './defaultAnchors';

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

  it('defaults aiResult and referenceDress to null when missing (old export)', async () => {
    // Simulate an older export that doesn't include aiResult / referenceDress
    const oldEntry = { id: 'old-1', nickname: '구형', shop: '', dressNo: '' };
    const bundle = JSON.stringify({
      version: 1,
      exportedAt: 0,
      meta: null,
      entries: [oldEntry],
    });
    const result = await importFromJson(bundle);
    expect(result.entries[0].aiResult).toBeNull();
    expect(result.entries[0].referenceDress).toBeNull();
  });
});

describe('exportAllToJson with aiResult', () => {
  function makeEntryWithAi(): DressEntry {
    const anchors = defaultAnchors(400, 800);
    const e = createDefaultEntry('ai-entry', anchors);
    return {
      ...e,
      aiResult: {
        dataUrl: 'data:image/png;base64,AAAA',
        generatedAt: 1000,
        modelId: 'gemini',
        paramsHash: 'abc',
        prompt: 'wedding dress',
      },
      referenceDress: {
        dataUrl: 'data:image/jpeg;base64,BBBB',
        uploadedAt: 2000,
      },
    };
  }

  it('round-trips an entry with aiResult populated', async () => {
    const entry = makeEntryWithAi();
    const json = await exportAllToJson(null, [entry]);
    const result = await importFromJson(json);
    expect(result.entries[0].aiResult?.dataUrl).toBe('data:image/png;base64,AAAA');
    expect(result.entries[0].aiResult?.modelId).toBe('gemini');
    expect(result.entries[0].referenceDress?.dataUrl).toBe('data:image/jpeg;base64,BBBB');
  });

  it('strips dataUrl from aiResult and referenceDress when includeAiImages is false', async () => {
    const entry = makeEntryWithAi();
    const json = await exportAllToJson(null, [entry], { includeAiImages: false });
    const parsed = JSON.parse(json);
    expect(parsed.entries[0].aiResult.dataUrl).toBe('');
    expect(parsed.entries[0].referenceDress.dataUrl).toBe('');
  });

  it('preserves dataUrls when includeAiImages is true (default)', async () => {
    const entry = makeEntryWithAi();
    const json = await exportAllToJson(null, [entry], { includeAiImages: true });
    const parsed = JSON.parse(json);
    expect(parsed.entries[0].aiResult.dataUrl).toBe('data:image/png;base64,AAAA');
  });

  it('preserves other aiResult fields even when includeAiImages is false', async () => {
    const entry = makeEntryWithAi();
    const json = await exportAllToJson(null, [entry], { includeAiImages: false });
    const parsed = JSON.parse(json);
    expect(parsed.entries[0].aiResult.modelId).toBe('gemini');
    expect(parsed.entries[0].aiResult.prompt).toBe('wedding dress');
    expect(parsed.entries[0].aiResult.generatedAt).toBe(1000);
  });
});
