import React, { useEffect, useState, useContext, useRef } from 'react';
import { api } from '../../shared/lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Trophy, Dices, Flag, Star } from 'lucide-react';
import { AuthContext } from '../../shared/context/auth-context';

import Loading from '../../shared/components/Loading';
import Button from '../../shared/components/FormElements/Button';

import './PartyWait.css';

const MEDIA_COLORS = {
    movie: '#FCB016',
    tv:    '#F04C53',
    game:  '#2482C5',
    board: '#45B859',
};

const PartyWait = ({ socket }) => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const { code } = useParams();

    const [memberCount, setMemberCount] = useState(0);
    const [userType, setUserType] = useState('guest');
    const [superChoiceEnabled, setSuperChoiceEnabled] = useState(false);
    const memberCountRef = useRef(memberCount);
    const [mediaType, setMediaType] = useState('');

    useEffect(() => {
        auth.showFooterHandler(false);
        api(`/party/${code}?userId=${auth.userId}`)
            .then(body => {
                let count = body.party.memberCount + 1;
                setMediaType(body.party.mediaType);
                if(body.party.superChoice) setSuperChoiceEnabled(true);
                if(body.owner) setUserType('owner');
                memberCountRef.current = count;
                setMemberCount(count);
                socket.emit('join-room', `waiting${code}`);
                socket.emit('member-remote-increment', `waiting${code}`);
                api(`/party/add-member/${code}`, { method: 'POST' }).catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        socket.on('member-increment', () => {
            memberCountRef.current += 1;
            setMemberCount(memberCountRef.current);
        });
        socket.on('member-decrement', () => {
            memberCountRef.current -= 1;
            setMemberCount(memberCountRef.current);
        });
        socket.on('start-party', () => {
            socket.emit('leave-room', `waiting${code}`);
            navigate(`/party/${code}`);
        });
        socket.on('party-deleted', () => {
            socket.emit('leave-room', `waiting${code}`);
            navigate('/party');
        });
        return () => {
            socket.off('member-increment');
            socket.off('member-decrement');
            socket.off('start-party');
            socket.off('party-deleted');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const routeToParty = () => {
        socket.emit('start-remote-party', `waiting${code}`);
        socket.emit('leave-room', `waiting${code}`);
        navigate(`/party/${code}`);
    };

    const navBack = async () => {
        if(userType === 'owner') {
            await api(`/party/${code}`, { method: 'DELETE' }).catch(err => console.log(err));
            socket.emit('party-remote-deleted', `waiting${code}`);
            socket.emit('leave-room', `waiting${code}`);
        } else {
            socket.emit('leave-room', `waiting${code}`);
            socket.emit('member-remote-decrement', `waiting${code}`);
            await api(`/party/remove-member/${code}`, { method: 'POST' }).catch(err => console.log(err));
        }
        navigate('/party');
    };

    const accentColor = MEDIA_COLORS[mediaType] || '#A855F7';
    const showTips = userType === 'owner' || superChoiceEnabled;

    return (
        <div className='content party-wait'>
            <div className='page-topbar'>
                <button className='icon-btn' onClick={navBack} aria-label='Cancel party'>
                    <X size={22} strokeWidth={2} />
                </button>
            </div>

            <div className='party-wait-hero'>
                <Trophy size={72} strokeWidth={1.5} color={accentColor} />
            </div>

            <div className='party-wait-card'>
                <div className='party-wait-row'>
                    <span className='party-wait-row-label'>Party Code</span>
                    <span className='party-wait-row-value' style={{ color: accentColor }}>{code}</span>
                </div>
                <div className='party-wait-row'>
                    <span className='party-wait-row-label'>Members</span>
                    <span className='party-wait-row-value'>{memberCount}</span>
                </div>
            </div>

            {showTips && (
                <section className='party-wait-tips-section'>
                    <h2 className='party-wait-tips-title'>Tips</h2>
                    <div className='party-wait-tips-card'>
                        {userType === 'owner' && (
                            <div className='party-wait-tip'>
                                <Dices size={22} strokeWidth={1.75} color={accentColor} />
                                <p>Tap this icon during voting to randomly select a winner from the remaining items.</p>
                            </div>
                        )}
                        {userType === 'owner' && (
                            <div className='party-wait-tip'>
                                <Flag size={22} strokeWidth={1.75} color={accentColor} />
                                <p>End voting early. Remaining items can be exported to a new collection.</p>
                            </div>
                        )}
                        {superChoiceEnabled && (
                            <div className='party-wait-tip'>
                                <Star size={22} strokeWidth={1.75} color={accentColor} />
                                <p>Super Choice is on. Double-tap an item to star it — starred items always advance to the next round (one per party).</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {userType === 'owner' && (
                <Button
                    className='party-wait-start-btn'
                    onClick={routeToParty}
                    backgroundColor='#000'
                    color='#fff'
                >
                    Start Party
                </Button>
            )}

            <div className='party-wait-status'>
                <Loading color={accentColor} type='propagate' size={12} speed={0.25} />
                <span className='party-wait-status-text'>
                    {userType === 'owner' ? 'Ready when you are' : 'Waiting for the host to start…'}
                </span>
            </div>
        </div>
    );
};

export default PartyWait;
