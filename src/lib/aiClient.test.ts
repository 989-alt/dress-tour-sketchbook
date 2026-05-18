import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateDressImage, AIGenerationError } from './aiClient';
import { createDefaultEntry } from '../types';
import type { AnchorSet, DressEntry } from '../types';

const DEFAULT_ANCHORS: AnchorSet = {
  headTop: { x: 0, y: 0 },
  chin: { x: 0, y: 0 },
  neckCenter: { x: 0, y: 0 },
  shoulderL: { x: 0, y: 0 },
  shoulderR: { x: 0, y: 0 },
  bust: { x: 0, y: 0 },
  waist: { x: 0, y: 0 },
  hipL: { x: 0, y: 0 },
  hipR: { x: 0, y: 0 },
  kneeL: { x: 0, y: 0 },
  kneeR: { x: 0, y: 0 },
  hemL: { x: 0, y: 0 },
  hemR: { x: 0, y: 0 },
  hemCenter: { x: 0, y: 0 },
};

function makeEntry(overrides: Partial<DressEntry> = {}): DressEntry {
  return { ...createDefaultEntry('test-id', DEFAULT_ANCHORS), ...overrides };
}

function makePhotoBlob(): Blob {
  return new Blob(['fake-image-data'], { type: 'image/jpeg' });
}

function makeSuccessResponse(
  imageBase64 = 'abc123',
  mimeType = 'image/png',
  modelId = 'gemini-3-pro',
): Response {
  return new Response(JSON.stringify({ imageBase64, mimeType, modelId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeErrorResponse(status: number, code: string, detail?: string): Response {
  return new Response(JSON.stringify({ error: code, detail }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('generateDressImage', () => {
  it('successful response returns AIResult with correct fields', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeSuccessResponse('imgdata', 'image/png', 'model-xyz')));

    const entry = makeEntry();
    const result = await generateDressImage({ photoBlob: makePhotoBlob(), entry });

    expect(result.dataUrl).toBe('data:image/png;base64,imgdata');
    expect(result.modelId).toBe('model-xyz');
    expect(result.paramsHash).toBeTruthy();
    expect(result.prompt).toContain('WEDDING DRESS SPECIFICATION');
    expect(typeof result.generatedAt).toBe('number');
  });

  it('500 with API_KEY_NOT_CONFIGURED throws AIGenerationError with Korean message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeErrorResponse(500, 'API_KEY_NOT_CONFIGURED')));

    await expect(generateDressImage({ photoBlob: makePhotoBlob(), entry: makeEntry() })).rejects.toSatisfy(
      (e: unknown) => {
        const err = e as AIGenerationError;
        return (
          err instanceof AIGenerationError &&
          err.code === 'API_KEY_NOT_CONFIGURED' &&
          err.message.includes('API 키')
        );
      },
    );
  });

  it('413 with IMAGE_TOO_LARGE throws with Korean message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeErrorResponse(413, 'IMAGE_TOO_LARGE')));

    await expect(generateDressImage({ photoBlob: makePhotoBlob(), entry: makeEntry() })).rejects.toSatisfy(
      (e: unknown) => {
        const err = e as AIGenerationError;
        return (
          err instanceof AIGenerationError &&
          err.code === 'IMAGE_TOO_LARGE' &&
          err.message.includes('이미지')
        );
      },
    );
  });

  it('AbortSignal already aborted throws ABORTED quickly', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      generateDressImage({ photoBlob: makePhotoBlob(), entry: makeEntry(), signal: controller.signal }),
    ).rejects.toSatisfy((e: unknown) => {
      const err = e as AIGenerationError;
      return err instanceof AIGenerationError && err.code === 'ABORTED';
    });
  });

  it('network exception throws NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(generateDressImage({ photoBlob: makePhotoBlob(), entry: makeEntry() })).rejects.toSatisfy(
      (e: unknown) => {
        const err = e as AIGenerationError;
        return (
          err instanceof AIGenerationError &&
          err.code === 'NETWORK_ERROR' &&
          err.message.includes('네트워크')
        );
      },
    );
  });

  it('reference dress is included in POST body when entry.referenceDress is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeSuccessResponse());
    vi.stubGlobal('fetch', fetchMock);

    const entry = makeEntry({
      referenceDress: { dataUrl: 'data:image/jpeg;base64,refdata123', uploadedAt: 1000 },
    });

    await generateDressImage({ photoBlob: makePhotoBlob(), entry });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body.referenceDressBase64).toBe('refdata123');
    expect(body.referenceDressMimeType).toBe('image/jpeg');
  });

  it('reference dress is NOT in POST body when entry.referenceDress is null', async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeSuccessResponse());
    vi.stubGlobal('fetch', fetchMock);

    await generateDressImage({ photoBlob: makePhotoBlob(), entry: makeEntry({ referenceDress: null }) });

    const [, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(init.body) as Record<string, unknown>;
    expect(body.referenceDressBase64).toBeUndefined();
  });

  it('AIGenerationError has correct name property', () => {
    const err = new AIGenerationError('TEST', 'test message', 'detail');
    expect(err.name).toBe('AIGenerationError');
    expect(err.code).toBe('TEST');
    expect(err.detail).toBe('detail');
    expect(err instanceof Error).toBe(true);
  });

  it('unknown error code gets "알 수 없는 오류" message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeErrorResponse(500, 'SOME_UNKNOWN_CODE')));

    await expect(generateDressImage({ photoBlob: makePhotoBlob(), entry: makeEntry() })).rejects.toSatisfy(
      (e: unknown) => {
        const err = e as AIGenerationError;
        return err instanceof AIGenerationError && err.message === '알 수 없는 오류';
      },
    );
  });

  it('AbortError thrown by fetch is mapped to ABORTED', async () => {
    const abortErr = new DOMException('The operation was aborted.', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortErr));

    await expect(generateDressImage({ photoBlob: makePhotoBlob(), entry: makeEntry() })).rejects.toSatisfy(
      (e: unknown) => {
        const err = e as AIGenerationError;
        return err instanceof AIGenerationError && err.code === 'ABORTED';
      },
    );
  });
});
