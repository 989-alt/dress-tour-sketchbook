#!/usr/bin/env tsx
/**
 * Compress preview images in-place: resize to max 600px on the long edge,
 * convert to WebP at 80% quality. Typically reduces ~1.4 MB PNG → ~30-60 KB.
 *
 * Usage: npm run compress-previews
 */
import { readdir, readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = 'public/previews';
const MAX_DIM = 600;
const QUALITY = 80;

interface Stat {
  path: string;
  before: number;
  after: number;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(p)));
    } else if (/\.(png|jpe?g|webp)$/i.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

async function main(): Promise<void> {
  const files = await walk(ROOT);
  console.log(`Found ${files.length} images. Compressing...`);
  const stats: Stat[] = [];
  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    const before = (await stat(src)).size;
    const buf = await readFile(src);
    const webp = await sharp(buf)
      .resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    const dst = src.replace(/\.(png|jpe?g|webp)$/i, '.webp');
    await writeFile(dst, webp);
    if (dst !== src) await unlink(src);
    stats.push({ path: dst, before, after: webp.length });
    const pct = ((1 - webp.length / before) * 100).toFixed(1);
    console.log(
      `[${i + 1}/${files.length}] ${dst.replace(/^public\/previews\//, '')}: ${(before / 1024).toFixed(0)} KB → ${(webp.length / 1024).toFixed(0)} KB (-${pct}%)`,
    );
  }
  const totalBefore = stats.reduce((s, x) => s + x.before, 0);
  const totalAfter = stats.reduce((s, x) => s + x.after, 0);
  console.log(
    `\nDone. Total: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB (-${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
