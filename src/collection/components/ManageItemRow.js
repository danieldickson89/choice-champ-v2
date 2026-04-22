import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

import './ManageItemRow.css';

const ManageItemRow = ({ item, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className={`manage-item-row ${isDragging ? 'manage-item-row-dragging' : ''}`}>
            <button
                className='manage-item-handle'
                {...attributes}
                {...listeners}
                aria-label='Drag to reorder'
            >
                <GripVertical size={20} strokeWidth={2} />
            </button>
            {item.poster && (
                <img src={item.poster} alt='' className='manage-item-poster' loading='lazy' />
            )}
            <div className='manage-item-title'>{item.title}</div>
            <button
                className='manage-item-trash'
                onClick={() => onRemove(item._id)}
                aria-label={`Remove ${item.title}`}
            >
                <Trash2 size={18} strokeWidth={2} />
            </button>
        </div>
    );
};

export default ManageItemRow;
