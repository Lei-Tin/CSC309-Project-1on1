import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faAddressBook, faBell } from '@fortawesome/free-regular-svg-icons';
import { faCalendar as faCalendarSolid, faAddressBook as faAddressBookSolid, faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import './navbar.css';
import axios from 'axios';
import { ACCOUNTS_API_URL } from 'constants';
import { useNavigate } from 'react-router-dom';


function Navbar({ current }) {
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [isNotiDropdownOpen, setIsNotiDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleNotiDropdown = () => {
    setIsNotiDropdownOpen(!isNotiDropdownOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const config = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  };

  const navigate = useNavigate();
  axios.get(`${ACCOUNTS_API_URL}/profile/`, config)
    .then((response) => {
      setUsername(response.data.user.username);
      setProfilePic(response.data.profile_picture);
    })
    .catch((error) => {
      if (error.response && error.response.status === 401) {
        navigate('/unauthorized');
      }
    });

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link className="navbar-brand" to="/">1on1</Link>
        <div className="icon-container">
          {current === 'calendars' ? (
            <>
              <Link to="/calendars" title="Calendar"><FontAwesomeIcon className='active' icon={faCalendarSolid} /></Link>
              <Link to="/contacts" title="Contacts"><FontAwesomeIcon icon={faAddressBook} /></Link>
            </>
          ) : current === 'contacts' ? (
            <>
              <Link to="/calendars" title="Calendar"><FontAwesomeIcon icon={faCalendar} /></Link>
              <Link to="/contacts" title="Contacts"><FontAwesomeIcon className='active' icon={faAddressBookSolid} /></Link>
            </>
          ) : (
            <>
              <Link to="/calendars" title="Calendar"><FontAwesomeIcon icon={faCalendar} /></Link>
              <Link to="/contacts" title="Contacts"><FontAwesomeIcon icon={faAddressBook} /></Link>
            </>
          )}
          <div className="dropdown">
            <a className="dropdown-toggle"
              title="Alerts"
              role="button"
              id="dropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded={isNotiDropdownOpen}
              onClick={toggleNotiDropdown}
            >
              <FontAwesomeIcon icon={faBell} />
            </a>
            <div className={`dropdown-menu dropdown-menu-right ${isNotiDropdownOpen ? 'show' : ''}`}
              aria-labelledby="dropdownMenuLink"
            >
              {/* TODO: Filled in with real notification */}
              <div className="dropdown-item">
                <div className="dropdown-item-content">
                  <p>Yung Shou-Hi has added you to their contacts</p>
                </div>
                <div className="dropdown-item-actions">
                  <a href="/#" className="accept"> <FontAwesomeIcon icon={faCheck} /></a>
                  <a href="/#" className="decline"> <FontAwesomeIcon icon={faTimes} /></a>
                </div>
              </div>
              <div className="dropdown-item">
                <div className="dropdown-item-content">
                  <p>You have a scheduled meeting in 2 days with Ziling Xiao and QQY</p>
                </div>
                <div className="dropdown-item-actions">
                  <a href="/#" className="dismiss"><i id="dismiss" className="fas fa-times"></i></a>
                </div>
              </div>
            </div>
          </div>
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
              <img src={profilePic || '/assets/default_profile_pic.png'} alt="User profile" />
            </div>
          </div>
          <div className={`dropdown-menu dropdown-menu-right user-dropdown-menu ${isProfileDropdownOpen ? 'show' : ''}`}>
            <Link className="dropdown-item" to="/profile">Profile</Link>
            <a className="dropdown-item" href="/#">Settings</a>
            <Link className="dropdown-item" to="/">Logout</Link>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;