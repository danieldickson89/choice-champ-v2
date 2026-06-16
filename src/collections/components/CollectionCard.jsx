import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

import { applySortAndFilter } from '../../shared/lib/collectionSort';
import './CollectionCard.css';

const MAX_PREVIEW_POSTERS = 4;

// Read the sort/filter the user last set on this collection's page so the card
// preview mirrors the top of that sorted/filtered list. The list endpoint now
// attaches userRating + (cached) imdbRating, so every sort reproduces here;
// only items with no rating yet sort to the bottom, same as on the page.
const readPrefs = (collectionId) => {
    const prefs = { sort: 'recent', filter: 'all', customOrder: null };
    try {
        prefs.sort = localStorage.getItem(`choice-champ:sort:${collectionId}`) || prefs.sort;
        prefs.filter = localStorage.getItem(`choice-champ:filter:${collectionId}`) || prefs.filter;
        const raw = localStorage.getItem(`choice-champ:custom-order:${collectionId}`);
        if (raw) prefs.customOrder = JSON.parse(raw);
    } catch { /* localStorage unavailable or bad JSON → keep defaults */ }
    return prefs;
};

const CollectionCard = ({ collection, collectionsType, color, interactive = true, onSelect, selected }) => {
    const items = Array.isArray(collection.items) ? collection.items : [];
    const itemCount = items.length;

    const previewItems = useMemo(() => {
        const { sort, filter, customOrder } = readPrefs(collection._id);
        return applySortAndFilter(items, { sort, filter, customOrder })
            .filter(item => item && item.poster)
            .slice(0, MAX_PREVIEW_POSTERS);
    }, [items, collection._id]);

    const content = (
        <>
            <div className='collection-card-accent' style={{ backgroundColor: color }} />
            <div className='collection-card-content'>
                <div className='collection-card-name'>{collection.name}</div>
                <div className='collection-card-meta'>
                    {itemCount > 0 ? `${itemCount} item${itemCount === 1 ? '' : 's'}` : 'Empty'}
                </div>
            </div>
            {previewItems.length > 0 && (
                <div className='collection-card-posters'>
                    {previewItems.map((item, i) => (
                        <img
                            key={item._id || item.itemId || i}
                            src={item.poster}
                            alt=''
                            className='collection-card-poster'
                            loading='lazy'
                        />
                    ))}
                </div>
            )}
            {onSelect && (
                <span
                    className={`collection-card-check ${selected ? 'is-selected' : ''}`}
                    style={selected && color ? { backgroundColor: color, borderColor: color } : undefined}
                    aria-hidden='true'
                >
                    {selected && <Check size={14} strokeWidth={3} color='#000' />}
                </span>
            )}
        </>
    );

    if (onSelect) {
        return (
            <button
                type='button'
                className={`collection-card collection-card-selectable ${selected ? 'collection-card-selected' : ''}`}
                style={selected && color ? { boxShadow: `inset 0 0 0 2px ${color}` } : undefined}
                onClick={() => onSelect(collection._id)}
                aria-pressed={!!selected}
            >
                {content}
            </button>
        );
    }

    if (interactive) {
        return (
            <Link
                to={`/collections/${collectionsType}/${collection._id}`}
                className='collection-card'
            >
                {content}
            </Link>
        );
    }

    return <div className='collection-card collection-card-static'>{content}</div>;
};

export default CollectionCard;
