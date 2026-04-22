import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog } from '@mui/material';
import Loading from '../../shared/components/Loading';

import './Collections.css';
import { AuthContext } from '../../shared/context/auth-context';
import Button from '../../shared/components/FormElements/Button';
import CollectionCard from '../components/CollectionCard';

const Collections = props => {
    const auth = useContext(AuthContext);

    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set our collections list
     ***********************************************************/
    // Grab the type from the parameters
    let collectionsType = useParams().type;

    // State for collections
    const [collections, setCollections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for error messages
    const [nameError, setNameError] = useState(null);
    const [nameErrorText, setNameErrorText] = useState('');
    const [joinError, setJoinError] = useState('');
    const [pressingBtn, setPressingBtn] = useState(false);
    const [collectionTypeColor, setCollectionTypeColor] = useState('#FCB016');

    // Empty array will only run on the initial render
    useEffect(() => {
        auth.showFooterHandler(true);

        // Set the type color
        if(collectionsType === 'movie') {
            setCollectionTypeColor('#FCB016');
        } else if(collectionsType === 'tv') {
            setCollectionTypeColor('#FF4D4D');
        } else if(collectionsType === 'game') {
            setCollectionTypeColor('#2482C5');
        } else if(collectionsType === 'board') {
            setCollectionTypeColor('#45B859');
        }
        
        // Make a fetch post request to collections with the userId and setCollections to the response
        fetch(`https://choice-champ-backend-181ffd005e9f.herokuapp.com/collections/${collectionsType}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setCollections(data.collections);
            setIsLoading(false);
        });
    }, [auth, collectionsType]);

    /************************************************************
     * Logic for our dialog, including adding new categories
     ***********************************************************/
    // Modal state and functions
    const [open, setOpen] = useState(false);
    // Modal input state and function
    const inputCollectionRef = useRef();
    const inputJoinRef = useRef();
    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        // Reset the value in the input
        inputCollectionRef.current.value = '';
        inputJoinRef.current.value = null;
        setNameError(false);
        setJoinError('');
        setOpen(false);
    }

    const changeCollectionHandler = (event) => {
        const value = event.target.value;

        inputCollectionRef.current.value = value;
    }

    const changeJoinCodeHandler = (event) => {
        const value = event.target.value;

        inputJoinRef.current.value = value;
    }

    const handleAddCollection = () => {

        // Only add if the input is not empty and the collection does not already exist
        if(inputCollectionRef.current.value === '') {
            setNameError(true);
            setNameErrorText('Collection must have a name');
            return;
        } else if (collections.find(collection => collection.name === inputCollectionRef.current.value)) {
            setNameError(true);
            setNameErrorText('Collection with that name already exists');
            return;
        }

        // Send a fetch post request to collections with the userId and the new collection name
        fetch(`https://choice-champ-backend-181ffd005e9f.herokuapp.com/collections/${auth.userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: inputCollectionRef.current.value,
                type: collectionsType
            })
        })
        .then(res => res.json())
        .then(data => {
            // Add the new collection to the collections array
            setCollections([...collections, data.collection]);
        })
        .catch(err => {
            console.log(err);
        });


        // Close the modal
        handleClose();
    }

    const handleJoinCollection = () => {

        // Check that the code is five digits long
        if(inputJoinRef.current.value.length !== 5) {
            setJoinError('Code must be 5 digits long');
            return;
        }

        // Send a fetch post request to collections with the userId and the new collection name
        fetch(`https://choice-champ-backend-181ffd005e9f.herokuapp.com/collections/join/${inputJoinRef.current.value}/${collectionsType}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.errMsg) {
                setJoinError(data.errMsg);
                return;
            } else {
                // Add the new collection to the collections array
                setCollections([...collections, data.collection]);
                // Close the modal
                handleClose();
            }
        })
        .catch(err => {
            console.log(err);
        });
    }


    return (
        <React.Fragment>
            <div className='content'>
                {
                    pressingBtn ?
                    <button
                        className={`add-btn backgroundColor-${collectionsType} backgroundColorPressed-${collectionsType}`}
                        style={{animation: 'button-press .75s'}}>Add Collection</button>
                    :
                    <button
                        className={`add-btn backgroundColor-${collectionsType} clickable`}
                        onClick={() => {
                            setPressingBtn(true);
                            setTimeout(() => {
                                handleOpen();
                                setPressingBtn(false);
                            }, 750);
                        }}>Add Collection</button>
                }

                {
                    isLoading ? <Loading color={collectionTypeColor} type='beat' className='list-loading' size={20} /> :
                    (<div className='collections-content'>
                        {
                            collections.length > 0 ? collections.map((collection) => (
                                <CollectionCard
                                    key={collection._id}
                                    collection={collection}
                                    collectionsType={collectionsType}
                                    color={collectionTypeColor}
                                />
                            )) : <div className='no-collections-txt'>No Collections</div>
                        }
                    </div>)
                }
            </div>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <input className='text-input' type="text" placeholder={"collection name"} onChange={changeCollectionHandler} ref={inputCollectionRef}/>
                        <Button backgroundColor={collectionTypeColor} onClick={handleAddCollection}>Create Collection</Button>
                        {nameError && <p className='error' style={{textAlign: 'center'}}>{nameErrorText}</p>}
                        <p className='or'>OR</p>
                        <input className='text-input' type="number" min={10000} max={99999} placeholder={"share code"} onChange={changeJoinCodeHandler} ref={inputJoinRef}/>
                        <Button backgroundColor={collectionTypeColor} onClick={handleJoinCollection}>Join Collection</Button>
                        <p className='error' style={{textAlign: 'center'}}>{joinError}</p>
                    </div>
                </div>
            </Dialog>
        </React.Fragment>
    );
}

export default Collections;