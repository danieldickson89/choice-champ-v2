import React from 'react';

// Racing-style checkered flag — drops in for the spinning end-of-vote
// overlay where lucide's plain Flag was reading as too generic for
// "voting just finished." Uses lucide's Flag geometry as the outline
// + flagpole so the silhouette stays familiar, with a 2-color
// checkerboard pattern clipped to the flag shape itself.
const CheckeredFlag = ({ size = 24, strokeWidth = 2, className }) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
        className={className}
        aria-hidden='true'
    >
        <defs>
            {/* 2-square × ~2-square checker — bold enough to read while
                spinning, fine enough that you still get four+ columns
                across the flag width. */}
            <pattern id='cc-checker' width='4' height='4' patternUnits='userSpaceOnUse'>
                <rect width='2' height='2' fill='currentColor' />
                <rect x='2' y='2' width='2' height='2' fill='currentColor' />
            </pattern>
            <clipPath id='cc-flag-clip'>
                <path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' />
            </clipPath>
        </defs>
        {/* Pole */}
        <line x1='4' y1='22' x2='4' y2='15' />
        {/* Checkered fill, clipped to the flag shape */}
        <rect x='3' y='2' width='18' height='14' fill='url(#cc-checker)' clipPath='url(#cc-flag-clip)' stroke='none' />
        {/* Flag outline drawn over the pattern */}
        <path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' />
    </svg>
);

export default CheckeredFlag;
