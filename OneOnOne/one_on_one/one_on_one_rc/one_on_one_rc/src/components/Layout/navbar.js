import React from 'react';
import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const CustomNavbar = () => {
  return (
    <>
      <Navbar bg="light" expand="lg">
          <Link to="/" className="navbar-brand">OneOnOne</Link>
      </Navbar>
      <Outlet />
    </>
  );
}

export default CustomNavbar;
