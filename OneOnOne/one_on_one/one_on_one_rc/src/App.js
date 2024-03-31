import { BrowserRouter, Route, Routes } from 'react-router-dom';

import HomePage from 'components/HomePage';

import Login from 'components/Accounts/Login';
import Register from 'components/Accounts/Register';
import Profile from 'components/Accounts/Profile';

import CustomNavbar from 'components/Layout/Navbar/CustomNavbar';
import CustomNavbarLogged from 'components/Layout/Navbar/CustomNavbarLogged';

import Footer from 'components/Layout/Footer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}/>

        <Route path="/" element={<CustomNavbar />}>
          <Route path="accounts/login" element={<Login />} />
          <Route path="accounts/register" element={<Register />} />
        </Route>
        {/* TODO: Implement all elements that requires login and comment out below code block */}
        {/* <Route path="/" element={<CustomNavbarLogged />}>
          <Route path="accounts/profile" element={<Profile />} />
          <Route path="contacts" index element={<Contacts />} />
          <Route path="calendars">
            <Route index element={<Calendars />} />
            <Route path=":calendarID" element={<CalendarsDetail/>} />
          </Route>
        </Route> */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;