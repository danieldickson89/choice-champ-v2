import React, { useEffect, useState } from 'react';

import { SUBTABS, hasTmdbKey, fetchTmdb, normalizeItems } from './tmdb';
import './Discover.css';

const isTmdbType = (type) => type === 'movie' || type === 'tv';

const Discover = ({ collectionType, color }) => {
    let content;
    if (!isTmdbType(collectionType)) {
        content = <ComingSoon collectionType={collectionType} color={color} />;
    } else if (!hasTmdbKey()) {
        content = <MissingKey color={color} />;
    } else {
        return <DiscoverFeed collectionType={collectionType} color={color} />;
    }
    return <div className='discover'>{content}</div>;
};

const DiscoverFeed = ({ collectionType, color }) => {
    const subtabs = SUBTABS[collectionType];
    const [activeSubtab, setActiveSubtab] = useState(subtabs[0].key);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const subtab = subtabs.find(s => s.key === activeSubtab);
        if (!subtab) return;
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        fetchTmdb(subtab.path)
            .then(data => {
                if (cancelled) return;
                setItems(normalizeItems(collectionType, data.results || []));
                setIsLoading(false);
            })
            .catch(err => {
                if (cancelled) return;
                setError(err);
                setIsLoading(false);
            });
        return () => { cancelled = true; };
    }, [activeSubtab, collectionType, subtabs]);

    return (
        <div className='discover'>
            <div className='discover-subtabs'>
                {subtabs.map(tab => {
                    const isActive = tab.key === activeSubtab;
                    return (
                        <button
                            key={tab.key}
                            className={`discover-subtab ${isActive ? 'discover-subtab-active' : ''}`}
                            style={isActive ? { color, borderColor: color } : undefined}
                            onClick={() => setActiveSubtab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {isLoading && <DiscoverSkeleton color={color} />}
            {error && <DiscoverError error={error} color={color} />}
            {!isLoading && !error && items.length === 0 && (
                <p className='discover-empty'>No results available right now.</p>
            )}
            {!isLoading && !error && items.length > 0 && (
                <div className='discover-grid'>
                    {items.map(item => (
                        <div key={item.id} className='discover-card'>
                            {item.poster
                                ? <img src={item.poster} alt={`${item.title} poster`} className='discover-poster' />
                                : <div className='discover-poster discover-poster-placeholder'>No image</div>}
                            <p className='discover-card-title'>{item.title}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DiscoverSkeleton = ({ color }) => (
    <div className='discover-skeleton'>
        <div className='discover-spinner' style={{ borderTopColor: color }} />
    </div>
);

const DiscoverError = ({ error }) => (
    <div className='discover-error'>
        <p className='discover-error-title'>Could not load content</p>
        <p className='discover-error-text'>
            {error.status === 401
                ? 'TMDB API key rejected. Check your key in .env.local.'
                : `Something went wrong loading this feed. (${error.message})`}
        </p>
    </div>
);

const MissingKey = ({ color }) => (
    <div className='discover-placeholder'>
        <p className='discover-placeholder-title' style={{ color }}>Discover needs a TMDB key</p>
        <p className='discover-placeholder-text'>
            Create a free API key at{' '}
            <a href='https://www.themoviedb.org/settings/api' target='_blank' rel='noreferrer' style={{ color }}>
                themoviedb.org/settings/api
            </a>
            , then create a <code>.env.local</code> file at the project root with:
        </p>
        <pre className='discover-code'>REACT_APP_TMDB_API_KEY=your_key_here</pre>
        <p className='discover-placeholder-subtext'>
            Restart the dev server after adding the key. The file is gitignored by default so Jordan won't see your key.
        </p>
    </div>
);

const ComingSoon = ({ collectionType, color }) => {
    const label = collectionType === 'game' ? 'video games' : 'board games';
    const note = collectionType === 'game'
        ? 'Video games discover is waiting on a decision about the API source — see the memo about Giant Bomb.'
        : 'Board games discover will pull from BoardGameGeek\'s "hot" list.';
    return (
        <div className='discover-placeholder'>
            <p className='discover-placeholder-title' style={{ color }}>Discover — {label}</p>
            <p className='discover-placeholder-text'>{note}</p>
            <p className='discover-placeholder-subtext'>Coming soon.</p>
        </div>
    );
};

export default Discover;
