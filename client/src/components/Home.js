import React from 'react';

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to the Fantasy Football Research Hub</h1>
      <p>Read expert reviews, and determine the best players to draft for the season.</p>
      <div className="home-buttons">
        <a href="/players" className="btn">View Players</a>
        <a href="/register" className="btn">Register</a>
      </div>
    </div>
  );
}

export default Home;
