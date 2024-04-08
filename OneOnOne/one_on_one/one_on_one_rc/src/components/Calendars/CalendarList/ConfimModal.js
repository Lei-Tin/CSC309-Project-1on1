import React from "react";
import axios from 'axios';

import { CALENDARS_API_URL } from "constants";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';



export default function ConfirmModal({ toggleModal, calendarId }) {

    const deleteCalendar = (calendarId) => {
        axios.delete(`${CALENDARS_API_URL}/${calendarId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(() => {
            toggleModal();
            window.location.reload();
        })
    };

    return (
        <div id="overlay">
            <div className={"popup-window"}>
                <button className="btn close-button" onClick={toggleModal}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="popup-modal">
                    <div className="heading">
                        <h2>Confirmation</h2>
                    </div>
                    <div>
                        <p>Are you sure you want to delete this calendar? </p>
                        <div className="d-flex justify-content-center">
                            <button className="btn btn-danger" onClick={() => deleteCalendar(calendarId)}>Yes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}