/*
 * Generate the Choice Champ wheel logo from scratch — five equal
 * 72° slices in the media-type colors, black outer ring, black slice
 * dividers, white hub, and a white pointer. Written so it produces a
 * pixel-perfect square PNG centered on the canvas, replacing the
 * old hand-drawn 4-color logo.
 *
 * Output: public/logo.png (1024×1024, transparent background, wheel
 * centered with a small margin to leave room for the pointer to
 * extend past the outer ring).
 *
 * After running, also rerun:
 *   node scripts/center-icon.mjs
 *   node scripts/generate-splash-images.mjs
 *
 * Slice color order (clockwise from 12 o'clock) preserves the old
 * logo's overall palette feel — yellow top-left, red top-right, with
 * purple inserted on the lower-left in the new fifth slot:
 *   1) TV       red    (#F04C53)
 *   2) Board    green  (#45B859)
 *   3) Game     blue   (#2482C5)
 *   4) Book     purple (#A855F7)   ← new
 *   5) Movie    yellow (#FCB016)
 */
import { Jimp } from 'jimp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'logo.png');

const SIZE = 1024;
const cx = SIZE / 2;
const cy = SIZE / 2;

// Wheel geometry (tuned for the 1024×1024 canvas). The outer-ring
// inset leaves room for the pointer to extend past 12 o'clock.
const R_OUTER     = 460;
const RING_WIDTH  = 22;
const DIVIDER_W   = 9;
const R_HUB       = 90;
const HUB_BORDER  = 6;

// Pointer (white teardrop pointing up, anchored at the hub).
// The original logo's pointer was a chunky teardrop, not a needle —
// these proportions match its visual weight.
const POINTER_TIP_Y     = cy - R_OUTER - 30;  // tip extends past outer ring
const POINTER_PIVOT_Y   = cy;                 // round base at center
const POINTER_PIVOT_R   = 60;                 // radius of bulbous base
const POINTER_HALF_WIDE = 60;                 // half-width at the widest point
const POINTER_OUTLINE   = 7;                  // black outline thickness

// 32-bit RGBA hex (Jimp). Match src/shared/lib/mediaTypes.js exactly.
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

const canvas = new Jimp({ width: SIZE, height: SIZE, color: TRANSPARENT });

// Single pixel-walk for the wheel body: outer ring, colored slices,
// dividers, and hub. atan2 returns -π..π with +x = 3 o'clock; rotate
// by +π/2 so 0 sits at 12 o'clock and angles increase clockwise.
canvas.scan(0, 0, SIZE, SIZE, function (x, y) {
    const dx = x - cx;
    const dy = y - cy;
    const r = Math.sqrt(dx * dx + dy * dy);

    if (r > R_OUTER) return; // outside wheel — leave transparent

    // Outer black ring.
    if (r > R_OUTER - RING_WIDTH) {
        this.setPixelColor(BLACK, x, y);
        return;
    }

    // Hub region.
    if (r <= R_HUB) {
        if (r > R_HUB - HUB_BORDER) {
            this.setPixelColor(BLACK, x, y);
        } else {
            this.setPixelColor(WHITE, x, y);
        }
        return;
    }

    // Colored slice region.
    let theta = Math.atan2(dy, dx) + Math.PI / 2;
    if (theta < 0) theta += 2 * Math.PI;
    if (theta >= 2 * Math.PI) theta -= 2 * Math.PI;

    // Black radial divider when within half a divider's arc length of
    // a slice boundary. Arc length = r * Δθ, so Δθ_max = halfW / r —
    // narrower at the rim, gracefully widening near the hub.
    const inSliceTheta = theta % SLICE_RAD;
    const distFromBoundary = Math.min(inSliceTheta, SLICE_RAD - inSliceTheta);
    if (distFromBoundary * r < DIVIDER_W / 2) {
        this.setPixelColor(BLACK, x, y);
        return;
    }

    const sliceIdx = Math.floor(theta / SLICE_RAD);
    this.setPixelColor(COLOR[SLICE_ORDER[sliceIdx]], x, y);
});

// Pointer — black outline first, white interior on top. The shape is
// a teardrop drawn as (a) a triangle from the tip down to the hub's
// horizontal centerline + (b) a circle at the hub centerline that
// rounds the base into a bulb.
function paintPointer(color, sizeBoost) {
    // Triangle tip → base. Linear width: 0 at tip, ±halfWide at pivot.
    const tipY = POINTER_TIP_Y - sizeBoost;
    const baseY = POINTER_PIVOT_Y;
    const halfWide = POINTER_HALF_WIDE + sizeBoost;
    for (let y = tipY; y <= baseY; y++) {
        const t = (y - tipY) / (baseY - tipY); // 0 at tip → 1 at base
        const halfW = halfWide * t;
        const xL = Math.round(cx - halfW);
        const xR = Math.round(cx + halfW);
        for (let x = xL; x <= xR; x++) {
            if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
                canvas.setPixelColor(color, x, y);
            }
        }
    }
    // Bulbous bottom — circle centered at the pivot.
    const pivotR = POINTER_PIVOT_R + sizeBoost;
    for (let y = POINTER_PIVOT_Y - pivotR; y <= POINTER_PIVOT_Y + pivotR; y++) {
        for (let x = cx - pivotR; x <= cx + pivotR; x++) {
            const dx = x - cx;
            const dy = y - POINTER_PIVOT_Y;
            if (dx * dx + dy * dy <= pivotR * pivotR) {
                if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
                    canvas.setPixelColor(color, x, y);
                }
            }
        }
    }
}

paintPointer(BLACK, POINTER_OUTLINE);  // outline (slightly bigger)
paintPointer(WHITE, 0);                // white fill on top

await canvas.write(OUT);
console.log(`wrote ${OUT} (${SIZE}×${SIZE})`);
