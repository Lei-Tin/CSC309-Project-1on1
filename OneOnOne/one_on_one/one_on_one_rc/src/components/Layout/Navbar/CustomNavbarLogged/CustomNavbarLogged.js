import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faAddressBook } from '@fortawesome/free-regular-svg-icons';
import { faCalendar as faCalendarSolid, faAddressBook as faAddressBookSolid } from '@fortawesome/free-solid-svg-icons';
import './navbar.css';
import axios from 'axios';
import { ACCOUNTS_API_URL } from 'constants';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from './Notification/NotificationDropdown';
import { Outlet } from 'react-router-dom';

import { useUser } from 'contexts/UserContext';


export default function NavBar() {
  const [username, setUsername] = useState('');
  const { profilePic, changeProfilePic } = useUser();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { logout } = useUser();

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  axios.get(`${ACCOUNTS_API_URL}/profile/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then((response) => {
      setUsername(response.data.user.username);
      changeProfilePic(response.data.profile_picture);
    })
    .catch((error) => {
      console.log(error);
      if (error.response && error.response.status === 401) {
        // Do nothing
        // Navbar is not the one that will redirect you
      }
    });

  const location = useLocation();
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        {/* TODO: Redirect to the calendars page */}
        <Link className="navbar-brand" to="/">1on1</Link>
        <div className="icon-container">
          <Link to="/calendars" title="Calendar">
            <FontAwesomeIcon icon={isActive('/calendars') ? faCalendarSolid : faCalendar} className={'icon ' + (isActive('/calendars') ? 'active' : '')} />
          </Link>
          <Link to="/contacts" title="Contacts">
            <FontAwesomeIcon icon={isActive('/contacts') ? faAddressBookSolid : faAddressBook} className={'icon ' + (isActive('/contacts') ? 'active' : '')} />
          </Link>
          <NotificationDropdown />
        </div>


        <div className="dropdown">
          <div className="mini-profile-container dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded={isProfileDropdownOpen}
            onClick={toggleProfileDropdown}
          >
            <span className="username">{username}</span>
            <div className="mini-profile">
              {/* For those without a profile a picture, assign default to it */}
              <img src={profilePic !== '' ? `/media${profilePic}` : '/assets/default_profile_pic.png'} alt="User profile" id="profile_pic" />
            </div>
          </div>
          <div className={`dropdown-menu dropdown-menu-right user-dropdown-menu ${isProfileDropdownOpen ? 'show' : ''}`}>
            <Link className="dropdown-item" to="/accounts/profile" onClick={toggleProfileDropdown}>Profile</Link>
            <Link className="dropdown-item" to="/" onClick={logout}>Logout</Link>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}