import React from 'react';
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const CustomNavbar = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link to="/" className="navbar-brand">OneOnOne</Link>
      </nav>
      <Outlet />
    </>
  );
}

export default CustomNavbar;
