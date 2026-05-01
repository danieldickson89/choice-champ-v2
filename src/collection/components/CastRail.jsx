import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import './CastRail.css';

const CastRail = ({ cast }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!Array.isArray(cast) || cast.length === 0) return null;

    const openCast = (member) => {
        // Inherit the existing originator if we're already mid-drill;
        // otherwise stamp the current location as the new originator.
        const originator = location.state?.originator || `${location.pathname}${location.search}`;
        navigate(`/person/${member.id}`, { state: { originator } });
    };

    return (
        <section className='item-details-section'>
            <h2 className='item-details-section-title'>Cast</h2>
            <div className='cast-rail'>
                {cast.map(member => (
                    <button
                        key={member.id}
                        type='button'
                        className='cast-rail-card'
                        onClick={() => openCast(member)}
                        aria-label={`Open ${member.name}`}
                    >
                        <div className='cast-rail-avatar-wrap'>
                            {member.profile ? (
                                <img
                                    className='cast-rail-avatar'
                                    src={member.profile}
                                    alt={member.name}
                                    loading='lazy'
                                />
                            ) : (
                                <div className='cast-rail-avatar cast-rail-avatar-fallback'>
                                    <User size={26} strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                        <div className='cast-rail-name' title={member.name}>{member.name}</div>
                        {member.character && (
                            <div className='cast-rail-character' title={member.character}>{member.character}</div>
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default CastRail;
