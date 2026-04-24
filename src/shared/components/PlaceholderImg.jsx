import React, { useState } from 'react';
import Loading from './Loading';

const PlaceholderImg = ({ src, alt, classNames, collectionColor, voted, finished }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <React.Fragment>
            {!loaded && <Loading color={collectionColor} type='beat' className='item-loading' size={20} />}
            <img
                src={src}
                className={classNames}
                alt={alt}
                style={!loaded ? { display: 'none' } : (voted && !finished) ? { border: '5px solid #FCB016' } : null}
                onLoad={() => setLoaded(true)}
            />
        </React.Fragment>
    );
};

export default PlaceholderImg;