import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';

const OUT = 'tmp-design-inspect';

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  console.log('Loading reference...');
  await page.goto('https://movie-worksheet.vercel.app/', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: `${OUT}/ref-desktop.png`,
    fullPage: true,
  });
  console.log('✓ ref-desktop.png');

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${OUT}/ref-mobile.png`,
    fullPage: true,
  });
  console.log('✓ ref-mobile.png');

  // Extract design tokens
  const tokens = await page.evaluate(() => {
    const body = document.body;
    const bodyStyle = getComputedStyle(body);
    const root = document.documentElement;

    const sample = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        tag: el.tagName,
        text: (el.textContent || '').slice(0, 80),
        color: s.color,
        background: s.backgroundColor,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
        padding: s.padding,
        borderRadius: s.borderRadius,
        border: s.border,
        boxShadow: s.boxShadow,
      };
    };

    const all = Array.from(document.querySelectorAll('*'));
    const bgs = new Map<string, number>();
    const colors = new Map<string, number>();
    const fonts = new Map<string, number>();
    for (const el of all) {
      const s = getComputedStyle(el);
      if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        bgs.set(s.backgroundColor, (bgs.get(s.backgroundColor) ?? 0) + 1);
      }
      colors.set(s.color, (colors.get(s.color) ?? 0) + 1);
      fonts.set(s.fontFamily, (fonts.get(s.fontFamily) ?? 0) + 1);
    }

    const topN = (m: Map<string, number>, n: number) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

    return {
      bodyBg: bodyStyle.backgroundColor,
      bodyColor: bodyStyle.color,
      bodyFont: bodyStyle.fontFamily,
      rootCssVars: Array.from(root.style).filter((p) => p.startsWith('--')),
      h1: sample('h1'),
      button: sample('button'),
      card: sample('.card, [class*="card"]'),
      input: sample('input, textarea'),
      topBackgrounds: topN(bgs, 8),
      topColors: topN(colors, 8),
      topFonts: topN(fonts, 5),
      title: document.title,
    };
  });

  await writeFile(`${OUT}/ref-tokens.json`, JSON.stringify(tokens, null, 2));
  console.log('✓ ref-tokens.json');

  await browser.close();
  console.log('\nDone. Inspect tmp-design-inspect/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
