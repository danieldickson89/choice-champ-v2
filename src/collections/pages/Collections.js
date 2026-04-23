import React from 'react';
import { useParams } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import Loading from '../../shared/components/Loading';
import CollectionRow from '../components/CollectionRow';

import './Collections.css';

const Collections = ({ collections, isLoading, color, isReorder, onReorder }) => {
    const collectionsType = useParams().type;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = collections.findIndex(c => c._id === active.id);
        const newIndex = collections.findIndex(c => c._id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(collections, oldIndex, newIndex);
        onReorder && onReorder(next);
    };

    if (isLoading) {
        return (
            <div className='collections-loading'>
                <Loading color={color} type='beat' size={20} />
            </div>
        );
    }

    if (!collections || collections.length === 0) {
        return <div className='no-collections-txt'>No Collections</div>;
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={collections.map(c => c._id)} strategy={verticalListSortingStrategy}>
                <div className='collections-content'>
                    {collections.map(c => (
                        <CollectionRow
                            key={c._id}
                            collection={c}
                            collectionsType={collectionsType}
                            color={color}
                            isReorder={!!isReorder}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default Collections;
