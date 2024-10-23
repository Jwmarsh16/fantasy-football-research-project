import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import NavBar from './NavBar';
import PlayerList from './PlayerList';
import PlayerDetail from './PlayerDetail';
import AddReview from './AddReview';
import UserProfile from './UserProfile';
import UserList from './UserList'; 
import Register from './Register';
import Login from './Login';
import Home from './Home';

function App() {
  return (
    <Router>
      <NavBar />
      <Switch>
        <Route path="/players/:id" component={PlayerDetail} />
        <Route path="/players" component={PlayerList} />
        <Route path="/add-review/:playerId" component={AddReview} />
        <Route path="/profile/:id" component={UserProfile} />
        <Route path="/users" component={UserList} /> 
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/" component={Home} exact />
      </Switch>
    </Router>
  );
}

export default App;
