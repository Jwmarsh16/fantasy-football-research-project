// App.jsx - Updated to use React Router v6
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import PlayerList from './pages/PlayerList';
import PlayerDetail from './components/player/PlayerDetail';
import AddReview from './components/player/AddReview';
import Profile from './pages/Profile';
import UserList from './pages/UserList'; 
import Register from './components/user/Register';
import Login from './components/user/Login';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/players/:id" element={<PlayerDetail />} />
        <Route path="/players" element={<PlayerList />} />
        <Route path="/add-review/:playerId" element={<AddReview />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
