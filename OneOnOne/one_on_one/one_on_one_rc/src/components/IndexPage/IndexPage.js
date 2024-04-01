import React from 'react';
import { Link } from 'react-router-dom';
import 'components/style.css'; 

import axios from 'axios';
import { ACCOUNTS_API_URL } from 'constants';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();  

  // On load, check if the user is already logged in
  // If logged in, then redirect to the profile page
  if (localStorage.getItem('token') !== null) {
    // Use axios to verify if the token is valid
    axios.get(`${ACCOUNTS_API_URL}/profile/`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).then(() => {
        // TODO: Redirect to calendar page
        navigate('/accounts/profile/');
    }).catch(() => {
        // This is when we failed to verify the token
        // Probably because the token timed out
        localStorage.removeItem('token');
    });
  }

  return (
    <main>
      <div id="home-page">
        <h1 className="display-4">Welcome to 1on1</h1>
        <p className="lead">Schedule your appointments with ease</p>
        <div id="auth-button-container">
          <Link to="/accounts/register" className="btn btn-primary auth-button">Register</Link>
          <Link to="/accounts/login" className="btn btn-primary auth-button">Login</Link>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
