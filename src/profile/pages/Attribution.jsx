import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFlagCheckered } from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from '../../shared/context/auth-context';

import './Attribution.css';

const TMDB_LOGO = 'https://play-lh.googleusercontent.com/XXqfqs9irPSjphsMPcC-c6Q4-FY5cd8klw4IdI2lof_Ie-yXaFirqbNDzK2kJ808WXJk=w240-h480-rw';
const BGG_LOGO = 'https://images.squarespace-cdn.com/content/v1/5902292fd482e9284cf47b8d/1567633051478-PRQ3UHYD6YFJSP80U3YV/BGG.jpeg';

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
                <p>
                    Video game data powered by <a href='https://rawg.io/' target='_blank' rel='noopener noreferrer'>RAWG</a>.
                </p>
            </section>

            <section className='attribution-block'>
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

            <section className='attribution-block'>
                <h2>Flaticon</h2>
                <p className='attribution-subtitle'>A few icons in this app come from Flaticon.</p>
                <ul className='attribution-link-list'>
                    <li><FontAwesomeIcon icon={faStar} /><a href='https://www.flaticon.com/free-icons/rating'>Rating icons by Corner Pixel</a></li>
                    <li><FontAwesomeIcon icon={faFlagCheckered} /><a href='https://www.flaticon.com/free-icons/finish'>Finish icons by Freepik</a></li>
                </ul>
            </section>
        </div>
    );
};

export default Attribution;
