import React from 'react';
import { Link } from 'react-router-dom';

import './CollectionCard.css';

const MAX_PREVIEW_POSTERS = 4;

const CollectionCard = ({ collection, collectionsType, color, interactive = true }) => {
    const items = Array.isArray(collection.items) ? collection.items : [];
    const previewItems = items.filter(item => item && item.poster).slice(0, MAX_PREVIEW_POSTERS);
    const itemCount = items.length;

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
        </>
    );

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
