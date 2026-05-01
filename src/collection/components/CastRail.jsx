import React from 'react';
import { User } from 'lucide-react';
import './CastRail.css';

const CastRail = ({ cast }) => {
    if (!Array.isArray(cast) || cast.length === 0) return null;

    return (
        <section className='item-details-section'>
            <h2 className='item-details-section-title'>Cast</h2>
            <div className='cast-rail'>
                {cast.map(member => (
                    <div key={member.id} className='cast-rail-card'>
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
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CastRail;
