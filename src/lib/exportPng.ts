import type { DressEntry } from '../types';

const CARD_W = 240;
const CARD_H = 400;
const CAPTION_H = 30;
const COLS = 3;

/**
 * Render each entry as a small card on an offscreen canvas grid.
 * NOTE: Requires a real browser environment. Throws in jsdom.
 */
export async function exportSummaryGridToPng(
  entries: DressEntry[],
  photo: Blob | null,
  photoWidth: number,
  photoHeight: number,
): Promise<Blob> {
  void photo;
  void photoWidth;
  void photoHeight;
  if (typeof document === 'undefined') {
    throw new Error('PNG export requires a browser environment.');
  }

  const rows = Math.ceil(entries.length / COLS);
  const canvasW = COLS * CARD_W;
  const canvasH = rows * (CARD_H + CAPTION_H);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('PNG export requires a browser environment.');

  // Import compose lazily to avoid bringing SVG rendering deps into test scope
  const { composeDress } = await import('./compose');
  const { renderToStaticMarkup } = await import('react-dom/server');

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * CARD_W;
    const y = row * (CARD_H + CAPTION_H);

    // Draw white card background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, CARD_W, CARD_H + CAPTION_H);

    // Render SVG for this entry
    const svgEl = composeDress(entry, entry.anchors, {
      photoWidth: CARD_W,
      photoHeight: CARD_H,
      idPrefix: `export-${i}-`,
    });

    const svgMarkup = renderToStaticMarkup(svgEl);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgMarkup)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, x, y, CARD_W, CARD_H);
        resolve();
      };
      img.onerror = () => reject(new Error(`Failed to render entry ${i}`));
      img.src = dataUrl;
    });

    // Caption
    ctx.fillStyle = '#374151';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(entry.nickname || '이름 없음', x + CARD_W / 2, y + CARD_H + 20, CARD_W - 8);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
      'image/png',
    );
  });
}

export async function downloadPngBlob(blob: Blob, filename?: string): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const name = filename ?? `dress-tour-summary-${date}.png`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
