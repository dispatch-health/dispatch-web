#!/usr/bin/env node
/**
 * Pixel-diff matched crops of live vs local screenshots.
 * Crops both to the smaller common height, then runs pixelmatch.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const PAGES = ['home', 'about', 'contact', 'contact_thanks', 'privacy'];
const WIDTHS = [1440, 390];
const OUT_DIR = '/tmp/dispatch-compare/diffs';
mkdirSync(OUT_DIR, { recursive: true });

const cropTop = (png, h) => {
  const dst = new PNG({ width: png.width, height: h });
  const bytes = png.width * h * 4;
  png.data.copy(dst.data, 0, 0, bytes);
  return dst;
};

console.log('Page\t\tWidth\tDiff %\tLive H\tLocal H');
for (const page of PAGES) {
  for (const w of WIDTHS) {
    const livePath = `/tmp/dispatch-compare/live/${page}_${w}.png`;
    const localPath = `/tmp/dispatch-compare/local/${page}_${w}.png`;
    const live = PNG.sync.read(readFileSync(livePath));
    const local = PNG.sync.read(readFileSync(localPath));
    const minH = Math.min(live.height, local.height);
    const liveCrop = cropTop(live, minH);
    const localCrop = cropTop(local, minH);
    const diff = new PNG({ width: live.width, height: minH });
    const mismatches = pixelmatch(
      liveCrop.data, localCrop.data, diff.data,
      live.width, minH,
      { threshold: 0.25 }
    );
    const total = live.width * minH;
    const pct = (mismatches / total) * 100;
    writeFileSync(`${OUT_DIR}/${page}_${w}.png`, PNG.sync.write(diff));
    console.log(`${page.padEnd(16)}\t${w}\t${pct.toFixed(2)}%\t${live.height}\t${local.height}`);
  }
}
