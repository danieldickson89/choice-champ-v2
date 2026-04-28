import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

import { AuthContext } from '../../shared/context/auth-context';
import SegmentedToggle from '../../shared/components/SegmentedToggle/SegmentedToggle';
import MultiColorText from '../../shared/components/MultiColorText';
import PartyPopperWheel from '../../shared/components/Icons/PartyPopperWheel';
import { CreateParty } from './CreateParty';
import JoinParty from './JoinParty';

import './PartyHome.css';

// Labels are MultiColorText spans rather than plain strings — each
// character cycles through the five media-type colors, matching the
// FAB and the "Party Time!" heading. SegmentedToggle accepts JSX in
// label since it just renders {option.label}.
const VIEW_OPTIONS = [
    { value: 'create', label: <MultiColorText>Create Party</MultiColorText> },
    { value: 'join',   label: <MultiColorText>Join Party</MultiColorText> },
];

const PartyHome = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const [view, setView] = useState('create');
    const [online, setOnline] = useState(true);

    useEffect(() => {
        auth.showFooterHandler(true);
        if (!navigator.onLine) setOnline(false);
    }, [auth]);

    if(!online) {
        return (
            <div className='content'>
                <div className='offline-msg'>No internet</div>
            </div>
        );
    }

    return (
        <div className='content party-home'>
            <div className='party-home-sticky-header'>
                <div className='party-home-top-row'>
                    <button className='icon-btn' onClick={() => navigate('/profile')} aria-label='Profile'>
                        <User size={22} strokeWidth={2} />
                    </button>
                </div>
                <h1 className='party-home-title'>
                    <PartyPopperWheel size={28} strokeWidth={2} />
                    <MultiColorText>Party Time!</MultiColorText>
                </h1>
                <SegmentedToggle
                    options={VIEW_OPTIONS}
                    value={view}
                    onChange={setView}
                    activeColor='#000'
                />
            </div>

            <div className='party-home-body'>
                {view === 'create' ? <CreateParty /> : <JoinParty embedded />}
            </div>
        </div>
    );
};

export default PartyHome;
