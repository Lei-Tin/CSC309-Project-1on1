import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ACCOUNTS_API_URL, CALENDARS_API_URL, CONTACTS_API_URL, REQUEST_HEADER_CONFIG } from 'constants';
import { FriendNotificationItem, ReminderNotificationItem, InviteNotificationItem } from './NotificationItem';

const NotificationDropdown = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [requesterUsernames, setRequesterUsernames] = useState([]);
  const [isNotification, setIsNotification] = useState(false);

  const toggleNotificationDropdown = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleSubmit = (username, action) => {
    axios.post(`${CONTACTS_API_URL}/friendRequests/request/`,
      { username: username, action: action },
      REQUEST_HEADER_CONFIG)
      .then(() => {
        setRequesterUsernames(requesterUsernames.filter((requester) => requester !== username));
        setIsNotification(requesterUsernames.length > 0);
      })
  };

  useEffect(() => {
    axios.get(`${CONTACTS_API_URL}/friendRequests/`, REQUEST_HEADER_CONFIG)
      .then((response) => {
        const friendRequests = response.data;
        let extractUsernames = friendRequests.map((request) => request.requester_username);
        setRequesterUsernames(extractUsernames);
        setIsNotification(extractUsernames.length > 0);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);


  return (
    <div className="dropdown">
      <a className="dropdown-toggle"
        title="Alerts"
        role="button"
        id="dropdownMenuLink"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded={isNotifOpen}
        onClick={toggleNotificationDropdown}>
        <FontAwesomeIcon icon={faBell} />
      </a>
      <div className={`dropdown-menu dropdown-menu-right ${isNotifOpen ? 'show' : ''}`}
        aria-labelledby="dropdownMenuLink"
      >
        {requesterUsernames.length > 0 ? (
          requesterUsernames.map((username, index) => (
            <FriendNotificationItem
              key={index}
              username={username}
              onAccept={() => handleSubmit(username, true)}
              onDecline={() => handleSubmit(username, false)}
            />
          ))
        ) : (
          <p className="dropdown-item">You're done with all the notifications!</p>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;