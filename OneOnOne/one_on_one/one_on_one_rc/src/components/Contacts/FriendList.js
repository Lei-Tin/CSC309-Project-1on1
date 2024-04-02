import React, { useState } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { DEFAULT_PROFILE_PIC } from 'constants';

export default function FriendList({ friendList }) {
    const [visiblePanel, setVisiblePanel] = useState({});

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

    return (
        <>
            {friendList.map((friend, index) => (
                <div className="contacts-profile">
                    <div key={index} className="profile-description">
                        <div className="contacts-profile-picture">
                            <img src={friend.profile_picture !== "" ? friend.profile_picture : DEFAULT_PROFILE_PIC} alt={`${friend.first_name}'s profile`} />
                        </div>
                        <h2>{friend.username}</h2>
                        <p>First Name:{`${friend.first_name}`}</p>
                        <p>Last Name:{`${friend.last_name}`}</p>
                        <p>Email: {friend.email}</p>
                        <button className="btn btn-success btn-sm contacts-invite-button" >Invite to meeting</button>
                        <button
                            type="button"
                            className="btn setting-button"
                            onClick={() => toggleVisibility(friend.username)}
                        >
                            <FontAwesomeIcon icon={faGear} />
                        </button>
                        {visiblePanel[friend.username] && (
                            <div className="setting-panel">
                                <a className="dropdown-item text-danger">Delete</a>
                            </div>
                        )}

                    </div>
                </div>
            ))}
        </>
    );
}