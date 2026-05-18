import type { DressEntry, AIResult } from '../types';
import { buildPrompt } from './promptBuilder';
import { paramsHash } from './paramsHash';

export interface GenerateOptions {
  photoBlob: Blob;
  entry: DressEntry;
  extraInstructions?: string;
  signal?: AbortSignal;
}

export class AIGenerationError extends Error {
  constructor(
    public code: string,
    message: string,
    public detail?: string,
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  API_KEY_NOT_CONFIGURED: '서버에 API 키가 설정되지 않았습니다. 관리자에게 문의하세요.',
  UPSTREAM_ERROR: 'AI 서비스 호출 실패. 잠시 후 다시 시도해 주세요.',
  IMAGE_TOO_LARGE: '이미지 크기가 너무 큽니다. 좀 더 작은 사진을 사용해 주세요.',
  NO_IMAGE_IN_RESPONSE: 'AI가 이미지를 반환하지 않았습니다. 프롬프트를 조정해 다시 시도해 주세요.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  ABORTED: '취소되었습니다.',
};

function koreanMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? '알 수 없는 오류';
}

async function blobToBase64(blob: Blob): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const { base64, mimeType } = parseDataUrl(dataUrl);
      resolve({ base64, mimeType });
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

function parseDataUrl(dataUrl: string): { base64: string; mimeType: string } {
  const comma = dataUrl.indexOf(',');
  const meta = dataUrl.slice(5, comma); // strip 'data:'
  const mimeType = meta.split(';')[0];
  const base64 = dataUrl.slice(comma + 1);
  return { base64, mimeType };
}

export async function generateDressImage(opts: GenerateOptions): Promise<AIResult> {
  const { photoBlob, entry, extraInstructions, signal } = opts;

  if (signal?.aborted) {
    throw new AIGenerationError('ABORTED', koreanMessage('ABORTED'));
  }

  const { base64: photoBase64, mimeType: photoMimeType } = await blobToBase64(photoBlob);

  let referenceDressBase64: string | undefined;
  let referenceDressMimeType: string | undefined;
  if (entry.referenceDress) {
    const parsed = parseDataUrl(entry.referenceDress.dataUrl);
    referenceDressBase64 = parsed.base64;
    referenceDressMimeType = parsed.mimeType;
  }

  const prompt = buildPrompt(entry, {
    hasReferenceDress: !!entry.referenceDress,
    extraInstructions,
  });

  const body: Record<string, string> = {
    photoBase64,
    photoMimeType,
    prompt,
  };
  if (referenceDressBase64 && referenceDressMimeType) {
    body.referenceDressBase64 = referenceDressBase64;
    body.referenceDressMimeType = referenceDressMimeType;
  }

  let response: Response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIGenerationError('ABORTED', koreanMessage('ABORTED'));
    }
    const detail = err instanceof Error ? err.message : String(err);
    throw new AIGenerationError('NETWORK_ERROR', koreanMessage('NETWORK_ERROR'), detail);
  }

  if (!response.ok) {
    let code = 'UNKNOWN';
    let detail: string | undefined;
    try {
      const json = (await response.json()) as { error?: string; detail?: string };
      if (json.error) code = json.error;
      detail = json.detail;
    } catch {
      // ignore JSON parse failure
    }
    throw new AIGenerationError(code, koreanMessage(code), detail);
  }

  const json = (await response.json()) as {
    imageBase64: string;
    mimeType: string;
    modelId: string;
  };

  const dataUrl = `data:${json.mimeType};base64,${json.imageBase64}`;

  return {
    dataUrl,
    generatedAt: Date.now(),
    modelId: json.modelId,
    paramsHash: paramsHash(entry),
    prompt,
  };
}
