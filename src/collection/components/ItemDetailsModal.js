import React, { useContext, useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import Showdown from 'showdown';
import { X, Check, Circle } from 'lucide-react';

import Loading from '../../shared/components/Loading';
import { AuthContext } from '../../shared/context/auth-context';
import { BACKEND_URL } from '../../shared/config';
import './ItemDetailsModal.css';

const TYPE_COLORS = {
    movie: '#FCB016',
    tv:    '#FF4D4D',
    game:  '#2482C5',
    board: '#45B859',
};

const BACKEND = BACKEND_URL;

const ItemDetailsModal = ({ open, item, collectionType, collectionId, onClose, onToggleWatched }) => {
    const auth = useContext(AuthContext);
    const color = TYPE_COLORS[collectionType] || '#FCB016';
    const itemId = item?.itemId;
    const watched = !!item?.watched;
    const isPlayed = collectionType === 'game' || collectionType === 'board';
    const watchedLabel = isPlayed ? 'Played' : 'Watched';
    const unwatchedLabel = isPlayed ? 'Unplayed' : 'Unwatched';

    const [details, setDetails] = useState({});
    const [providers, setProviders] = useState({});
    const [collectionList, setCollectionList] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [loadingCollections, setLoadingCollections] = useState(false);

    useEffect(() => {
        if (!open || !itemId) return;

        let cancelled = false;
        setLoadingDetails(true);
        setLoadingCollections(true);

        fetch(`${BACKEND}/media/getInfo/${collectionType}/${itemId}`)
            .then(res => res.json())
            .then(data => {
                if (cancelled) return;
                if (collectionType === 'board') {
                    data.media.details.overview = new Showdown.Converter().makeHtml(data.media.details.overview);
                }
                if (collectionType === 'game') {
                    data.media.details.title = data.media.details.name;
                    data.media.details.name = undefined;
                }
                setDetails(data.media.details);
                if (collectionType === 'movie' || collectionType === 'tv') {
                    setProviders(data.media.providers);
                } else if (collectionType === 'game') {
                    setProviders({ platforms: data.media.providers.platforms });
                } else {
                    setProviders({});
                }
                setLoadingDetails(false);
            });

        fetch(`${BACKEND}/collections/collectionList/${collectionType}/${itemId}/${auth.userId}`)
            .then(res => res.json())
            .then(data => {
                if (cancelled) return;
                setCollectionList([...data.collections]);
                setLoadingCollections(false);
            });

        return () => { cancelled = true; };
    }, [open, itemId, collectionType, auth.userId]);

    const addToCollection = (addCollectionId, index) => {
        let tempId = itemId;
        if (collectionType !== 'board' && collectionType !== 'game') {
            tempId = parseInt(tempId);
        }
        fetch(`${BACKEND}/collections/items/${addCollectionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{ title: details.title, id: tempId, poster: details.poster }])
        })
        .then(res => res.json())
        .then(data => {
            setCollectionList(prev => {
                const next = [...prev];
                if (next[index]) next[index].itemId = data.newItems[0]._id;
                return next;
            });
        });
    };

    const removeFromCollection = (removeCollectionId, removeItemId) => {
        fetch(`${BACKEND}/collections/items/${removeCollectionId}/${removeItemId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
    };

    const toggleCollection = (collection, index) => {
        const next = [...collectionList];
        if (collection.exists) {
            next[index].exists = false;
            removeFromCollection(next[index].collectionId, next[index].itemId);
        } else {
            next[index].exists = true;
            addToCollection(next[index].collectionId, index);
        }
        setCollectionList(next);
    };

    const isLoading = loadingDetails || loadingCollections;
    const runtimeLabel =
        collectionType === 'board' ? 'Play Time' :
        collectionType === 'movie' ? 'Runtime' :
        collectionType === 'tv'    ? 'Seasons' : null;
    const runtimeUnit =
        collectionType === 'movie' || collectionType === 'board' ? 'minute' :
        collectionType === 'tv' ? 'season' : '';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='sm'
            scroll='body'
            PaperProps={{ className: 'item-details-paper' }}
        >
            <div className='item-details-modal'>
                {!isLoading && (
                    <div className='item-details-topbar'>
                        <button className='item-details-close' onClick={onClose} aria-label='Close'>
                            <X size={22} strokeWidth={2.5} />
                        </button>
                        {item && onToggleWatched && (
                            <div className='item-details-watched-control'>
                                <span className='item-details-watched-label'>
                                    {watched ? watchedLabel : unwatchedLabel}
                                </span>
                                <button
                                    type='button'
                                    role='switch'
                                    aria-checked={watched}
                                    aria-label={`Toggle ${watchedLabel.toLowerCase()}`}
                                    className={`item-details-watched-switch ${watched ? 'is-on' : ''}`}
                                    style={watched ? { backgroundColor: color } : undefined}
                                    onClick={() => onToggleWatched(item._id, watched)}
                                >
                                    <span className='item-details-watched-knob' />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {isLoading ? (
                    <div className='item-details-loading'>
                        <Loading color={color} type='beat' size={20} />
                    </div>
                ) : (
                    <React.Fragment>
                        {details.poster && (
                            <img className='item-details-poster' src={details.poster} alt={`${details.title} poster`} />
                        )}
                        <div className='item-details-title' style={{ color }}>{details.title}</div>

                        {runtimeLabel && (
                            <div className='item-details-row'>
                                <span className='item-details-label' style={{ color }}>{runtimeLabel}:</span>{' '}
                                {details.runtime > 0 ? details.runtime : 'N/A'}
                                {runtimeUnit && ` ${runtimeUnit}`}{details.runtime > 1 && 's'}
                            </div>
                        )}

                        {collectionType === 'board' && (
                            <>
                                <div className='item-details-row'>
                                    <span className='item-details-label' style={{ color }}>Min Players:</span> {details.minPlayers}
                                </div>
                                <div className='item-details-row'>
                                    <span className='item-details-label' style={{ color }}>Max Players:</span> {details.maxPlayers}
                                </div>
                            </>
                        )}

                        {(collectionType === 'movie' || collectionType === 'tv') && (
                            <div className='item-details-row'>
                                <span className='item-details-label' style={{ color }}>Rating:</span> {details.rating} / 10
                            </div>
                        )}

                        <div className='item-details-row'>
                            <div className='item-details-label' style={{ color }}>Overview</div>
                            <div
                                className='item-details-overview'
                                dangerouslySetInnerHTML={{ __html: details.overview || '' }}
                            />
                        </div>

                        {(collectionType === 'movie' || collectionType === 'tv') && (
                            <div className='item-details-row'>
                                <div className='item-details-label' style={{ color }}>Stream</div>
                                {providers.stream ? (
                                    <div className='item-details-providers'>
                                        {providers.stream.map(provider => (
                                            <img
                                                key={provider.provider_name}
                                                className='item-details-provider'
                                                src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`}
                                                alt={provider.provider_name}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className='item-details-none'>Not available to stream</div>
                                )}
                            </div>
                        )}

                        {collectionType === 'game' && providers.platforms && (
                            <div className='item-details-row'>
                                <div className='item-details-label' style={{ color }}>Platforms</div>
                                <div className='item-details-platforms'>
                                    {providers.platforms.map(p => p.name).join(', ')}
                                </div>
                            </div>
                        )}

                        <div className='item-details-collections'>
                            <div className='item-details-label' style={{ color }}>Collections</div>
                            {collectionList.map((collection, index) => (
                                <div
                                    key={collection._id}
                                    className='item-details-collection-row'
                                    onClick={() => toggleCollection(collection, index)}
                                >
                                    <div className='item-details-collection-name'>{collection.name}</div>
                                    {collection.exists ? (
                                        <span className='item-details-collection-checked' style={{ color }}>
                                            <Check size={14} strokeWidth={3} />
                                        </span>
                                    ) : (
                                        <Circle size={20} style={{ color: '#666' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </React.Fragment>
                )}
            </div>
        </Dialog>
    );
};

export default ItemDetailsModal;
