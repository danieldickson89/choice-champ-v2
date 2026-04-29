/*
 * One-off: redraw the wheel inside public/img/Logo/choice-champ-title.png
 * with the new 5-slice palette, leaving the surrounding "CHOICE" and
 * "CHAMP" text alone.
 *
 * The wheel sits at center (1446, 188) in the source image with an
 * outer radius of ~188px including the black rim. We clear that
 * circle to transparent and re-paint the wheel using the same
 * geometry rules as scripts/generate-logo.mjs.
 */
import { Jimp } from 'jimp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, '..', 'public', 'img', 'Logo', 'choice-champ-title.png');

const img = await Jimp.read(PATH);

// Wheel center + radius detected from the source image. Adjust if the
// title image dimensions ever change.
const cx = 1446;
const cy = 188;
const R_OUTER = 178;

// Geometry — proportional to R_OUTER so it scales with the wheel.
// Tuned to match the visual weight of scripts/generate-logo.mjs at
// this smaller wheel size (the standalone logo has R_OUTER=460).
const RING_WIDTH  = Math.round(R_OUTER * 0.048); // ~9px
const DIVIDER_W   = Math.round(R_OUTER * 0.020); // ~4px
const R_HUB       = Math.round(R_OUTER * 0.196); // ~35px
const HUB_BORDER  = Math.round(R_OUTER * 0.013); // ~2px

const POINTER_TIP_Y     = cy - R_OUTER - Math.round(R_OUTER * 0.065); // ~12px past rim
const POINTER_PIVOT_Y   = cy;
const POINTER_PIVOT_R   = Math.round(R_OUTER * 0.13);  // ~23px
const POINTER_HALF_WIDE = Math.round(R_OUTER * 0.13);  // ~23px
const POINTER_OUTLINE   = Math.max(2, Math.round(R_OUTER * 0.015));

const COLOR = {
    tv:    0xF04C53FF,
    board: 0x45B859FF,
    game:  0x2482C5FF,
    book:  0xA855F7FF,
    movie: 0xFCB016FF,
};
const SLICE_ORDER = ['tv', 'board', 'game', 'book', 'movie'];
const BLACK = 0x000000FF;
const WHITE = 0xFFFFFFFF;
const TRANSPARENT = 0x00000000;
const SLICE_RAD = (2 * Math.PI) / 5;

const W = img.bitmap.width;
const H = img.bitmap.height;

// First pass: clear the old wheel (anything within R_OUTER + small
// margin of the wheel center, including the pointer tip area above).
const clearMargin = Math.round(R_OUTER * 0.1);
img.scan(0, 0, W, H, function (x, y) {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r <= R_OUTER + clearMargin) {
        this.setPixelColor(TRANSPARENT, x, y);
    }
});

// Second pass: draw the new wheel body.
img.scan(0, 0, W, H, function (x, y) {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r > R_OUTER) return;

    if (r > R_OUTER - RING_WIDTH) {
        this.setPixelColor(BLACK, x, y);
        return;
    }
    if (r <= R_HUB) {
        if (r > R_HUB - HUB_BORDER) {
            this.setPixelColor(BLACK, x, y);
        } else {
            this.setPixelColor(WHITE, x, y);
        }
        return;
    }
    let theta = Math.atan2(dy, dx) + Math.PI / 2;
    if (theta < 0) theta += 2 * Math.PI;
    if (theta >= 2 * Math.PI) theta -= 2 * Math.PI;
    const inSlice = theta % SLICE_RAD;
    const distFromBoundary = Math.min(inSlice, SLICE_RAD - inSlice);
    if (distFromBoundary * r < DIVIDER_W / 2) {
        this.setPixelColor(BLACK, x, y);
        return;
    }
    const sliceIdx = Math.floor(theta / SLICE_RAD);
    this.setPixelColor(COLOR[SLICE_ORDER[sliceIdx]], x, y);
});

// Pointer (black outline + white teardrop on top).
function paintPointer(color, sizeBoost) {
    const tipY = POINTER_TIP_Y - sizeBoost;
    const baseY = POINTER_PIVOT_Y;
    const halfWide = POINTER_HALF_WIDE + sizeBoost;
    for (let y = tipY; y <= baseY; y++) {
        const t = (y - tipY) / (baseY - tipY);
        const halfW = halfWide * t;
        const xL = Math.round(cx - halfW);
        const xR = Math.round(cx + halfW);
        for (let x = xL; x <= xR; x++) {
            if (x >= 0 && x < W && y >= 0 && y < H) img.setPixelColor(color, x, y);
        }
    }
    const pivotR = POINTER_PIVOT_R + sizeBoost;
    for (let y = POINTER_PIVOT_Y - pivotR; y <= POINTER_PIVOT_Y + pivotR; y++) {
        for (let x = cx - pivotR; x <= cx + pivotR; x++) {
            const dx = x - cx;
            const dy = y - POINTER_PIVOT_Y;
            if (dx * dx + dy * dy <= pivotR * pivotR) {
                if (x >= 0 && x < W && y >= 0 && y < H) img.setPixelColor(color, x, y);
            }
        }
    }
}

paintPointer(BLACK, POINTER_OUTLINE);
paintPointer(WHITE, 0);

await img.write(PATH);
console.log(`updated ${PATH}`);
