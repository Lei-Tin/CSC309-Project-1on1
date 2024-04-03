import React, { useEffect, useState } from 'react';
import 'components/Calendars/calendar.css';
import axios from 'axios';

import { CALENDARS_API_URL } from 'constants';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const PopupModal = ({ toggleModal, username, userId }) => {
    const [selectMeetingId, setSelectMeetingId] = useState('');
    const [ownedMeetings, setOwnedMeetings] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    // const [ddlDate, setDdlDate] = useState('');
    function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        axios.post(`${CALENDARS_API_URL}/${selectMeetingId}/invitee/`,
            {
                invitee: userId,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        )
            .then((response) => {
                toggleModal();
                console.log(response.data);
            })
            .catch((error) => {
                setErrorMessage(error.response.data);
                console.log(error.response.data);
            });
    }

    useEffect(() => {
        axios.get(`${CALENDARS_API_URL}/owned`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((response) => {
                setOwnedMeetings(response.data);
                // Set the first meeting as the default selected meeting
                if (response.data.length !== 0) {
                    setSelectMeetingId(response.data[0].id);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleSelectChange = (event) => {
        setSelectMeetingId(event.target.value); // Update the state when a new meeting is selected
    };

    return (
        <div id="overlay">
            <div className="popup-window">
                <button onClick={toggleModal} className="btn close-button">
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <div className="popup-modal">
                    {ownedMeetings.length !== 0 ? (
                        <div>
                            <div className="heading">
                                <h2>Invite <span className="font-weight-bold">{username}</span> to a Meeting</h2>
                            </div>

                            <div className="form-content">
                                <form className="form-drop-down" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="event-selection">Select event</label>
                                        <select className="form-control" id="event-selection" onChange={handleSelectChange} value={selectMeetingId}>
                                            <option disabled>Select a meeting</option>
                                            {ownedMeetings.map((meeting) => (
                                                <option key={meeting.id} value={meeting.id}>{meeting.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* <div className="form-group">
                                        <label htmlFor="deadline">Select the response deadline</label>
                                        <input type="date" id="deadline" className="form-control" value={ddlDate} onChange={(e) => setDdlDate(e.target.value)} />
                                    </div> */}
                                    {errorMessage && <p className="error">{errorMessage}</p>}
                                    <button className="btn btn-primary form-submit-button" type="submit">Invite</button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <p>You are not owner for any existing meeting. Create one first.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopupModal;