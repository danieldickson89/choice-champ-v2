import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import SegmentedToggle from '../shared/components/SegmentedToggle/SegmentedToggle';
import Collections from '../collections/pages/Collections';
import Discover from './Discover';
import { AuthContext } from '../shared/context/auth-context';

import './MediaTab.css';

const TYPE_CONFIG = {
    movie: { title: 'Movies',      color: '#FCB016' },
    tv:    { title: 'TV Shows',    color: '#F04C53' },
    game:  { title: 'Video Games', color: '#2482C5' },
    board: { title: 'Board Games', color: '#45B859' },
};

const VIEW_OPTIONS = [
    { value: 'discover', label: 'Discover' },
    { value: 'collections', label: 'Collections' },
];

const VIEW_STORAGE_KEY = 'choice-champ:tab-view';

const getSavedView = (type) => {
    try {
        const saved = JSON.parse(localStorage.getItem(VIEW_STORAGE_KEY) || '{}');
        return saved[type] === 'collections' ? 'collections' : 'discover';
    } catch {
        return 'discover';
    }
};

const persistView = (type, view) => {
    try {
        const saved = JSON.parse(localStorage.getItem(VIEW_STORAGE_KEY) || '{}');
        saved[type] = view;
        localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(saved));
    } catch {
        /* localStorage unavailable — not worth breaking the UI over */
    }
};

const MediaTab = () => {
    const { type } = useParams();
    const config = TYPE_CONFIG[type] || { title: type, color: '#FCB016' };
    const [view, setView] = useState(() => getSavedView(type));
    const auth = useContext(AuthContext);

    useEffect(() => {
        auth.showFooterHandler(true);
    }, [auth]);

    const handleViewChange = (newView) => {
        setView(newView);
        persistView(type, newView);
    };

    return (
        <div className='media-tab'>
            <header className='media-tab-header'>
                <h1 className='media-tab-title' style={{ color: config.color }}>{config.title}</h1>
                <SegmentedToggle
                    options={VIEW_OPTIONS}
                    value={view}
                    onChange={handleViewChange}
                    activeColor={config.color}
                />
            </header>
            <div className='media-tab-content'>
                {view === 'discover'
                    ? <Discover collectionType={type} color={config.color} />
                    : <Collections />}
            </div>
        </div>
    );
};

export default MediaTab;
