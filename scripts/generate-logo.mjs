/*
 * Generate the Choice Champ wheel logo from scratch — five equal
 * 72° slices in the media-type colors, black outer ring, black slice
 * dividers, white hub, and a white pointer.
 *
 * Outputs three PNGs (all 1024×1024, transparent background, wheel
 * centered):
 *   public/logo.png    — combined wheel + pointer + hub. Used by
 *                        favicon + the splash-image generator. Single
 *                        canonical logo for everything that needs a
 *                        static composite.
 *   public/wheel.png   — slices + outer ring + dividers ONLY. No hub,
 *                        no pointer. Sits as the rotating layer in
 *                        the inline HTML splash.
 *   public/pointer.png — hub + pointer ONLY. Transparent everywhere
 *                        else. Stays still in the HTML splash so it
 *                        looks like the wheel spins underneath a
 *                        fixed pivot, the way a real wheel-of-fortune
 *                        works.
 *
 * After running, also rerun:
 *   node scripts/center-icon.mjs           (uses logo.png)
 *   node scripts/generate-splash-images.mjs (uses logo.png)
 *
 * Slice color order (clockwise from 12 o'clock) preserves the old
 * logo's overall palette feel — yellow top-left, red top-right, with
 * purple inserted on the lower-left in the new fifth slot.
 */
import { Jimp } from 'jimp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_LOGO    = join(__dirname, '..', 'public', 'logo.png');
const OUT_WHEEL   = join(__dirname, '..', 'public', 'wheel.png');
const OUT_POINTER = join(__dirname, '..', 'public', 'pointer.png');

const SIZE = 1024;
const cx = SIZE / 2;
const cy = SIZE / 2;

const R_OUTER     = 460;
const RING_WIDTH  = 22;
const DIVIDER_W   = 9;
const R_HUB       = 90;
const HUB_BORDER  = 6;

const POINTER_ANGLE_DEG = 8;
const POINTER_LENGTH    = R_OUTER - 60;
const POINTER_TIP_R     = 2;
const POINTER_PIVOT_R   = 80;
const POINTER_OUTLINE   = 8;

const COLOR = {
    tv:    0xF04C53FF,
    board: 0x45B859FF,
    game:  0x2482C5FF,
    book:  0xA855F7FF,
    movie: 0xFCB016FF,
};
const SLICE_ORDER = ['tv', 'board', 'game', 'book', 'movie'];

const BLACK       = 0x000000FF;
const WHITE       = 0xFFFFFFFF;
const TRANSPARENT = 0x00000000;
const SLICE_RAD   = (2 * Math.PI) / 5;

// ─── Drawing helpers (write into a target Jimp canvas) ──────────────

// Paint the colored slices + outer ring + radial dividers.
// `target` is the Jimp instance to draw into.
function drawSlices(target) {
    target.scan(0, 0, SIZE, SIZE, function (x, y) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);

        if (r > R_OUTER) return;
        if (r > R_OUTER - RING_WIDTH) { this.setPixelColor(BLACK, x, y); return; }
        // Don't fill the hub disc here — that's the pointer layer's
        // job (or the combined-logo overlap pass).
        if (r <= R_HUB) return;

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
}

// Paint the white hub disc with its black border.
function drawHub(target) {
    target.scan(0, 0, SIZE, SIZE, function (x, y) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r > R_HUB) return;
        if (r > R_HUB - HUB_BORDER) this.setPixelColor(BLACK, x, y);
        else                         this.setPixelColor(WHITE, x, y);
    });
}

// Paint the pointer (black outline pass + white fill pass) onto the
// target canvas. Geometry: a tapered band between two circles, tilted
// 8° clockwise from vertical; tip rounded, pivot bulbous.
function drawPointer(target) {
    const angleRad = (POINTER_ANGLE_DEG * Math.PI) / 180;
    const axisDX = Math.sin(angleRad);
    const axisDY = -Math.cos(angleRad);
    const tipCx = cx + POINTER_LENGTH * axisDX;
    const tipCy = cy + POINTER_LENGTH * axisDY;

    const paint = (color, sizeBoost) => {
        const tipR = POINTER_TIP_R + sizeBoost;
        const pivotR = POINTER_PIVOT_R + sizeBoost;
        const slack = pivotR + 2;
        const minX = Math.floor(Math.min(cx, tipCx) - slack);
        const maxX = Math.ceil(Math.max(cx, tipCx) + slack);
        const minY = Math.floor(Math.min(cy, tipCy) - slack);
        const maxY = Math.ceil(Math.max(cy, tipCy) + slack);
        for (let y = minY; y <= maxY; y++) {
            if (y < 0 || y >= SIZE) continue;
            for (let x = minX; x <= maxX; x++) {
                if (x < 0 || x >= SIZE) continue;
                const dx = x - cx, dy = y - cy;
                const along = dx * axisDX + dy * axisDY;
                const perpX = dx - along * axisDX;
                const perpY = dy - along * axisDY;
                const perpDist = Math.sqrt(perpX * perpX + perpY * perpY);
                const distToTip = Math.sqrt((x - tipCx) ** 2 + (y - tipCy) ** 2);
                if (distToTip <= tipR) { target.setPixelColor(color, x, y); continue; }
                const distToPivot = Math.sqrt(dx * dx + dy * dy);
                if (distToPivot <= pivotR) { target.setPixelColor(color, x, y); continue; }
                if (along < 0 || along > POINTER_LENGTH) continue;
                const t = along / POINTER_LENGTH;
                const widthHere = pivotR + (tipR - pivotR) * t;
                if (perpDist <= widthHere) target.setPixelColor(color, x, y);
            }
        }
    };

    paint(BLACK, POINTER_OUTLINE);
    paint(WHITE, 0);
}

// ─── Generate the three artifacts ──────────────────────────────────

// Combined logo (favicon + splash-image source).
const logo = new Jimp({ width: SIZE, height: SIZE, color: TRANSPARENT });
drawSlices(logo);
drawHub(logo);
drawPointer(logo);
await logo.write(OUT_LOGO);
console.log(`wrote ${OUT_LOGO}`);

// Wheel only — slices + ring + dividers, no hub, no pointer.
// This is the layer that rotates in the HTML splash.
const wheel = new Jimp({ width: SIZE, height: SIZE, color: TRANSPARENT });
drawSlices(wheel);
await wheel.write(OUT_WHEEL);
console.log(`wrote ${OUT_WHEEL}`);

// Pointer only — hub + pointer, transparent elsewhere.
// This is the static layer in the HTML splash.
const pointer = new Jimp({ width: SIZE, height: SIZE, color: TRANSPARENT });
drawHub(pointer);
drawPointer(pointer);
await pointer.write(OUT_POINTER);
console.log(`wrote ${OUT_POINTER}`);
