import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell as faBellSolid } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { CONTACTS_API_URL, CALENDARS_API_URL } from 'constants';
import { FriendNotificationItem, InviteNotificationItem } from './NotificationItem';
import { useLocation } from 'react-router-dom';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [requesterUsernames, setRequesterUsernames] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isMoreFriendReq, setIsMoreFriendReq] = useState(false);
  const location = useLocation();

  const toggleNotificationDropdown = () => {
    setIsNotifOpen(!isNotifOpen);
  };
  
  const handleInvite = (calendarId, action) => {
    if (action) {
      navigate(`/calendars/${calendarId}/availabilities`);
    } else {
      // if the user is on the availability page, redirect to the calendar page
      if (location.pathname === `/calendars/${calendarId}/availabilities`) {
        navigate('/calendars');
      }
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
      if (location.pathname === `/calendars`) {
        // Simple bug fix to refresh the page when the user declines an invitation
        navigate('/');
      }
    }
    toggleNotificationDropdown();
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
        setIsMoreFriendReq(requesterUsernames.filter((requester) => requester !== username).length > 0);
        toggleNotificationDropdown();
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
  }, [navigate]);

  
  return (
    <div className="dropdown">
      <button className="dropdown-toggle"
        title="Alerts"
        id="dropdownMenuLink"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded={isNotifOpen}
        onClick={toggleNotificationDropdown}>
        <FontAwesomeIcon icon={isMoreFriendReq || invitations.length > 0 ? faBellSolid : faBell} className="icon" />
      </button>
      <div className={`dropdown-menu dropdown-menu-right ${isNotifOpen ? 'show' : ''}`}
        aria-labelledby="dropdownMenuLink"
      >
        {invitations.map((invitation, index) => (
          <InviteNotificationItem
            key={index}
            inviter={invitation.username}
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
        ) : <></>}

        {(invitations.length === 0 && !isMoreFriendReq) ? <p className="dropdown-item">No new notifications</p> : null}
      </div>
    </div>
  );
};

export default NotificationDropdown;