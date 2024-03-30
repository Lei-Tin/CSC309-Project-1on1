import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Accounts/Login/';
import Register from './components/Accounts/Register/';
import Profile from './components/Accounts/Profile/';
import Navbar from './components/Layout/navbar';
import Navbar_logged from './components/Layout/navbar_logged';
import HomePage from './components/Index';
import Footer from './components/Layout/footer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="accounts/login" element={<Login />} />
          <Route path="accounts/register" element={<Register />} />
        </Route>

        <Route path="/" element={<Navbar_logged />}>
          <Route path="accounts/profile" element={<Profile />} />
          <Route path="contacts" index element={<Login />} />
          <Route path="calendars">
            <Route index element={<Login />} />
            <Route path=":calendarID" element={<Login/>} />
          </Route>
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;