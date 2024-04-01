import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ACCOUNTS_API_URL, CALENDARS_API_URL, CONTACTS_API_URL } from 'constants';
import { FriendNotificationItem, ReminderNotificationItem, InviteNotificationItem } from './NotificationItem';

const NotificationDropdown = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [requesterUsernames, setRequesterUsernames] = useState([]);
  const [isMoreFriendReq, setIsMoreFriendReq] = useState(false);

  const toggleNotificationDropdown = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleFriendSubmit = (username, action) => {
    axios.post(`${CONTACTS_API_URL}/friendRequests/request/`,
      { username: username, action: action },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(() => {
        setRequesterUsernames(requesterUsernames.filter((requester) => requester !== username));
        setIsMoreFriendReq(requesterUsernames.length > 0);
      })
  };

  useEffect(() => {
    axios.get(`${CONTACTS_API_URL}/friendRequests/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((response) => {
        const friendRequests = response.data;
        let extractUsernames = friendRequests.map((request) => request.requester_username);
        setRequesterUsernames(extractUsernames);
        setIsMoreFriendReq(extractUsernames.length > 0);
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
        {isMoreFriendReq ? (
          requesterUsernames.map((username, index) => (
            <FriendNotificationItem
              key={index}
              username={username}
              onAccept={() => handleFriendSubmit(username, true)}
              onDecline={() => handleFriendSubmit(username, false)}
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