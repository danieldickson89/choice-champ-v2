import React from 'react';

// Lucide's PartyPopper geometry, restroked one piece at a time so the
// icon carries all five media-type colors at once. Same paths as the
// upstream icon so it stays visually familiar — only the per-path
// stroke color changes.
//
// Color mapping is intentional, not arbitrary: the popper cone (the
// largest, most central piece) gets purple to anchor Books in the
// FAB. The streaming trail gets yellow (Movies), and the three curved
// confetti strings + four corner dots distribute red / green / blue
// so each color appears at least once and is roughly balanced.
const PATHS = [
    // Streaming trail leaving the popper.
    { d: 'M5.8 11.3 2 22l10.7-3.79', color: '#FCB016' }, // movie yellow
    // Four single-point confetti dots.
    { d: 'M4 3h.01',  color: '#F04C53' }, // tv red
    { d: 'M22 8h.01', color: '#45B859' }, // board green
    { d: 'M15 2h.01', color: '#2482C5' }, // game blue
    { d: 'M22 20h.01', color: '#A855F7' }, // book purple
    // Three curved confetti streamers.
    { d: 'm22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10', color: '#FCB016' },
    { d: 'm22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17', color: '#45B859' },
    { d: 'm11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7', color: '#2482C5' },
    // The popper cone itself — biggest single piece.
    { d: 'M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z', color: '#A855F7' },
];

const PartyPopperWheel = ({ size = 32, strokeWidth = 1.75 }) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
    >
        {PATHS.map((p, i) => (
            <path key={i} d={p.d} stroke={p.color} />
        ))}
    </svg>
);

export default PartyPopperWheel;
