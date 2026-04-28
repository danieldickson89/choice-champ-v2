import React from 'react';

import { MEDIA_TYPES, MEDIA_TYPE_ORDER } from '../lib/mediaTypes';

// Default palette — pulls the five media-type colors in display order
// from the shared MEDIA_TYPES config so any future palette tweak there
// flows here automatically.
const DEFAULT_COLORS = MEDIA_TYPE_ORDER.map(key => MEDIA_TYPES[key].color);

// Renders text with each character colored from a palette, cycling
// in order. Whitespace doesn't consume a color slot (a space is
// invisible) so the cycle still feels balanced for phrases like
// "Party Time!" rather than skipping a beat across the gap.
//
// Use sparingly — we lean on this for brand-defining moments
// (Party home, FAB-adjacent surfaces) where the rainbow signals
// "this is the multi-media celebration tab."
const MultiColorText = ({ children, colors = DEFAULT_COLORS, className }) => {
    const text = typeof children === 'string' ? children : String(children ?? '');
    let colorIndex = 0;
    // Wrapped in a single span so the component is a single DOM node —
    // important when the parent is a flex container with `gap`, which
    // would otherwise space every individual character apart.
    return (
        <span className={className}>
            {[...text].map((ch, i) => {
                if (ch === ' ') return <span key={i}>{' '}</span>;
                const color = colors[colorIndex % colors.length];
                colorIndex++;
                return <span key={i} style={{ color }}>{ch}</span>;
            })}
        </span>
    );
};

export default MultiColorText;
