import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import './SimilarRail.css';

const SimilarRail = ({ similar, collectionType, accentColor }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!Array.isArray(similar) || similar.length === 0) return null;

    const handleTap = (item) => {
        // Always thread the original entry point through. Subsequent
        // taps inherit the same `originator` so the X close button
        // returns to the original collection/discover view, not the
        // previous detail in the chain.
        const originator = location.state?.originator || location.pathname;
        navigate(`/items/${collectionType}/${item.id}`, {
            state: { originator },
        });
    };

    return (
        <section className='item-details-section'>
            <h2 className='item-details-section-title'>More Like This</h2>
            <div className='similar-rail'>
                {similar.map(item => (
                    <button
                        key={item.id}
                        type='button'
                        className='similar-rail-card'
                        onClick={() => handleTap(item)}
                        aria-label={`Open ${item.title}`}
                    >
                        <div className='similar-rail-poster-wrap'>
                            {item.poster ? (
                                <img
                                    className='similar-rail-poster'
                                    src={item.poster}
                                    alt={item.title}
                                    loading='lazy'
                                />
                            ) : (
                                <div className='similar-rail-poster similar-rail-poster-fallback' />
                            )}
                            {item.rating && (
                                <span className='similar-rail-rating'>
                                    <Star size={10} fill={accentColor} stroke={accentColor} />
                                    <span>{item.rating}</span>
                                </span>
                            )}
                        </div>
                        <div className='similar-rail-title' title={item.title}>{item.title}</div>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default SimilarRail;
