import React from "react";


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default function AddFriendPanel( {toggleAddFriend} ) {
    return (
        <>
        <div id="overlay">
            <div className="popup-window">
                <a type="button" className="btn close-button" onClick={toggleAddFriend}>
                    <FontAwesomeIcon icon={faTimes} />
                </a>

                <div className="popup-modal">
                    <div className="heading">
                        <h2>Search for a user to add</h2>
                    </div>

                    <div className="form-outline search-input-bar">
                        <input type="search" id="search-input" className="form-control" placeholder="Type to start searching for username..." aria-label="Search for username" />
                    </div>

                    <div className="card search-results">
                        <a className="dropdown-item search-result-profile" href="{% url 'contacts:contact-list' %}">
                            <div className="search-result-profile-pic"></div>
                            <div className="search-result-name">Wilso1</div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
