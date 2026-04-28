/*
 * One-off: rewrite public/logo.png so the visible wheel+needle bbox
 * is centered inside a square canvas with equal transparent padding
 * on every side. Keeps logo.png a square the same nominal size as
 * before but removes the asymmetric transparent margin (7 stray
 * transparent pixels on the left, none on the right) that was
 * making the HTML splash center 1px off from the bbox-trimming
 * splash-image generator.
 *
 * After running, also rerun:
 *   - node scripts/center-icon.mjs
 *   - node scripts/generate-splash-images.mjs
 */
import { Jimp } from 'jimp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, '..', 'public', 'logo.png');

const src = await Jimp.read(PATH);

let minX = src.bitmap.width, minY = src.bitmap.height, maxX = -1, maxY = -1;
src.scan(0, 0, src.bitmap.width, src.bitmap.height, (x, y, idx) => {
    if (src.bitmap.data[idx + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
});

const bboxW = maxX - minX + 1;
const bboxH = maxY - minY + 1;
const side = Math.max(bboxW, bboxH);
console.log(`bbox ${bboxW}x${bboxH}, target ${side}x${side}`);

const cropped = src.clone().crop({ x: minX, y: minY, w: bboxW, h: bboxH });
// Transparent square canvas; bbox centered with equal margin all sides.
const canvas = new Jimp({ width: side, height: side, color: 0x00000000 });
canvas.composite(cropped, Math.round((side - bboxW) / 2), Math.round((side - bboxH) / 2));
await canvas.write(PATH);
console.log(`wrote ${PATH} (${side}x${side}, bbox centered)`);
