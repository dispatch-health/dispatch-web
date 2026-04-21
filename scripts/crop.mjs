#!/usr/bin/env node
// Crop a PNG from the top. Usage: node scripts/crop.mjs <input> <output> <height> [top-offset]
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const [, , input, output, heightStr, topStr = '0'] = process.argv;
const h = parseInt(heightStr, 10);
const top = parseInt(topStr, 10);
const src = PNG.sync.read(readFileSync(input));
const cropHeight = Math.min(h, src.height - top);
const dst = new PNG({ width: src.width, height: cropHeight });
for (let y = 0; y < cropHeight; y++) {
  for (let x = 0; x < src.width; x++) {
    const sIdx = ((top + y) * src.width + x) * 4;
    const dIdx = (y * src.width + x) * 4;
    dst.data[dIdx] = src.data[sIdx];
    dst.data[dIdx + 1] = src.data[sIdx + 1];
    dst.data[dIdx + 2] = src.data[sIdx + 2];
    dst.data[dIdx + 3] = src.data[sIdx + 3];
  }
}
writeFileSync(output, PNG.sync.write(dst));
console.log(`${output} (${src.width}x${cropHeight})`);
