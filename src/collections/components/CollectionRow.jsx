import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

import CollectionCard from './CollectionCard';
import './CollectionRow.css';

const CollectionRow = ({ collection, collectionsType, color, isReorder }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: collection._id, disabled: !isReorder });

    const style = isReorder
        ? {
              transform: CSS.Transform.toString(transform),
              transition,
              opacity: isDragging ? 0.4 : 1,
              zIndex: isDragging ? 10 : 'auto',
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`collection-row ${isReorder ? 'is-reorder' : ''} ${isDragging ? 'is-dragging' : ''}`}
        >
            <button
                className='collection-row-handle'
                {...attributes}
                {...listeners}
                aria-label='Drag to reorder'
                tabIndex={isReorder ? 0 : -1}
                aria-hidden={!isReorder}
            >
                <GripVertical size={20} strokeWidth={2} />
            </button>
            <CollectionCard
                collection={collection}
                collectionsType={collectionsType}
                color={color}
                interactive={!isReorder}
            />
        </div>
    );
};

export default CollectionRow;
