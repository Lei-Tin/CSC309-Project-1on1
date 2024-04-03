import React, { useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { DEFAULT_PROFILE_PIC } from 'constants';

import DeletePanel from './ConfimModal';
import InvitePanel from './InvitePanel';


export default function FriendList({ friendList }) {
    const [visiblePanel, setVisiblePanel] = useState({});
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    
    const [selectUsername, setSelectUsername] = useState('');
    const [selectUserId, setSelectUserId] = useState('');

    // Function to toggle the visibility of the setting panel for a specific friend.
    const toggleVisibility = (username) => {
        setVisiblePanel(prev => ({
            ...Object.keys(prev).reduce((acc, key) => {
                acc[key] = false; // Hide all panels before toggling the selected one
                return acc;
            }, {}),
            [username]: !prev[username] // Toggle the visibility of the selected panel
        }));
    };

    const handleDelete = (username) => {
        setSelectUsername(username);
        toggleDelete();
    }

    const toggleDelete = () => {
        setIsDeleteOpen(!isDeleteOpen);
    }

    const handleInvite = (username, userId) => {
        setSelectUsername(username);
        console.log(userId);
        setSelectUserId(userId)
        toggleInvite();
    }

    console.log(friendList);

    const toggleInvite = () => {
        setIsInviteOpen(!isInviteOpen);
    }

    return (
        <>
            {friendList.map((friend, index) => (
                <div key={index} className="contacts-profile">
                    <div className="profile-description">
                        <div className="contacts-profile-picture">
                            <img src={friend.profile_picture !== null ? `/media/${friend.profile_picture}` : DEFAULT_PROFILE_PIC} alt={`${friend.first_name}'s profile`} />
                        </div>
                        <h2>{friend.username}</h2>
                        <p>First Name:{`${friend.first_name}`}</p>
                        <p>Last Name:{`${friend.last_name}`}</p>
                        <p>Email: {friend.email}</p>
                        <button className="btn btn-success btn-sm contacts-invite-button" onClick={()=> handleInvite(friend.username, friend.id)}>Invite to meeting</button>
                        <button
                            type="button"
                            className="btn setting-button"
                            onClick={() => toggleVisibility(friend.username)}
                        >
                            <FontAwesomeIcon icon={faGear} />
                        </button>
                        {visiblePanel[friend.username] && (
                            <div className="setting-panel">
                                <button className="dropdown-item text-danger" onClick={()=>handleDelete(friend.username)}>Delete</button>
                            </div>
                        )}

                    </div>
                </div>
            ))}
            {isDeleteOpen && <DeletePanel toggleModal={toggleDelete} username={selectUsername} />}
            {isInviteOpen && <InvitePanel toggleModal={toggleInvite} username={selectUsername} userId={selectUserId} />}
        </>
    );
}