import React from 'react';
import { Link } from 'react-router-dom';
import 'components/style.css'; 

import { useNavigate } from 'react-router-dom';
import { useUser } from 'contexts/UserContext';
import { useEffect } from 'react';

function HomePage() {
  const navigate = useNavigate();  
  const { isLoggedIn } = useUser();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/calendars');
    } else {
      localStorage.removeItem('token'); 
    }
  }, [isLoggedIn, navigate]);
  

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
