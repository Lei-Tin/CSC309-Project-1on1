import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export const FriendNotificationItem = ({ username, onAccept, onDecline }) => {
  return (
    <div className="dropdown-item">
      <div className="dropdown-container">
        <div className="dropdown-item-content">
          <p>{username} has sent you a friend request.</p>
        </div>
        <div className="dropdown-item-actions">
          <button className="accept" onClick={() => onAccept(username, true)}>
            <FontAwesomeIcon icon={faCheck} />
          </button>
          <button className="decline" onClick={() => onDecline(username, false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const InviteNotificationItem = ({ inviter, calendar, onAccept, onDecline }) => {
  return (
    <div className="dropdown-item">
      <div className="dropdown-container">
        <div className="dropdown-item-content">
          <p>{inviter} has invited you to {calendar}</p>
        </div>
        <div className="dropdown-item-actions">
          <button className="accept" onClick={() => onAccept(inviter, calendar)}>
            <FontAwesomeIcon icon={faCheck} />
          </button>
          <button className="decline" onClick={() => onDecline(inviter, calendar)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    </div>
  );
};


export const ReminderNotificationItem = ({ reminder, onDismiss }) => {
  return (
    <div className="dropdown-item">
      <div className="dropdown-item-content">
        <p>{reminder}</p>
      </div>
      <div className="dropdown-item-actions">
        <button className="dismiss" onClick={onDismiss}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
};
