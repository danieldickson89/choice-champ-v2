import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faChevronLeft, faChevronRight, faStar,
    faFlagCheckered, faCircleInfo, faImage
} from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from '../../shared/context/auth-context';
import edit from '../../shared/assets/img/edit.png';
import editing from '../../shared/assets/img/editing.png';
import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';
import back from '../../shared/assets/img/back.svg';
import removeImg from '../../shared/assets/img/remove.png';
import movieNight from '../../welcome/assets/img/movie-night.svg';
import watch from '../../welcome/assets/img/watch.svg';

import './Attribution.css';

const TMDB_LOGO = 'https://play-lh.googleusercontent.com/XXqfqs9irPSjphsMPcC-c6Q4-FY5cd8klw4IdI2lof_Ie-yXaFirqbNDzK2kJ808WXJk=w240-h480-rw';
const GIANT_BOMB_LOGO = 'https://external-preview.redd.it/DGvb3twMxWmxD9UYoAR5gMnAerP0aftUTz0eMXVH-7I.jpg?auto=webp&s=a1b8547e2079191a18ab4d7c44d96d4ed977f2c3';
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
                <p>This product uses TMDB API but is not endorsed or certified by TMDB. All movie and TV show data is provided by TMDB.</p>
            </section>

            <section className='attribution-block'>
                <img src={GIANT_BOMB_LOGO} className='attribution-logo' alt='Giant Bomb logo' />
                <p>This product uses Giant Bomb API but is not endorsed or certified by Giant Bomb. All video game data is provided by Giant Bomb.</p>
            </section>

            <section className='attribution-block'>
                <img src={BGG_LOGO} className='attribution-logo' alt='BoardGameGeek logo' />
                <p>This product uses BoardGameGeek but is not endorsed or certified by BoardGameGeek. All board game data is provided by BoardGameGeek.</p>
            </section>

            <section className='attribution-block'>
                <h2>Flaticon</h2>
                <p className='attribution-subtitle'>Many of the icons in this app come from Flaticon.</p>
                <ul className='attribution-link-list'>
                    <li><img src={back} alt='' /><a href='https://www.flaticon.com/free-icons/back-button'>Back button icons by The Chohans</a></li>
                    <li><FontAwesomeIcon icon={faPlus} /><a href='https://www.flaticon.com/free-icons/read-more'>Read more icons by Bharat Icons</a></li>
                    <li><img src={edit} alt='' /><a href='https://www.flaticon.com/free-icons/edit'>Edit icons by iconixar</a></li>
                    <li><img src={circle} alt='' /><a href='https://www.flaticon.com/free-icons/circle'>Circle icons by Freepik</a></li>
                    <li><FontAwesomeIcon icon={faChevronLeft} /><a href='https://www.flaticon.com/free-icons/back'>Back icons by Arkinasi</a></li>
                    <li><FontAwesomeIcon icon={faChevronRight} /><a href='https://www.flaticon.com/free-icons/back'>Back icons by Arkinasi</a></li>
                    <li><img src={editing} alt='' /><a href='https://www.flaticon.com/free-icons/edit'>Edit icons by iconixar</a></li>
                    <li><img src={removeImg} alt='' /><a href='https://www.flaticon.com/free-icons/delete'>Delete icons by Pixel perfect</a></li>
                    <li><img src={check} alt='' /><a href='https://www.flaticon.com/free-icons/yes'>Yes icons by juicy_fish</a></li>
                    <li><FontAwesomeIcon icon={faStar} /><a href='https://www.flaticon.com/free-icons/rating'>Rating icons by Corner Pixel</a></li>
                    <li><FontAwesomeIcon icon={faFlagCheckered} /><a href='https://www.flaticon.com/free-icons/finish'>Finish icons by Freepik</a></li>
                    <li><FontAwesomeIcon icon={faCircleInfo} /><a href='https://www.flaticon.com/free-icons/information'>Information icons by Anggara</a></li>
                    <li><FontAwesomeIcon icon={faImage} /><a href='https://www.flaticon.com/free-icons/image-placeholder'>Image placeholder icons by HideMaru</a></li>
                </ul>
            </section>

            <section className='attribution-block'>
                <h2>Storyset</h2>
                <p className='attribution-subtitle'>Illustrations throughout the app come from Storyset.</p>
                <ul className='attribution-link-list'>
                    <li><img src={movieNight} alt='' className='attribution-illustration' /><a href='https://storyset.com/people'>People illustrations by Storyset</a></li>
                    <li><img src={watch} alt='' className='attribution-illustration' /><a href='https://storyset.com/people'>People illustrations by Storyset</a></li>
                </ul>
            </section>
        </div>
    );
};

export default Attribution;
