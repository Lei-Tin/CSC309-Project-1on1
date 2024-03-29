import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import '../../static/css/style.css'; // Adjust the path as necessary to match your project structure


function HomePage() {
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
