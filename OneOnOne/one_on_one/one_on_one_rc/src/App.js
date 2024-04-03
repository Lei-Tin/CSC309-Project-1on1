import { BrowserRouter, Route, Routes } from 'react-router-dom';

import IndexPage from 'components/IndexPage';

import Login from 'components/Accounts/Login';
import Register from 'components/Accounts/Register';
import Profile from 'components/Accounts/Profile';
import Contacts from 'components/Contacts/';

import Owned from 'components/Calendars/Owned';
import SelectAvailability from 'components/Calendars/Availability/SelectAvailability';

import CustomNavbar from 'components/Layout/Navbar/CustomNavbar';
import CustomNavbarLogged from 'components/Layout/Navbar/CustomNavbarLogged';

import Footer from 'components/Layout/Footer';

import NotFound from './components/ErrorPages/NotFound';
import Unauthorized from './components/ErrorPages/Unauthorized';

import { useUser } from 'contexts/UserContext';

function App() {
  const { isLoggedIn } = useUser();

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<IndexPage />} />

      {/* Use a simple method of detecting if we are logged in or not */}
      {/* Skip the axios check because they will be done anyways when you load the actual pages */}
      {isLoggedIn ? (
          <>
            <Route path="/" element={<CustomNavbarLogged />}>
              <Route path="accounts/profile" element={<Profile />} />
              <Route path="contacts" index element={<Contacts />} />
              <Route path="calendars/owned" element={<Owned />} />

              {/* <Route path="calendars">
              <Route index element={<Calendars />} />
              <Route path=":calendarID" element={<CalendarsDetail/>} */}

              <Route path="calendars/:calendar_id/availabilities" element={<SelectAvailability />} />

              <Route path="unauthorized" element={<Unauthorized />}></Route>
              <Route path='*' element={<NotFound />}></Route>
            </Route>
          </>
        ) : (
          <>
            <Route path="/" element={<CustomNavbar />}>
              <Route path="accounts/login" element={<Login />} />
              <Route path="accounts/register" element={<Register />} />
              <Route path="unauthorized" element={<Unauthorized />}></Route>
              <Route path='*' element={<NotFound />}></Route>
            </Route>
          </>
        )
      }
    </Routes>
    <Footer/>
    </BrowserRouter>
  );
}

export default App;