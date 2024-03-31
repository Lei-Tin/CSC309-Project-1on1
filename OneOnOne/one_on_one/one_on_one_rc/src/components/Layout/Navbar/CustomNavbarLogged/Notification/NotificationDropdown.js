import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ACCOUNTS_API_URL, CALENDARS_API_URL, CONTACTS_API_URL, REQUEST_HEADER_CONFIG } from 'constants';
import { FriendNotificationItem, ReminderNotificationItem, InviteNotificationItem } from './NotificationItem';

const NotificationDropdown = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [requesterUsernames, setRequesterUsernames] = useState([]);

  const toggleNotificationDropdown = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleSubmit = (username, action) => {
    axios.post(`${CONTACTS_API_URL}/friendRequests/request/`,
      {username: username, action: action },
      REQUEST_HEADER_CONFIG)
  };

  useEffect(() => {
    axios.get(`${CONTACTS_API_URL}/friendRequests/`, REQUEST_HEADER_CONFIG)
      .then((response) => {
        const friendRequests = response.data;
        let extractUsernames = friendRequests.map((request) => request.requester_username);
        setRequesterUsernames(extractUsernames);
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
        {requesterUsernames.map((username, index) => (
        <FriendNotificationItem
          key={index}
          username={username}
          onAccept={handleSubmit}
          onDecline={handleSubmit}
        />
      ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;