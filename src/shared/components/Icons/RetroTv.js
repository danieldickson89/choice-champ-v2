import React from 'react';

const RetroTv = ({ size = 24, strokeWidth = 2, className, style }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        style={style}
        aria-hidden="true"
    >
        <line x1="9" y1="8" x2="5" y2="4" />
        <line x1="15" y1="8" x2="19" y2="4" />
        <rect x="3" y="8" width="18" height="12" rx="2" ry="2" />
        <rect x="5" y="10" width="10" height="8" rx="0.5" ry="0.5" />
        <circle cx="17.5" cy="13" r="1" />
    </svg>
);

export default RetroTv;
