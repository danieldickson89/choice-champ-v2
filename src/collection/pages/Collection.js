import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { ArrowLeft, Check, MoreVertical, Share2, ListOrdered, Clock, ArrowDownAZ, ArrowDownZA, Eye, Gamepad2, Dices, ChevronDown, Layers, EyeOff } from 'lucide-react';
import { Menu, MenuItem, Dialog } from '@mui/material';

import searchIcon from '../../shared/assets/img/search.svg';

import './Collection.css';
import PlaceholderImg from '../../shared/components/PlaceholderImg';
import ItemDetailsModal from '../components/ItemDetailsModal';
import ManageItemRow from '../components/ManageItemRow';
import SortFilterPanel from '../../shared/components/SortFilterPanel/SortFilterPanel';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const Collection = ({ socket }) => {
    const auth = useContext(AuthContext);
    let navigate = useNavigate();
    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set edit and our items list
     ***********************************************************/
    // Grab the collection type, name and id from the parameters
    let collectionType = useParams().type;
    let collectionId = useParams().id;

    // Grab query parameters from the url
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const hash = params.get('hash');

    const [items, setItems] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [shareCode, setShareCode] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [currentCollectionName, setCurrentCollectionName] = useState('');
    const [collectionName, setCollectionName] = useState('');
    const [sortValue, setSortValue] = useState('recent');
    const [filterValue, setFilterValue] = useState('unwatched');
    const [collectionTypeColor, setCollectionTypeColor] = useState('#FCB016');

    const [kebabAnchor, setKebabAnchor] = useState(null);
    const [sortAnchor, setSortAnchor] = useState(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const openKebab = (e) => setKebabAnchor(e.currentTarget);
    const closeKebab = () => setKebabAnchor(null);
    const openSort = (e) => setSortAnchor(e.currentTarget);
    const closeSort = () => setSortAnchor(null);

    const handleShare = () => { setShareOpen(true); closeKebab(); };
    const handleManage = () => { setIsEdit(true); closeKebab(); };
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(shareCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {}
    };

    const watchedLabel = (collectionType === 'game' || collectionType === 'board') ? 'Played' : 'Watched';
    const unwatchedLabel = (collectionType === 'game' || collectionType === 'board') ? 'Unplayed' : 'Unwatched';
    const WatchedIcon = collectionType === 'game' ? Gamepad2 : collectionType === 'board' ? Dices : Eye;

    const SORT_LABELS = { recent: 'Recent', oldest: 'Oldest', abc: 'A–Z', zyx: 'Z–A' };
    const currentSortLabel = SORT_LABELS[sortValue];
    const filterIsDefault = filterValue === 'unwatched';

    const sortOptions = [
        { value: 'recent', label: 'Recent', icon: Clock },
        { value: 'oldest', label: 'Oldest', icon: Clock },
        { value: 'abc',    label: 'A–Z',    icon: ArrowDownAZ },
        { value: 'zyx',    label: 'Z–A',    icon: ArrowDownZA },
    ];
    const filterOptions = [
        { value: 'all',       label: 'All',          icon: Layers },
        { value: 'unwatched', label: unwatchedLabel, icon: EyeOff },
        { value: 'watched',   label: watchedLabel,   icon: WatchedIcon },
    ];

    const itemsRef = useRef(items);

    useEffect(() => {
        auth.showFooterHandler(false);

        if(collectionType === 'movie') {
            setCollectionTypeColor('#FCB016');
        } else if (collectionType === 'tv') {
            setCollectionTypeColor('#FF4D4D');
        } else if (collectionType === 'game') {
            setCollectionTypeColor('#2482C5');
        } else if (collectionType === 'board') {
            setCollectionTypeColor('#45B859');
        }

        // Make a fetch get request to get all the items in a collection
        fetch(`https://choice-champ-backend-181ffd005e9f.herokuapp.com/collections/items/${collectionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setItems(data.items);
            itemsRef.current = data.items;
            setShareCode(data.shareCode);
            setCurrentCollectionName(data.name);
            setCollectionName(data.name);

            // Give a little time for the items to load
            setTimeout(() => {
                setIsLoading(false);

                // If there is a hash in the url, scroll to that element
                if(hash) {
                    // Add a little more time for the items to load
                    setTimeout(() => {
                            // If there is a hash in the url, scroll to that element
                            const element = document.getElementById(hash);
                            element.scrollIntoView({ behavior: "smooth" });
                    }, 500);
                }
            }, 500);

            // Join room with the collection id
            socket.emit('join-room', collectionId);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth, collectionId, socket]);

    useEffect(() => {
        socket.on('remove-item', (id) => {
            // Find item with the id and remove it from the list
            itemsRef.current = itemsRef.current.filter(item => item._id !== id);
            setItems(itemsRef.current);
        });

        socket.on('watched-item', (id) => {
            // Update the item with the given id to be watched
            itemsRef.current = itemsRef.current.map(item => {
                if(item._id === id && item.watched === false) {
                    item.watched = true;
                } else if(item._id === id && item.watched === true) {
                    item.watched = false;
                }

                return item;
            });

            setItems(itemsRef.current);
        });

        socket.on('add-item', (newItem) => {
            // Add the new item to the list
            itemsRef.current = [...itemsRef.current, newItem];
            setItems(itemsRef.current);
        });

        return () => {
            socket.off('remove-item');
            socket.off('watched-item');
            socket.off('add-item');
        }
    }, [socket]);

    /************************************************************
     * Logic for setting edit state and removing items
     ***********************************************************/
    const isEditHandler = () => {
        if(isEdit) {
            // Check to make sure the collection name is not empty
            if(collectionName !== '') {
                // If collection name has changed make a fetch post request to update the collection name
                if(collectionName !== currentCollectionName) {
                    fetch(`https://choice-champ-backend-181ffd005e9f.herokuapp.com/collections/name/${collectionId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: collectionName
                        })
                    })
                    .then(res => {
                        setIsEdit(false);
                        setCurrentCollectionName(collectionName);
                    });
                } else {
                    setIsEdit(false);
                }
            } else {
                alert('Collection name cannot be empty');
            }
        } else {
            setIsEdit(true);
        }
    }

    const removeItem = (id) => {
        // Make a fetch delete request to remove an item from a collection
        fetch(`https://choice-champ-backend-181ffd005e9f.herokuapp.com/collections/items/${collectionId}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            itemsRef.current = itemsRef.current.filter(item => item._id !== id);
            setItems(itemsRef.current);
            // Emit to the server that an item has been removed
            socket.emit('remove-remote-item', id, collectionId);
        });
    }

    const navBack = () => {
        socket.emit('leave-room', collectionId);
        navigate(`/collections/${collectionType}`);
    }

    const [activeDetailItemId, setActiveDetailItemId] = useState(null);
    const openDetails = (id) => setActiveDetailItemId(id);
    const closeDetails = () => setActiveDetailItemId(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next);
        itemsRef.current = next;
        // NOTE: reorder is session-local. Needs a backend "reorder" endpoint for persistence.
    };


    /************************************************************
     * Logic for creating a query from the search bar. I received
     * help and direction from this youtube video Web dev simplified
     * https://youtu.be/E1cklb4aeXA
     ***********************************************************/
    const [query, setQuery] = useState('');

    // Q: Why do we use useMemo here?
    // A: useMemo is used to optimize the filtering of items. It will only filter the items
    // when the query changes. This is important because if we didn't use useMemo the items
    // would be filtered on every render. This would be a waste of resources.
    const manageItems = useMemo(() => {
        if (!query) return items;
        return items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()));
    }, [items, query]);

    const sortedItems = useMemo(() => {
        let result = items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()));

        if (filterValue === 'watched')        result = result.filter(i => i.watched);
        else if (filterValue === 'unwatched') result = result.filter(i => !i.watched);

        if (sortValue === 'abc') {
            result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortValue === 'zyx') {
            result = [...result].sort((a, b) => b.title.localeCompare(a.title));
        } else if (sortValue === 'oldest') {
            result = [...result].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        } else { /* recent */
            result = [...result].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        }

        return result;
    }, [items, query, sortValue, filterValue]);

    const emptyMessage = (() => {
        if (query !== '') return 'No items match search';
        if (filterValue === 'watched') return (collectionType === 'game' || collectionType === 'board') ? 'No played items' : 'No watched items';
        if (filterValue === 'unwatched') return 'No items in this collection';
        return 'No items in this collection';
    })();

    return (
        <React.Fragment>
            <div className='collection-page'>
                <div className='collection-header'>
                    <button className='icon-btn' onClick={navBack} aria-label='Back'>
                        <ArrowLeft size={22} strokeWidth={2.5} />
                    </button>
                    {isEdit ? (
                        <input
                            className='collection-title-input'
                            value={collectionName}
                            onChange={e => setCollectionName(e.target.value)}
                        />
                    ) : (
                        <h2 className={`collection-title color-${collectionType}`}>{collectionName}</h2>
                    )}
                    {isEdit ? (
                        <button
                            className='icon-btn collection-edit-btn-active'
                            onClick={isEditHandler}
                            aria-label='Done'
                        >
                            <Check size={22} strokeWidth={2.5} />
                        </button>
                    ) : (
                        <button className='icon-btn' onClick={openKebab} aria-label='More'>
                            <MoreVertical size={22} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                <div className={`collection-controls ${isEdit ? 'collection-controls-edit' : ''}`}>
                    <div className='coll-search'>
                        <img src={searchIcon} alt='' className='coll-search-icon' />
                        <input
                            className='coll-search-input'
                            placeholder='Search'
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        {query !== '' && (
                            <FontAwesomeIcon
                                icon={faXmark}
                                size='lg'
                                className='coll-search-clear clickable'
                                onClick={() => setQuery('')}
                            />
                        )}
                    </div>
                    {!isEdit && (
                        <button className='sort-pill' onClick={openSort} aria-label='Sort and filter'>
                            {currentSortLabel}
                            {!filterIsDefault && (
                                <span className='sort-pill-filter-dot' style={{ backgroundColor: collectionTypeColor }} />
                            )}
                            <ChevronDown size={16} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className='collection-loading'>
                        <Loading color={collectionTypeColor} type='beat' size={20} />
                    </div>
                ) : isEdit ? (
                    manageItems.length === 0 ? (
                        <div className='collection-empty'>
                            {query !== '' ? 'No items match search' : 'No items in this collection'}
                        </div>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={manageItems.map(i => i._id)} strategy={verticalListSortingStrategy}>
                                <div className='manage-list'>
                                    {manageItems.map(item => (
                                        <ManageItemRow key={item._id} item={item} onRemove={removeItem} />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )
                ) : sortedItems.length === 0 ? (
                    <div className='collection-empty'>{emptyMessage}</div>
                ) : (
                    <div className='collection-grid'>
                        {sortedItems.map(item => (
                            <div
                                className='collection-item'
                                id={item.itemId}
                                key={item.itemId}
                                onClick={() => openDetails(item.itemId)}
                            >
                                <PlaceholderImg
                                    voted={null}
                                    finished={null}
                                    alt={`${item.title} poster`}
                                    collectionColor={collectionTypeColor}
                                    classNames='collection-item-img'
                                    src={item.poster}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ItemDetailsModal
                open={activeDetailItemId !== null}
                itemId={activeDetailItemId}
                collectionType={collectionType}
                collectionId={collectionId}
                onClose={closeDetails}
            />

            <Menu
                anchorEl={kebabAnchor}
                open={Boolean(kebabAnchor)}
                onClose={closeKebab}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ className: 'collection-menu-paper' }}
            >
                <MenuItem onClick={handleShare} className='collection-menu-item'>
                    <Share2 size={18} strokeWidth={2} style={{ marginRight: 12 }} />
                    Share code
                </MenuItem>
                <MenuItem onClick={handleManage} className='collection-menu-item'>
                    <ListOrdered size={18} strokeWidth={2} style={{ marginRight: 12 }} />
                    Manage items
                </MenuItem>
            </Menu>

            <SortFilterPanel
                anchorEl={sortAnchor}
                open={Boolean(sortAnchor)}
                onClose={closeSort}
                sortOptions={sortOptions}
                sortValue={sortValue}
                onSortChange={setSortValue}
                filterOptions={filterOptions}
                filterValue={filterValue}
                onFilterChange={setFilterValue}
                activeColor={collectionTypeColor}
            />

            <Dialog
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                fullWidth
                maxWidth='xs'
                PaperProps={{ className: 'share-dialog-paper' }}
            >
                <div className='share-dialog'>
                    <h3>Share this collection</h3>
                    <p>Send this code to someone you'd like to share with:</p>
                    <div className='share-code-display'>{shareCode}</div>
                    <button className='share-copy-btn' onClick={handleCopyCode}>
                        {copied ? 'Copied!' : 'Copy code'}
                    </button>
                </div>
            </Dialog>
        </React.Fragment>
    );
}

export default Collection;