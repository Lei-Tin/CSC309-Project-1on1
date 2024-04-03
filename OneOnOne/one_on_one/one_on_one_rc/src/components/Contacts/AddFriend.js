import React, { useState } from "react";

import axios from 'axios';
import { ACCOUNTS_API_URL, CONTACTS_API_URL, DEFAULT_PROFILE_PIC } from "constants";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default function AddFriendPanel({ toggleAddFriend }) {
    const [searchUsername, setSearchUsername] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectUser, setSelectUser] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const searchUser = () => {
        setErrorMessage('');
        if (searchUsername === '') {
            setErrorMessage('Please enter a username');
            return;
        }
        axios.get(`${ACCOUNTS_API_URL}/profile/partial/${searchUsername}/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((response) => {
                setSearchResults(response.data);
            })
            .catch((error) => {
                if (error.response.status === 404) {
                    setSearchResults([]);
                    setErrorMessage('User not found');
                    return;
                }
            });
    }

    const addFriend = (username) => {
        axios.post(`${CONTACTS_API_URL}/friendRequests/user/`, {
            requested: username
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(() => {
                toggleAddFriend();
            })
            .catch((error) => {
                setErrorMessage(error.response.data.requested);
            });
    }
    return (
        <>
            <div id="overlay">
                <div className="popup-window">
                    <button className="btn close-button" onClick={toggleAddFriend}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>

                    <div className="popup-modal">
                        <div className="heading">
                            <h2>Search for a user to add</h2>
                        </div>

                        <div className="form-outline search-input-bar">
                            <input type="search" id="search-input" className="form-control"
                                onChange={(e) => setSearchUsername(e.target.value)}
                                placeholder="Type to start searching for username..." aria-label="Search for username" />
                            <button className="btn btn-primary center" onClick={searchUser}>Search</button>
                        </div>
                        <span className="error">{errorMessage}</span>
                        <div className="card search-results">
                            {searchResults !== [] ?
                                (searchResults.map((searchResult, index) =>
                                    <div key={index}>
                                        <button className="dropdown-item search-result-profile" onClick={() => {
                                            addFriend(searchResult.user.username);
                                        }}>
                                            <img className="search-result-profile-pic" src={searchResult.profile_picture !== null ?
                                                `/media${searchResult.profile_picture}` : DEFAULT_PROFILE_PIC} alt="User profile" id="profile_pic" />
                                            <div className="search-result-name">{searchResult.user.username}</div>
                                        </button>
                                    </div>
                                ))
                                : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
