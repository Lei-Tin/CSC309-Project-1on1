import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [profilePic, setProfilePic] = useState('');

  const changeProfilePic = (newProfilePic) => {
    setProfilePic(newProfilePic);
  };

  return (
    <UserContext.Provider value={{ profilePic, changeProfilePic }}>
      {children}
    </UserContext.Provider>
  );
};
