import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'components/Calendars/calendar.css';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const PopupModal = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        const calendarData = { name, start_date: startDate, end_date: endDate };
        onSubmit(calendarData);
        onClose(); // Close the modal
    };

    return (
        <div id="overlay">
            <div className="popup-window">
                <button onClick={onClose} className="btn close-button">
                    <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                </button>
                <div className="popup-modal">
                    <div className="heading">
                        <h2>Create a new calendar</h2>
                    </div>

                    <div className="form-content">
                        <form id="create-calendar-form" onSubmit={handleSubmit}>
                            <div className="form-drop-down">
                                <div className="form-group">
                                    <label htmlFor="name">Name your event</label>
                                    <input type="text" id="name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="start-date">Start Date</label>
                                    <input type="date" id="start-date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="end-date">End Date</label>
                                    <input type="date" id="end-date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                                <button className="btn btn-primary form-submit-button" type="submit">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupModal;
