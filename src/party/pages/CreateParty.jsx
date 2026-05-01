import React, { useEffect, useState, useContext } from 'react';
import { api } from '../../shared/lib/api';
import { useNavigate } from 'react-router-dom';
import './CreateParty.css';
import Button from '../../shared/components/FormElements/Button';
import ToggleSwitch from '../../shared/components/ToggleSwitch/ToggleSwitch';
import CollectionCard from '../../collections/components/CollectionCard';

import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';
import { MEDIA_TYPES as MEDIA_TYPE_CONFIG, MEDIA_TYPE_ORDER } from '../../shared/lib/mediaTypes';

// Source of truth comes from the shared config so a new media type
// (Books today, podcasts tomorrow) shows up here automatically.
const MEDIA_TYPES = MEDIA_TYPE_ORDER.map(key => ({
    key,
    label: MEDIA_TYPE_CONFIG[key].title,
    color: MEDIA_TYPE_CONFIG[key].color,
    Icon:  MEDIA_TYPE_CONFIG[key].Icon,
}));

const CreateParty = props => {
    const auth = useContext(AuthContext);

    const [collections, setCollections] = useState([]);
    const [mediaType, setMediaType] = useState('movie');
    const [selectAlert, setSelectAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [secretMode, setSecretMode] = useState(false);
    const [includeWatched, setIncludeWatched] = useState(false);
    const [superChoice, setSuperChoice] = useState(false);
    const [activeMediaType, setActiveMediaType] = useState('movie');
    const [collectionTypeColor, setCollectionTypeColor] = useState('#FCB016');

    const navigate = useNavigate();

    useEffect(() => {
        api(`/collections/movie/${auth.userId}`)
            .then(data => {
                setCollections(Array.isArray(data?.collections) ? data.collections : []);
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });
    }, [auth.userId]);

    const loadCollections = (type) => {
        setIsLoading(true);
        setMediaType(type);
        api(`/collections/${type}/${auth.userId}`)
            .then(data => {
                setSelectAlert(false);
                setCollections(Array.isArray(data?.collections) ? data.collections : []);
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });
    };

    const selectMediaType = (type) => {
        if(type === activeMediaType) return;
        const media = MEDIA_TYPES.find(m => m.key === type);
        setActiveMediaType(type);
        setCollectionTypeColor(media.color);
        loadCollections(type);
    };

    const toggleCollectionSelection = (collectionId) => {
        if(selectAlert) setSelectAlert(false);
        setCollections(prev =>
            prev.map(collection =>
                collection._id === collectionId
                    ? { ...collection, selected: !collection.selected }
                    : collection
            )
        );
    };

    const navToPartyWait = () => {
        const selected = collections.filter(c => c.selected);
        if(selected.length === 0) {
            setSelectAlert(true);
            return;
        }
        api('/party', {
            method: 'POST',
            body: JSON.stringify({
                collections: selected.map(c => c._id),
                mediaType,
                secretMode,
                includeWatched,
                superChoice,
                owner: auth.userId
            })
        })
        .then(data => navigate(`/party/wait/${data.partyCode}`))
        .catch(err => console.log(err));
    };

    const nonEmptyCollections = collections.filter(c => Array.isArray(c.items) && c.items.length > 0);

    return (
        <div className='create-party'>
            <section className='create-party-section'>
                <h2 className='create-party-section-title'>Options</h2>
                <div className='create-options-card'>
                    <div className='create-option'>
                        <div className='create-option-row'>
                            <p className='create-option-text'>Secret Mode</p>
                            <ToggleSwitch
                                checked={secretMode}
                                onChange={setSecretMode}
                                activeColor={collectionTypeColor}
                                ariaLabel='Secret Mode'
                            />
                        </div>
                        <p className='create-option-subtext'>Party members will not see each other's votes</p>
                    </div>
                    <div className='create-option'>
                        <div className='create-option-row'>
                            <p className='create-option-text'>Include Watched</p>
                            <ToggleSwitch
                                checked={includeWatched}
                                onChange={setIncludeWatched}
                                activeColor={collectionTypeColor}
                                ariaLabel='Include Watched'
                            />
                        </div>
                        <p className='create-option-subtext'>Include items that have been marked as watched/played</p>
                    </div>
                    <div className='create-option'>
                        <div className='create-option-row'>
                            <p className='create-option-text'>Super Choice Mode</p>
                            <ToggleSwitch
                                checked={superChoice}
                                onChange={setSuperChoice}
                                activeColor={collectionTypeColor}
                                ariaLabel='Super Choice Mode'
                            />
                        </div>
                        <p className='create-option-subtext'>
                            Double-tap a choice to star it. Starred choices always advance to the next round.
                        </p>
                    </div>
                </div>
            </section>

            <section className='create-party-section'>
                <h2 className='create-party-section-title'>Media Type</h2>
                <div className='create-media-grid'>
                    {MEDIA_TYPES.map(({ key, label, color, Icon }) => {
                        const isActive = activeMediaType === key;
                        return (
                            <button
                                key={key}
                                type='button'
                                className={`create-media-tile ${isActive ? 'is-active' : ''}`}
                                style={isActive
                                    ? { backgroundColor: color, borderColor: color }
                                    : { borderColor: 'rgba(255, 255, 255, 0.12)' }}
                                onClick={() => selectMediaType(key)}
                            >
                                <Icon
                                    size={28}
                                    strokeWidth={1.75}
                                    color={isActive ? '#111' : color}
                                />
                                <span
                                    className='create-media-tile-label'
                                    style={{ color: isActive ? '#111' : 'var(--cc-text)' }}
                                >
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className='create-party-section'>
                <h2 className='create-party-section-title'>Collections</h2>
                {isLoading ? (
                    <div className='create-collections-loading'>
                        <Loading color={collectionTypeColor} type='beat' size={20} />
                    </div>
                ) : nonEmptyCollections.length > 0 ? (
                    <div className='create-collections-list'>
                        {nonEmptyCollections.map(collection => (
                            <CollectionCard
                                key={collection._id}
                                collection={collection}
                                collectionsType={activeMediaType}
                                color={collectionTypeColor}
                                onSelect={toggleCollectionSelection}
                                selected={!!collection.selected}
                            />
                        ))}
                    </div>
                ) : (
                    <p className='create-collections-empty'>No collections found for this media type</p>
                )}
            </section>

            <Button
                type='button'
                className='create-party-submit'
                onClick={navToPartyWait}
                backgroundColor='var(--cc-pill-inverse-bg)'
                color='#fff'
            >
                Create Party
            </Button>
            {selectAlert && <p className='create-party-alert'>Please select at least one collection</p>}
        </div>
    );
};

export { CreateParty };

export default CreateParty;
