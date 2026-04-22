import React, { useState, useTransition, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faGamepad, faDice, faUser } from '@fortawesome/free-solid-svg-icons';

import RetroTv from '../Icons/RetroTv';
import './BottomNav.css';

const tabs = [
    { to: '/collections/movie', icon: faVideo,    color: '#FCB016', key: 'movie' },
    { to: '/collections/tv',    icon: 'retro-tv', color: '#F04C53', key: 'tv' },
    { to: '/collections/game',  icon: faGamepad,  color: '#2482C5', key: 'game' },
    { to: '/collections/board', icon: faDice,     color: '#45B859', key: 'board' },
    { to: '/settings',          icon: faUser,     color: '#FCB016', key: 'profile' },
];

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isPending, startTransition] = useTransition();
    const [committedPath, setCommittedPath] = useState(location.pathname);
    const [clickedPath, setClickedPath] = useState(null);

    useEffect(() => {
        if (!isPending) {
            setCommittedPath(location.pathname);
            setClickedPath(null);
        }
    }, [isPending, location.pathname]);

    const handleClick = (e, to) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        if (committedPath === to || committedPath.startsWith(to + '/')) return;
        setClickedPath(to);
        startTransition(() => navigate(to));
    };

    return (
        <nav className='bottom-nav'>
            {tabs.map(tab => {
                const isActive = committedPath === tab.to || committedPath.startsWith(tab.to + '/');
                const isLoading = clickedPath === tab.to;
                const isHighlighted = isActive || isLoading;
                return (
                    <a
                        key={tab.key}
                        href={tab.to}
                        onClick={(e) => handleClick(e, tab.to)}
                        className={`bottom-nav-tab ${isHighlighted ? 'bottom-nav-tab-highlighted' : ''}`}
                        style={isHighlighted ? { color: tab.color } : undefined}
                    >
                        <span
                            className='bottom-nav-indicator'
                            style={{
                                backgroundColor: tab.color,
                                opacity: isActive ? 1 : (isLoading ? 0.45 : 0),
                            }}
                        />
                        {tab.icon === 'retro-tv'
                            ? <RetroTv style={isLoading && !isActive ? { opacity: 0.6 } : undefined} />
                            : <FontAwesomeIcon
                                icon={tab.icon}
                                size='xl'
                                fixedWidth
                                style={isLoading && !isActive ? { opacity: 0.6 } : undefined}
                              />}
                    </a>
                );
            })}
        </nav>
    );
};

export default BottomNav;
