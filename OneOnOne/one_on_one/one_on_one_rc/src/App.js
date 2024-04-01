import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomePage from 'components/HomePage';

import Login from 'components/Accounts/Login';
import Register from 'components/Accounts/Register';
import Profile from 'components/Accounts/Profile'; 
import Contacts from 'components/Contacts/';

import CustomNavbar from 'components/Layout/Navbar/CustomNavbar';
import CustomNavbarLogged from 'components/Layout/Navbar/CustomNavbarLogged';

import Footer from 'components/Layout/Footer';

import NotFound from './components/ErrorPages/NotFound';
import Unauthorized from './components/ErrorPages/Unauthorized';

import { UserProvider } from 'contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/" element={<CustomNavbar />}>
          <Route path="accounts/login" element={<Login />} />
          <Route path="accounts/register" element={<Register />} />
          <Route path="unauthorized" element={<Unauthorized />}></Route>
          <Route path='*' element={<NotFound />}></Route>
        </Route>
       {/* TODO: Implement all elements that requires login and comment out below code block */}
          <Route path="/" element={<CustomNavbarLogged />}>
            <Route path="accounts/profile" element={<Profile />} />
            <Route path="contacts" index element={<Contacts />} />
            {/* <Route path="calendars">
              <Route index element={<Calendars />} />
              <Route path=":calendarID" element={<CalendarsDetail/>} />
            </Route> */}
          </Route>
      </Routes>
      <Footer/>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;