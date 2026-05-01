import React from 'react';
import './RatingsStrip.css';

const RatingsStrip = ({ ratings }) => {
    if (!ratings) return null;

    const chips = [];
    if (ratings.imdb) chips.push({ key: 'imdb', label: 'IMDb', value: ratings.imdb, className: 'ratings-chip-imdb' });
    if (ratings.rottenTomatoes) chips.push({ key: 'rt', label: 'RT', value: ratings.rottenTomatoes, className: 'ratings-chip-rt' });
    if (ratings.metacritic) chips.push({ key: 'mc', label: 'Metacritic', value: ratings.metacritic, className: 'ratings-chip-mc' });
    if (ratings.tmdb) chips.push({ key: 'tmdb', label: 'TMDB', value: ratings.tmdb, className: 'ratings-chip-tmdb' });

    if (chips.length === 0) return null;

    return (
        <div className='ratings-strip'>
            {chips.map(chip => (
                <div key={chip.key} className={`ratings-chip ${chip.className}`}>
                    <span className='ratings-chip-label'>{chip.label}</span>
                    <span className='ratings-chip-value'>{chip.value}</span>
                </div>
            ))}
        </div>
    );
};

export default RatingsStrip;
