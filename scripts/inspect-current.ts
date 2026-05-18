import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = 'tmp-design-inspect';
const BASE = process.env.APP_URL || 'http://localhost:5173';

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  // Desktop
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  console.log(`Loading ${BASE}/ ...`);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${OUT}/current-home-desktop.png`,
    fullPage: true,
  });
  console.log('✓ current-home-desktop.png');

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${OUT}/current-home-mobile.png`,
    fullPage: true,
  });
  console.log('✓ current-home-mobile.png');

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
