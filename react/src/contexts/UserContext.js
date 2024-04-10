import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [profilePic, setProfilePic] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const changeProfilePic = (newProfilePic) => {
    setProfilePic(newProfilePic);
  };

  return (
    <UserContext.Provider value={{ profilePic, changeProfilePic, isLoggedIn, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
