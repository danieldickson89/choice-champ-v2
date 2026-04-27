import React, { useEffect, useState } from 'react';
import { Dialog, Slider } from '@mui/material';
import { Star, Minus, Plus } from 'lucide-react';

import './RatingDialog.css';

const DEFAULT_UNRATED = 7.0;

const clampRating = (n) => {
    const rounded = Math.round(Number(n) * 10) / 10;
    return Math.max(1, Math.min(10, rounded));
};

const RatingDialog = ({ open, currentRating, onClose, onSave, onRemove, color = '#FCB016' }) => {
    const [draft, setDraft] = useState(currentRating ?? DEFAULT_UNRATED);

    useEffect(() => {
        if (open) setDraft(currentRating ?? DEFAULT_UNRATED);
    }, [open, currentRating]);

    const adjust = (delta) => setDraft(d => clampRating(d + delta));

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='xs'
            PaperProps={{ className: 'cc-dialog-paper' }}
        >
            <div className='cc-dialog'>
                <h3 className='cc-dialog-title'>Your Rating</h3>
                <div className='rating-dialog-readout'>
                    <Star size={26} fill={color} stroke={color} />
                    <span className='rating-dialog-number' style={{ color }}>
                        {draft.toFixed(1)}
                    </span>
                    <span className='rating-dialog-of-ten'>/ 10</span>
                </div>
                <div className='rating-dialog-controls'>
                    <button
                        type='button'
                        className='rating-dialog-nudge'
                        onClick={() => adjust(-0.1)}
                        disabled={draft <= 1}
                        aria-label='Decrease by 0.1'
                    >
                        <Minus size={18} strokeWidth={2.5} />
                    </button>
                    <Slider
                        value={Number(draft)}
                        onChange={(_, v) => setDraft(clampRating(v))}
                        min={1}
                        max={10}
                        step={0.1}
                        size='medium'
                        sx={{
                            color,
                            flex: 1,
                            mx: 1.5,
                            '& .MuiSlider-thumb': {
                                width: 22,
                                height: 22,
                            },
                            '& .MuiSlider-rail': {
                                opacity: 0.3,
                            },
                        }}
                    />
                    <button
                        type='button'
                        className='rating-dialog-nudge'
                        onClick={() => adjust(0.1)}
                        disabled={draft >= 10}
                        aria-label='Increase by 0.1'
                    >
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                </div>
                <div className='rating-dialog-actions'>
                    {currentRating != null && (
                        <button
                            type='button'
                            className='cc-dialog-btn cc-dialog-btn-danger'
                            onClick={onRemove}
                        >
                            Remove rating
                        </button>
                    )}
                    <div className='rating-dialog-actions-primary'>
                        <button
                            type='button'
                            className='cc-dialog-btn cc-dialog-btn-secondary'
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            className='cc-dialog-btn cc-dialog-btn-primary'
                            onClick={() => onSave(clampRating(draft))}
                            style={{ backgroundColor: color, color: '#111' }}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default RatingDialog;
