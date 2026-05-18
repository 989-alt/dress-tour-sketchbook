import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = 'tmp-design-inspect';
const BASE = process.env.APP_URL || 'http://localhost:5173';

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // Seed IndexedDB with mock data so /new and /summary work
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    // Create a fake photo Blob and put it in the store via the exposed app store
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#E8DCD0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#888';
    ctx.font = '40px sans-serif';
    ctx.fillText('demo bride', 280, 600);
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png')!);

    // Open IDB and write meta directly
    const req = indexedDB.open('dress-tour-sketchbook', 1);
    await new Promise<void>((resolve, reject) => {
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
        if (!db.objectStoreNames.contains('entries')) {
          const s = db.createObjectStore('entries', { keyPath: 'id' });
          s.createIndex('by-createdAt', 'createdAt');
        }
      };
    });
    const db = req.result;
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put({ basePhoto: blob, poseLandmarks: null, createdAt: Date.now() }, 'singleton');
    await new Promise<void>((res) => { tx.oncomplete = () => res(); });
  });

  // ---- Home ----
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/home-desktop.png`, fullPage: true });
  console.log('✓ home-desktop.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/home-mobile.png`, fullPage: true });
  console.log('✓ home-mobile.png');

  // ---- Edit ----
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/new`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/edit-desktop.png`, fullPage: true });
  console.log('✓ edit-desktop.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/edit-mobile.png`, fullPage: true });
  console.log('✓ edit-mobile.png');

  // ---- Summary ----
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/summary`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/summary-desktop.png`, fullPage: true });
  console.log('✓ summary-desktop.png');

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
