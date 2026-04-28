import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import PartyPopperWheel from '../Icons/PartyPopperWheel';
import './PartyFab.css';

// Floating action button that hovers above the bottom nav on every
// screen except Party itself. Replaces what used to be the centered
// Party tab in BottomNav now that Books takes a tab slot. The button
// face is the lucide PartyPopper, restroked so each piece (cone,
// trail, confetti dots, streamers) carries one of the five media-type
// colors — keeps the familiar icon while reflecting all five media
// types at once. Tap → /party.
const PartyFab = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Hide on every Party route. /party (home), /party/wait/:code,
    // /party/:code, /party/joinParty — anything starting with /party.
    if (location.pathname === '/party' || location.pathname.startsWith('/party/')) {
        return null;
    }

    return (
        <button
            type='button'
            className='party-fab'
            onClick={() => navigate('/party')}
            aria-label='Start a party'
        >
            <PartyPopperWheel size={36} strokeWidth={2} />
        </button>
    );
};

export default PartyFab;
