import React from 'react';

const RetroTv = ({ className, style, size = '2.15em' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        style={style}
        aria-hidden="true"
    >
        <path
            d="M 9 7 L 5.5 2.5 M 15 7 L 18.5 2.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
        />
        <circle cx="5.5" cy="2.5" r="0.8" fill="currentColor" />
        <circle cx="18.5" cy="2.5" r="0.8" fill="currentColor" />
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M 4.5 6 L 19.5 6 Q 20.5 6 20.5 7 L 20.5 18 Q 20.5 19 19.5 19 L 4.5 19 Q 3.5 19 3.5 18 L 3.5 7 Q 3.5 6 4.5 6 Z M 5 8 L 15 8 L 15 17 L 5 17 Z M 17.5 10 m -0.8 0 a 0.8 0.8 0 1 0 1.6 0 a 0.8 0.8 0 1 0 -1.6 0 M 17.5 12.3 m -0.65 0 a 0.65 0.65 0 1 0 1.3 0 a 0.65 0.65 0 1 0 -1.3 0 M 16.2 14.2 L 19 14.2 L 19 14.6 L 16.2 14.6 Z M 16.2 15.1 L 19 15.1 L 19 15.5 L 16.2 15.5 Z M 16.2 16 L 19 16 L 19 16.4 L 16.2 16.4 Z"
        />
    </svg>
);

export default RetroTv;
