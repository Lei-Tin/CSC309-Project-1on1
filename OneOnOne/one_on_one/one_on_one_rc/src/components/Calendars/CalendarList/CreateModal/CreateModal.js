import React, { useState } from 'react';
import 'components/Calendars/calendar.css';
import axios from 'axios';
import { CALENDARS_API_URL } from 'constants';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const CreateModal = ({ toggleModal, fetchCalendars }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleCreateCalendar = (event) => {
        event.preventDefault();
        const calendarData = { name, start_date: startDate, end_date: endDate };
        axios.post(`${CALENDARS_API_URL}/`, calendarData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then((response) => {
                toggleModal(); // Close the modal on success
                fetchCalendars(); // Refresh the list of calendars
            })
            .catch((error) =>
                setErrorMessage(error.response.data),
            );
    };

    return (
            <div id="overlay">
                <div className="popup-window">
                    <button onClick={toggleModal} className="btn close-button">
                        <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                    </button>
                    <div className="popup-modal">
                        <div className="heading">
                            <h2>Create a new calendar</h2>
                        </div>

                        <div className="form-content">
                            <form id="create-calendar-form" onSubmit={handleCreateCalendar}>
                                <div className="form-drop-down">
                                    <div className="form-group">
                                        <label htmlFor="name">Name your event</label>
                                        <input type="text" id="name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                                        <span className="error">{errorMessage.name}</span>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="start-date">Start Date</label>
                                        <input type="date" min="1970-1-1" max="9999-12-31" id="start-date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                        <span className="error">{errorMessage.start_date}</span>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="end-date">End Date</label>
                                        <input type="date" min="1970-1-1" max="9999-12-31" id="end-date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                        <span className="error">{errorMessage.end_date}</span>
                                    </div>
                                    <span className="error">{errorMessage.non_field_errors}</span>
                                    <button className="btn btn-primary form-submit-button" type="submit">Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default CreateModal;
