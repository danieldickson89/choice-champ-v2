import React, { useState } from 'react';
import { Popover } from '@mui/material';
import './TruncatedHeaderTitle.css';

// Heading that lives in a glass sticky header. Tapping reveals the
// full text in a small popover so long names don't get permanently
// hidden behind ellipsis. Each page passes its own className so the
// visual treatment (font size, color, etc.) stays page-owned; this
// component just layers on the tap-to-reveal behavior.
const TruncatedHeaderTitle = ({ children, className = '', style }) => {
    const [anchor, setAnchor] = useState(null);
    const handleOpen = (e) => setAnchor(e.currentTarget);
    const handleClose = () => setAnchor(null);
    const handleKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen(e);
        }
    };

    return (
        <React.Fragment>
            <h1
                className={`truncated-header-title ${className}`.trim()}
                style={style}
                onClick={handleOpen}
                onKeyDown={handleKey}
                role='button'
                tabIndex={0}
                aria-haspopup='dialog'
            >
                {children}
            </h1>
            <Popover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                PaperProps={{ className: 'truncated-header-title-popover' }}
            >
                <p className='truncated-header-title-popover-text'>{children}</p>
            </Popover>
        </React.Fragment>
    );
};

export default TruncatedHeaderTitle;
