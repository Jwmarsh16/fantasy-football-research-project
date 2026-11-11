// src/components/home/WelcomeSection.jsx
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../../style/WelcomeSection.css';

const WelcomeSection = () => {
  const signedIn = useSelector((state) => state.auth.isAuthenticated);

  return (
    <section className="welcome-section" aria-labelledby="home-title">
      <div className="welcome-copy">
        <h1 className="home-title" id="home-title">Fantasy Football Research Hub</h1>
        <p className="home-subtitle">
          I built this full-stack portfolio project with React, Flask, and PostgreSQL.
        </p>
      </div>
      <div className="welcome-actions">
        <Link className="ffrh-button" to="/players">Browse Players</Link>
        {!signedIn && (
          <p className="home-guest-note">
            Explore the sample catalog as a guest. <Link to="/login">Log in</Link> to save rankings.
          </p>
        )}
      </div>
    </section>
  );
};

export default WelcomeSection;
