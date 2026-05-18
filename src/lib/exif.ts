export interface OrientedImage {
  element: HTMLImageElement;
  width: number;
  height: number;
}

export async function loadImageWithCorrectOrientation(blob: Blob): Promise<OrientedImage> {
  if (typeof createImageBitmap === 'undefined') {
    // Fallback: jsdom / very old browsers — just reject with a clear message
    throw new Error('createImageBitmap is not supported in this environment');
  }

  const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  const { width, height } = bitmap;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const correctedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))));
  });

  const url = URL.createObjectURL(correctedBlob);
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = url;
  });

  URL.revokeObjectURL(url);
  return { element: img, width, height };
}
