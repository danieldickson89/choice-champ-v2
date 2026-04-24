import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import { AuthContext } from '../../shared/context/auth-context';

import { useSwipeable } from 'react-swipeable';

import movieNight from '../assets/img/movie-night.svg';
import watch from '../assets/img/watch.svg';
import './Welcome.css';
const Welcome = props => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [isWelcome, setIsWelcome] = useState(true);

    useEffect(() => {
        auth.showFooterHandler(false);
    }, [auth]);

    const continueOn = () => {
        setIsWelcome(false);

        // Change positions of the sliders. With our CSS it creates an animation
        document.getElementById('slider-path').setAttribute('d', "M16 4C16 1.79086 17.7909 0 20 0H36C38.2091 0 40 1.79086 40 4C40 6.20914 38.2091 8 36 8H20C17.7909 8 16 6.20914 16 4Z");
        document.getElementById('slider-rect').classList.add('rect-translate');
    }

    const getStarted = () => {
        navigate('/collections/movie');
    }

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if(isWelcome) {
                setIsWelcome(false);

                document.getElementById('slider-path').setAttribute('d', "M16 4C16 1.79086 17.7909 0 20 0H36C38.2091 0 40 1.79086 40 4C40 6.20914 38.2091 8 36 8H20C17.7909 8 16 6.20914 16 4Z");
                document.getElementById('slider-rect').classList.add('rect-translate');
            }
        },
        onSwipedRight: () => {
            if(!isWelcome) {
                setIsWelcome(true);
                document.getElementById('slider-path').setAttribute('d', "M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4C24 6.20914 22.2091 8 20 8H4C1.79086 8 0 6.20914 0 4Z");
                document.getElementById('slider-rect').classList.remove('rect-translate');
            }
        },
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    let welcome = (
        <React.Fragment>
            <h2 className='welcome-header'>Welcome to Choice Champ!</h2>
            <p className='welcome-text'>
                Having a hard time choosing what to watch or play together?
                <br />
                <br />
                Choice Champ is here to make that choice a little easier.
            </p>
            <Button className="welcome-btn" onClick={continueOn}>
                Continue 
            </Button>
        </React.Fragment>
    );

    let info = (
        <React.Fragment>
            <h2 className='welcome-header'>Here's how we do things!</h2>
            <ol className='welcome-list'>
                <li>Create Collections</li>
                <li>Start a Choice Party</li>
                <li>Share Party Code to group</li>
                <li>Choose Together!</li>
            </ol>
            <Button className="welcome-btn" onClick={getStarted}>
                Get Started 
            </Button>
        </React.Fragment>
    );

    return (
        <div className='welcome' {...handlers}>
            <img src={isWelcome ? movieNight : watch} className="welcome-img" alt='Movie night'/>
                <svg id='slider' width="40" height="8" viewBox="0 0 40 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path id='slider-path' d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4C24 6.20914 22.2091 8 20 8H4C1.79086 8 0 6.20914 0 4Z" fill="#FCB016"/>
                    <rect id='slider-rect' opacity="0.52" x="32" width="8" height="8" rx="4" fill="white"/>
                </svg>
            {isWelcome ? welcome : info}
        </div>
    );
}

export default Welcome;