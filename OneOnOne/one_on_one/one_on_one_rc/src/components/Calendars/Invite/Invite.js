import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CALENDARS_API_URL, CONTACTS_API_URL } from 'constants';


function InviteeListPopup({ calendarId, isOpen, onClose }) {
    const [invitees, setInvitees] = useState([]);

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
                console.log(inviteesData)
                setInvitees(inviteesData);
                console.log("fetched data");
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchInviteeData(); // Call the function to fetch data
    }, [isOpen, calendarId]);

    // const handleInvite = async (contactId) => {
    //     try {
    //         // Implement logic to invite the contact using the contactId
    //         console.log(`Inviting contact ${contactId}`);
    //         // Example: Redirect to sending an email to the contact
    //     } catch (error) {
    //         console.error("Error inviting contact:", error);
    //     }
    // };

    return (
        <div id="overlay">
            <div className="popup-window">
                <button onClick={onClose} className="close-button">X</button>
                <div className="popup-modal">
                    <div className="invitee-list">
                        <h4>Participants</h4>
                        <ul>
                            {invitees.map(invitee => (
                                <li key={invitee.id}>
                                    {invitee.name} - {invitee.has_availability ? "Accepted" : "Invited"}
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
