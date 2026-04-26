import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { AuthContext } from '../../shared/context/auth-context';

import './Attribution.css';

// External logo URLs. Each points to the source's own apple-touch-icon
// (a 180x180 PNG that any modern site keeps at this stable path) so we
// don't depend on third-party hosts like Reddit/Squarespace caches.
const TMDB_LOGO = 'https://www.themoviedb.org/apple-touch-icon.png';
const RAWG_LOGO = 'https://rawg.io/apple-touch-icon.png';
const SGDB_LOGO = 'https://www.steamgriddb.com/apple-touch-icon.png';
const BGG_LOGO = 'https://boardgamegeek.com/apple-touch-icon.png';

const Attribution = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        auth.showFooterHandler(false);
        return () => auth.showFooterHandler(true);
    }, [auth]);

    return (
        <div className='content attribution-content'>
            <div className='attribution-topbar'>
                <button
                    type='button'
                    className='icon-btn'
                    onClick={() => navigate('/profile')}
                    aria-label='Back to profile'
                >
                    <ArrowLeft size={22} strokeWidth={1.75} />
                </button>
            </div>

            <h1 className='attribution-title'>Attributions</h1>

            <section className='attribution-block'>
                <img src={TMDB_LOGO} className='attribution-logo' alt='TMDB logo' />
                <p>
                    This product uses the TMDB API but is not endorsed or
                    certified by TMDB. All movie and TV show data is provided
                    by <a href='https://www.themoviedb.org/' target='_blank' rel='noopener noreferrer'>TMDB</a>.
                </p>
            </section>

            <section className='attribution-block'>
                <img src={RAWG_LOGO} className='attribution-logo' alt='RAWG logo' />
                <p>
                    Video game data powered by <a href='https://rawg.io/' target='_blank' rel='noopener noreferrer'>RAWG</a>.
                </p>
            </section>

            <section className='attribution-block'>
                <img src={SGDB_LOGO} className='attribution-logo' alt='SteamGridDB logo' />
                <p>
                    Video game posters provided by <a href='https://www.steamgriddb.com/' target='_blank' rel='noopener noreferrer'>SteamGridDB</a>.
                </p>
            </section>

            <section className='attribution-block'>
                <img src={BGG_LOGO} className='attribution-logo' alt='BoardGameGeek logo' />
                <p>
                    This product uses BoardGameGeek but is not endorsed or
                    certified by BoardGameGeek. All board game data is provided
                    by <a href='https://boardgamegeek.com/' target='_blank' rel='noopener noreferrer'>BoardGameGeek</a>.
                </p>
            </section>
        </div>
    );
};

export default Attribution;
