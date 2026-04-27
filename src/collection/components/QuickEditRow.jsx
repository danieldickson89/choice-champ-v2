import React from 'react';
import { Star, User, Users } from 'lucide-react';

import './QuickEditRow.css';

const QuickEditRow = ({
    item,
    color,
    watchedLabel,
    onToggleMine,
    onToggleGroup,
    onOpenRating,
}) => {
    const isMine = Boolean(item.globalWatched);
    const isGroup = Boolean(item.watched);
    const rating = item.userRating;
    const verb = watchedLabel; // "Watched" or "Played"

    return (
        <div className='quick-edit-row'>
            {item.poster ? (
                <img src={item.poster} alt='' className='quick-edit-poster' loading='lazy' />
            ) : (
                <div className='quick-edit-poster quick-edit-poster-placeholder' />
            )}
            <div className='quick-edit-body'>
                <div className='quick-edit-title'>{item.title}</div>
                <div className='quick-edit-controls'>
                    <ToggleButton
                        active={isMine}
                        Icon={User}
                        verb={verb}
                        color={color}
                        onClick={() => onToggleMine(item, !isMine)}
                        aria-label={`Toggle personal ${verb.toLowerCase()} for ${item.title}`}
                    />
                    <ToggleButton
                        active={isGroup}
                        Icon={Users}
                        verb={verb}
                        color={color}
                        onClick={() => onToggleGroup(item, !isGroup)}
                        aria-label={`Toggle group ${verb.toLowerCase()} for ${item.title}`}
                    />
                    <button
                        type='button'
                        className='quick-edit-rating'
                        onClick={() => onOpenRating(item)}
                        aria-label={rating != null ? `Edit rating, currently ${rating.toFixed(1)} out of 10` : `Rate ${item.title}`}
                    >
                        {rating != null ? (
                            <span className='quick-edit-rating-pill' style={{ color }}>
                                <Star size={14} fill={color} stroke={color} />
                                <span>{rating.toFixed(1)}</span>
                            </span>
                        ) : (
                            <span className='quick-edit-rating-cta' style={{ color }}>Rate</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ToggleButton = ({ active, Icon, verb, color, onClick, ...rest }) => (
    <button
        type='button'
        role='switch'
        aria-checked={active}
        className={`quick-edit-toggle ${active ? 'is-on' : ''}`}
        style={active ? { backgroundColor: color, borderColor: color, color: '#111' } : undefined}
        onClick={onClick}
        {...rest}
    >
        <Icon size={14} strokeWidth={2.25} />
        <span>{verb}</span>
    </button>
);

export default QuickEditRow;
