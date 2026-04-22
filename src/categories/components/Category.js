import React, { useState, useEffect } from 'react';

import './Category.css';
import { Link } from 'react-router-dom';

// DONE
const Category = props => {
    const [source, setSource] = useState('/Home/movie-outline.png') // Default source is movie

    useEffect(() => {
        // Set source to movie, tv, game, or board game depending on props.id
        if(props.id === 'movie') {
            setSource(`${process.env.PUBLIC_URL}/Home/movie-outline.png`);
        } else if(props.id === 'tv') {
            setSource(`${process.env.PUBLIC_URL}/Home/tv-outline.png`);
        } else if(props.id === 'game') {
            setSource(`${process.env.PUBLIC_URL}/Home/video-game-outline.png`);
        } else if(props.id === 'board') {
            setSource(`${process.env.PUBLIC_URL}/Home/board-game-outline.png`);
        }
    }, []);

    return (
        <Link to={`/collections/${props.id}`} className='category'>
            <div className='category-overlay' id={props.id} >
                <img 
                    className='category-img' 
                    src={source} 
                    alt={props.title}
                />
            </div>
        </Link>
    );
}

export default Category;