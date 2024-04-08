import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CALENDARS_API_URL } from 'constants';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';


function InviteeListModal({ calendarId, isOpen, onClose }) {
    const [invitees, setInvitees] = useState([]);
    const [uninvited, setUninvited] = useState([]);
    const [allAccepted, setAllAccepted] = useState(false);
    const navigate = useNavigate();

    const fetchInviteeData = useCallback(async () => {
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
            setAllAccepted(inviteesData.length > 0 && inviteesData.every(invitee => invitee.has_availability));

            const uninvitedResponse = await axios.get(`${CALENDARS_API_URL}/${calendarId}/invitee/uninvited`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const uninvitedData = uninvitedResponse.data;
            setUninvited(uninvitedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [calendarId, isOpen]);
    
    useEffect(() => {
        fetchInviteeData(); // Call the function to fetch data
    }, [isOpen, calendarId, fetchInviteeData]);

    const handleInvite = async (contactId) => {
        try {
            // Implement logic to invite the contact using the contactId
            console.log(`Inviting contact ${contactId}`);
            // Example: Redirect to sending an email to the contact
            axios.post(`${CALENDARS_API_URL}/${calendarId}/invitee/`, { invitee: contactId },{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            .then(() => {
                // Refresh the invitee list
                fetchInviteeData();
            });
        } catch (error) {
            console.error("Error inviting contact:", error);
        }
    };

    const sendEmail = async (calendarId, inviteeId) => {
        try {
            // Implement logic to send an email to the invitee using the inviteeId
            console.log(`Sending email to invitee ${inviteeId}`);
        
            alert('Email sent to invitee!');

            // Example: Redirect to sending an email to the invitee
            axios.post(`${CALENDARS_API_URL}/${calendarId}/email/${inviteeId}/`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
        } catch (error) {
            console.error("Error sending email to invitee:", error);
        }
    }

    const finalizeEvent = () => {
        Promise.all([
            axios.put(`${CALENDARS_API_URL}/${calendarId}/finalize/`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'content-Type': 'application/json',
                }
            }),
            axios.post(`${CALENDARS_API_URL}/${calendarId}/schedule/`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
        ]).then((response) => {
            console.log(response);
            navigate(`${calendarId}/finalize/`);
        }).catch((error) => {
            if (error.response && error.response.status === 401) {
                navigate('/unauthorized');
            }
        });
    };

    return (
        <div id="overlay">
            <div className="popup-window">
                <button onClick={onClose} className="btn close-button">
                    <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                </button>
                <div className="popup-modal">
                    <div className="heading">
                        <h2>Participants</h2>
                    </div>
                    <h3>Invited</h3>
                    <div className="card uninvited-list">
                        <div className="participants-list">
                            <ul>
                                {invitees.length === 0 ? <li>No invited contacts yet</li> : invitees.map(invitee => (
                                    <li key={invitee.id}>
                                        {invitee.invitee} ({invitee.has_availability ? "Accepted" : "Invited"})
                                        {!invitee.has_availability && (
                                            <button className="btn btn-outline-primary" onClick={() => sendEmail(invitee.calendar, invitee.invitee)}>Send Email</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {allAccepted && (
                        <button onClick={finalizeEvent} className="btn btn-success">Finalize</button>
                    )}
                    <div id="invite-contacts-block">
                        <h3>Invite more participants below?</h3>
                    </div>
                    <div className="card uninvited-list">
                        <div className="participants-list">
                            <ul>
                                {uninvited.length === 0 ? <li>No uninvited contacts available</li> : uninvited.map(contact => (
                                    <li key={contact.id}>
                                        <span>{contact.username}</span>
                                        <button onClick={() => handleInvite(contact.id)} className="btn btn-primary">Invite</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InviteeListModal;
