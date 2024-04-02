import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CALENDARS_API_URL } from 'constants';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


function InviteeListPopup({ calendarId, isOpen, onClose }) {
    const [invitees, setInvitees] = useState([]);
    const [uninvited, setUninvited] = useState([]);

    useEffect(() => {
        const fetchInviteeData = async () => {
            if (!isOpen) return; // Only fetch data if the popup is open
            try {
                // Fetch invitees data
                const inviteesResponse = await axios.get(`${CALENDARS_API_URL}/${calendarId}/invitee`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const inviteesData = inviteesResponse.data;
                setInvitees(inviteesData);

                const uninvitedResponse = await axios.get(`${CALENDARS_API_URL}/${calendarId}/invitee/uninvited`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const uninvitedData = uninvitedResponse.data;
                console.log(uninvitedData);
                setUninvited(uninvitedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchInviteeData(); // Call the function to fetch data
    }, [isOpen, calendarId]);

    const handleInvite = async (contactId) => {
        try {
            // Implement logic to invite the contact using the contactId
            console.log(`Inviting contact ${contactId}`);
            // Example: Redirect to sending an email to the contact
        } catch (error) {
            console.error("Error inviting contact:", error);
        }
    };

    return (
        <div id="overlay">
            <div className="popup-window">
                <button onClick={onClose} className="btn close-button">
                    <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                </button>
                <div className="popup-modal">
                    <div className="invitee-list">
                        <h5>Participants</h5>
                        <ul>
                            {invitees.map(invitee => (
                                <li key={invitee.id}>
                                    {invitee.invitee} ({invitee.has_availability ? "Accepted" : "Invited"})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="uninvited-list">
                        <h5>Not invited</h5>
                        <ul>
                            {uninvited.map(contact => (
                                <li key={contact.id}>
                                    {contact.username}
                                    <button onClick={() => handleInvite(contact.id)} className="btn">Invite</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InviteeListPopup;
