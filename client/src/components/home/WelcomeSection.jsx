// src/components/home/WelcomeSection.jsx
import React from 'react';
import '../../style/WelcomeSection.css';

const WelcomeSection = () => {
  return (
    <div className="welcome-section">
      <div className="container"> {/* Wrap in container for centered max-width */}
        <h1 className="home-title">Welcome back to your Fantasy Football Portal!</h1>
        <h2 className="home-subtitle">Stay on top of the stats and make your best picks!</h2>
      </div>
    </div>
  );
};

export default WelcomeSection;
