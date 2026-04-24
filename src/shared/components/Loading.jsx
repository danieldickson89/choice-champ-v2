import React from 'react';
import { BounceLoader, BeatLoader, SyncLoader, PropagateLoader } from 'react-spinners';

import './Loading.css';

const Loading = props => {
    let type = props.type || 'bounce';
    let size = props.size || 100;
    let color = props.color;
    let speed = props.speed || 1;
    let loading;

    if (type === 'bounce') {
        loading = <BounceLoader color={color} size={size}   speedMultiplier={speed} />;
    } else if (type === 'beat') {
        loading = <BeatLoader color={color} size={size} speedMultiplier={speed} />;
    } else if (type === 'sync') {
        loading = <SyncLoader color={color} size={size} speedMultiplier={speed} />;
    } else if (type === 'propagate') {
        loading = <PropagateLoader color={color} size={size} speedMultiplier={speed} />;
    }


    return (
        <div className={props.className}>
            {loading}
        </div>
    );
}

export default Loading;