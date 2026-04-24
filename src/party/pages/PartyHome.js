import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyPopper, User } from 'lucide-react';

import { AuthContext } from '../../shared/context/auth-context';
import SegmentedToggle from '../../shared/components/SegmentedToggle/SegmentedToggle';
import { CreateParty } from './CreateParty';
import JoinParty from './JoinParty';

import './PartyHome.css';

const VIEW_OPTIONS = [
    { value: 'create', label: 'Create Party' },
    { value: 'join',   label: 'Join Party' },
];

const PARTY_COLOR = '#A855F7';

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
                <h1 className='party-home-title' style={{ color: PARTY_COLOR }}>
                    <PartyPopper size={26} strokeWidth={1.75} color={PARTY_COLOR} />
                    Party Time!
                </h1>
                <SegmentedToggle
                    options={VIEW_OPTIONS}
                    value={view}
                    onChange={setView}
                    activeColor={PARTY_COLOR}
                />
            </div>

            <div className='party-home-body'>
                {view === 'create' ? <CreateParty /> : <JoinParty embedded />}
            </div>
        </div>
    );
};

export default PartyHome;
