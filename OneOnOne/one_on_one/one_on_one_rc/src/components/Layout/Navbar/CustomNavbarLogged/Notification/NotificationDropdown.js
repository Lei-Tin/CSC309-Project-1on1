import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell as faBellSolid } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { CONTACTS_API_URL, CALENDARS_API_URL } from 'constants';
import { FriendNotificationItem, InviteNotificationItem } from './NotificationItem';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [requesterUsernames, setRequesterUsernames] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isMoreFriendReq, setIsMoreFriendReq] = useState(false);

  const toggleNotificationDropdown = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  const handleInvite = (calendarId, action) => {
    if (action) {
      navigate(`/calendars/${calendarId}/availabilities`);
    } else {
      axios.delete(`${CALENDARS_API_URL}/${calendarId}/invitee/remove-invitation`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(() => {
          setInvitations(invitations.filter((invitation) => invitation.id !== calendarId));
        })
        .catch((error) => {
          console.log(error);
        });
    }
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
    axios.get(`${CALENDARS_API_URL}/status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((response) => {
        const invitations = response.data;
        console.log(invitations);
        setInvitations(invitations);
      })
      .catch((error) => {
        console.log(error);
      });
      
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
      <button className="dropdown-toggle"
        title="Alerts"
        id="dropdownMenuLink"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded={isNotifOpen}
        onClick={toggleNotificationDropdown}>
        <FontAwesomeIcon icon={isMoreFriendReq ? faBellSolid : faBell} className="icon" />
      </button>
      <div className={`dropdown-menu dropdown-menu-right ${isNotifOpen ? 'show' : ''}`}
        aria-labelledby="dropdownMenuLink"
      >
        {invitations.map((invitation, index) => (
          <InviteNotificationItem
            key={index}
            inviter={invitation.owner}
            calendar={invitation.name}
            onAccept={() => handleInvite(invitation.id, true)}
            onDecline={() => handleInvite(invitation.id, false)}
          />
        ))}

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