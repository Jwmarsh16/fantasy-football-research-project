// App.jsx - Updated to use React Router v6
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/layout/NavBar';
import PlayerList from './pages/PlayerList';
import PlayerDetail from './pages/PlayerDetail';
import AddReview from './components/player/AddReview';
import Profile from './pages/Profile';
import UserList from './pages/UserList'; 
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
// Settings pages
//import EditProfile from './pages/settings/EditProfile';
//import AccountSettings from './pages/settings/AccountSettings';
//import PrivacySettings from './pages/settings/PrivacySettings';
//import SecuritySettings from './pages/settings/SecuritySettings';
//import NotificationSettings from './pages/settings/NotificationSettings';
//import LanguageAccessibility from './pages/settings/LanguageAccessibility';
//import ContentAdPreferences from './pages/settings/ContentAdPreferences';
//import DataPrivacyTools from './pages/settings/DataPrivacyTools';
//import DeleteAccount from './pages/settings/DeleteAccount';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/players/:id" element={<PlayerDetail />} />
        <Route path="/players" element={<PlayerList />} />
        <Route path="/add-review/:playerId" element={<AddReview />} />
        <Route path="/profile" element={<Profile />} /> {/* Add this route */}
        <Route path="/profile/:userId" element={<Profile />} /> {/* Add specific profile route */}
        <Route path="/users" element={<UserList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        {/* Settings Routes */}
        {//<Route path="/profile/edit" element={<EditProfile />} />
        //<Route path="/profile/account" element={<AccountSettings />} />
        //<Route path="/profile/privacy" element={<PrivacySettings />} />
        //<Route path="/profile/security" element={<SecuritySettings />} />
        //<Route path="/profile/notifications" element={<NotificationSettings />} />
        //<Route path="/profile/language" element={<LanguageAccessibility />} />
        //<Route path="/profile/content" element={<ContentAdPreferences />} />
        //<Route path="/profile/data" element={<DataPrivacyTools />} />
        //<Route path="/profile/delete" element={<DeleteAccount />} />
        }
      </Routes>
    </Router>
  );
}

export default App;
