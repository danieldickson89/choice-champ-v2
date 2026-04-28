/*
 * Generate apple-touch-startup-image PNGs sized for current iPhones
 * and iPads, in portrait. Each PNG matches the inline HTML splash
 * visually — same #312E2E background, same wheel logo at the same
 * effective CSS size — so iOS's native PWA launch screen flows into
 * our HTML splash without a perceptible image swap.
 *
 * Usage: node scripts/generate-splash-images.mjs
 *
 * Outputs:
 *   - PNGs to public/img/splash/<name>.png
 *   - A block of <link rel="apple-touch-startup-image"> tags to stdout
 *     (paste into index.html under <head>).
 */
import { Jimp } from 'jimp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'public', 'logo.png');
const OUT_DIR = join(__dirname, '..', 'public', 'img', 'splash');
const BG_HEX = 0x312E2EFF;
// Match the HTML splash so the moment iOS hands off to the WebView,
// the visible logo is the same size in CSS pixels.
const LOGO_CSS_SIZE = 120;

const DEVICES = [
    // iPhones (portrait), grouped by native pixel size + DPR
    { name: 'iphone-2868', w: 1320, h: 2868, dpr: 3 }, // 16 Pro Max
    { name: 'iphone-2796', w: 1290, h: 2796, dpr: 3 }, // 15 Pro Max / 15 Plus / 14 Pro Max
    { name: 'iphone-2778', w: 1284, h: 2778, dpr: 3 }, // 14 Plus / 13 Pro Max / 12 Pro Max
    { name: 'iphone-2622', w: 1206, h: 2622, dpr: 3 }, // 16 Pro
    { name: 'iphone-2556', w: 1179, h: 2556, dpr: 3 }, // 15/16 Pro / 15
    { name: 'iphone-2532', w: 1170, h: 2532, dpr: 3 }, // 14 / 13 / 12
    { name: 'iphone-2436', w: 1125, h: 2436, dpr: 3 }, // 13 mini / 12 mini / 11 Pro / XS / X
    { name: 'iphone-2688', w: 1242, h: 2688, dpr: 3 }, // 11 Pro Max / XS Max
    { name: 'iphone-2208', w: 1242, h: 2208, dpr: 3 }, // 8 Plus / 7 Plus / 6s Plus
    { name: 'iphone-1792', w: 828,  h: 1792, dpr: 2 }, // 11 / XR
    { name: 'iphone-1334', w: 750,  h: 1334, dpr: 2 }, // 8 / 7 / 6s / SE
    // iPads (portrait)
    { name: 'ipad-2752',   w: 2064, h: 2752, dpr: 2 }, // 13" iPad Pro M4
    { name: 'ipad-2732',   w: 2048, h: 2732, dpr: 2 }, // 12.9" iPad Pro
    { name: 'ipad-2420',   w: 1668, h: 2420, dpr: 2 }, // 11" iPad Pro M4
    { name: 'ipad-2388',   w: 1668, h: 2388, dpr: 2 }, // 11"/10.5" iPad Pro
    { name: 'ipad-2360',   w: 1640, h: 2360, dpr: 2 }, // 10.9" iPad Air
    { name: 'ipad-2224',   w: 1668, h: 2224, dpr: 2 }, // 10.5" iPad Air
    { name: 'ipad-2266',   w: 1488, h: 2266, dpr: 2 }, // 8.3" iPad Mini
    { name: 'ipad-2160',   w: 1620, h: 2160, dpr: 2 }, // 10.2" iPad
    { name: 'ipad-2048',   w: 1536, h: 2048, dpr: 2 }, // 9.7" iPad / iPad Air / iPad mini
];

await mkdir(OUT_DIR, { recursive: true });

const src = await Jimp.read(SRC);

// Trim to opaque bbox so any stray transparent margin in the source
// doesn't bias placement (same fix as center-icon.mjs).
let minX = src.bitmap.width, minY = src.bitmap.height, maxX = -1, maxY = -1;
src.scan(0, 0, src.bitmap.width, src.bitmap.height, (x, y, idx) => {
    const a = src.bitmap.data[idx + 3];
    if (a > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
});
const bboxW = maxX - minX + 1;
const bboxH = maxY - minY + 1;
const bboxSide = Math.max(bboxW, bboxH);
const trimmed = src.clone().crop({ x: minX, y: minY, w: bboxW, h: bboxH });

const linkTags = [];

for (const dev of DEVICES) {
    const logoPx = Math.round(LOGO_CSS_SIZE * dev.dpr);
    const scale = logoPx / bboxSide;
    const scaledW = Math.round(bboxW * scale);
    const scaledH = Math.round(bboxH * scale);
    const logo = trimmed.clone().resize({ w: scaledW, h: scaledH });

    const canvas = new Jimp({ width: dev.w, height: dev.h, color: BG_HEX });
    const px = Math.round((dev.w - scaledW) / 2);
    const py = Math.round((dev.h - scaledH) / 2);
    canvas.composite(logo, px, py);

    const outPath = join(OUT_DIR, `${dev.name}.png`);
    await canvas.write(outPath);
    console.log(`  ✓ ${dev.name}.png  ${dev.w}x${dev.h}  logo ${scaledW}x${scaledH}@(${px},${py})`);

    const cssW = Math.round(dev.w / dev.dpr);
    const cssH = Math.round(dev.h / dev.dpr);
    linkTags.push(
        `    <link rel="apple-touch-startup-image" media="screen and (device-width: ${cssW}px) and (device-height: ${cssH}px) and (-webkit-device-pixel-ratio: ${dev.dpr}) and (orientation: portrait)" href="/img/splash/${dev.name}.png">`
    );
}

console.log('\n--- Paste these <link> tags into index.html (under <head>): ---\n');
console.log(linkTags.join('\n'));
console.log('');
