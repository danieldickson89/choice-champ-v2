import React from 'react';
import './SegmentedToggle.css';

const SegmentedToggle = ({ options, value, onChange, activeColor = '#FCB016' }) => {
    return (
        <div className='segmented-toggle'>
            {options.map(option => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        type='button'
                        className={`segmented-toggle-option ${isActive ? 'segmented-toggle-option-active' : ''}`}
                        style={isActive ? { backgroundColor: activeColor } : undefined}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default SegmentedToggle;
