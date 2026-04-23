import React, { useState } from 'react';

import './Button.css';

const Button = props => {
    const [bounce, setBounce] = useState(false);

    const action = () => {
        if (props.onClick) {
            setBounce(true);
            setTimeout(() => {
                setBounce(false);
                props.onClick();
            }, 1000);
        }
    }

    return (
        <React.Fragment>
            { 
                bounce ? (
                    <button 
                        type={props.type} 
                        disabled={props.disabled}
                        className={`primary-btn ${props.className || ''}`.trim()}
                        style={ props.backgroundColor ? {animation: 'button-press .75s', backgroundColor: `${props.backgroundColor}`} : {animation: 'button-press .75s', backgroundColor: '#dd9b14' }}
                    >
                        {props.children}
                    </button>
                ) : (
                    <button 
                        type={props.type} 
                        disabled={props.disabled}
                        onClick={action}
                        className={`primary-btn ${props.className || ''}`.trim()}
                        style={ props.backgroundColor ? {backgroundColor: `${props.backgroundColor}`} : null }
                    >
                        {props.children}
                    </button>

            )}
        </React.Fragment>
    );
}

export default Button;