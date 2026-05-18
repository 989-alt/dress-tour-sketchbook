import type { AppMeta, DressEntry, PoseLandmarks } from '../types';

export interface ExportBundle {
  version: 1;
  exportedAt: number;
  meta: {
    poseLandmarks: PoseLandmarks | null;
    createdAt: number;
    basePhotoDataUrl: string | null;
  };
  entries: DressEntry[];
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function exportAllToJson(meta: AppMeta | null, entries: DressEntry[]): Promise<string> {
  const basePhotoDataUrl = meta?.basePhoto ? await blobToDataUrl(meta.basePhoto) : null;

  const bundle: ExportBundle = {
    version: 1,
    exportedAt: Date.now(),
    meta: {
      poseLandmarks: meta?.poseLandmarks ?? null,
      createdAt: meta?.createdAt ?? Date.now(),
      basePhotoDataUrl,
    },
    entries,
  };

  return JSON.stringify(bundle, null, 2);
}

export async function downloadJsonFile(json: string, filename?: string): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const name = filename ?? `dress-tour-${date}.json`;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromJson(jsonText: string): Promise<{ meta: AppMeta | null; entries: DressEntry[] }> {
  let bundle: unknown;
  try {
    bundle = JSON.parse(jsonText);
  } catch {
    throw { message: '유효하지 않은 JSON 파일입니다.' };
  }

  if (
    typeof bundle !== 'object' ||
    bundle === null ||
    (bundle as ExportBundle).version !== 1
  ) {
    throw { message: '지원하지 않는 파일 형식입니다 (version != 1).' };
  }

  const b = bundle as ExportBundle;

  if (!Array.isArray(b.entries)) {
    throw { message: '파일에 entries 필드가 없습니다.' };
  }

  let basePhoto: Blob | null = null;
  if (b.meta?.basePhotoDataUrl) {
    try {
      basePhoto = await fetch(b.meta.basePhotoDataUrl).then((r) => r.blob());
    } catch {
      basePhoto = null;
    }
  }

  const meta: AppMeta | null =
    b.meta
      ? {
          basePhoto,
          poseLandmarks: b.meta.poseLandmarks ?? null,
          createdAt: b.meta.createdAt ?? Date.now(),
        }
      : null;

  return { meta, entries: b.entries };
}
