import React from "react";
import axios from 'axios';

import { CONTACTS_API_URL } from "constants";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';



export default function ConfirmModal({ toggleModal, username }) {

    const deleteFriend = (username) => {
        axios.delete(`${CONTACTS_API_URL}/friendRequests/user/`,
            {
                data: {
                    username: username
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(() => {
                toggleModal();
            })
    };

    return (
        <div id="overlay">
            <div className={"popup-window"}>
                <a type="button" className="btn close-button" onClick={toggleModal}>
                    <FontAwesomeIcon icon={faTimes} />
                </a>
                <div className="modal-content">
                    <div className="box">
                        <p>Are you sure you want to delete "{username}" from your friend list? </p>
                        <div className="buttons">
                            <button className="btn btn-danger" onClick={() => deleteFriend(username)}>Yes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}