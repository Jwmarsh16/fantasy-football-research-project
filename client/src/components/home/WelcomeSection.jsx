// src/components/home/WelcomeSection.jsx
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../../style/WelcomeSection.css';

const WelcomeSection = () => {
  const signedIn = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="welcome-section">
      <div className="container">
        <h1 className="home-title">Fantasy Football Research Hub</h1>
        <p className="home-subtitle">
          I built this full-stack portfolio project with React, Flask, and PostgreSQL.
        </p>
        <Link className="home-browse-link" to="/players">Browse Players</Link>
        {!signedIn && (
          <p className="home-guest-note">
            Explore the sample catalog as a guest. <Link to="/login">Log in</Link> to save rankings.
          </p>
        )}
      </div>
    </div>
  );
};

export default WelcomeSection;
