import React, { useState, useEffect } from 'react';

import './contacts.css';

import axios from 'axios';

import { CONTACTS_API_URL } from 'constants';

import FriendList from './FriendList';
import AddFriendPanel from './AddFriend';



function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [isAddFriend, setIsAddFriend] = useState(false);


  useEffect(() => {
    axios.get(`${CONTACTS_API_URL}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((response) => {
        setContacts(response.data.friends);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const toggleAddFriend = () => {
    setIsAddFriend(!isAddFriend);
  };

  return (
    <div className={`jumbotron contacts-list ${isAddFriend ? 'inactive' : ''}`}>
      <div className="display-4">
        My Contacts
      </div>
      <button className="btn btn-primary btn-lg btn-sm" onClick={toggleAddFriend}>Add new contact</button>
      {isAddFriend && <AddFriendPanel toggleAddFriend={toggleAddFriend} />}

      <div className="main-content-container">

        <div className="contacts-profile">
          {contacts.length === 0 ?
            <div>
              <h2>No contacts yet</h2>
              <p>Click on the button above to add a new contact</p>
            </div>
            :
            <FriendList friendList={contacts} />
          }
        </div>
      </div>
    </div>
  );
}

export default Contacts;