import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserById } from '../redux/slices/userSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';
import '../style/HomeStyle.css';

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.currentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userDetails = useSelector((state) => state.user.userDetails);
  const userLoadingStatus = useSelector((state) => state.user.status);
  const rankings = useSelector((state) => state.ranking.rankings);
  const players = useSelector((state) => state.player.players);

  const [showOverall, setShowOverall] = useState(true);

  // Mock News Data
  const mockNews = [
    {
      id: 1,
      title: 'Top Fantasy Football Strategies for This Season',
      content: 'Learn the top strategies to dominate your fantasy football league this season!',
      date: '2024-12-08',
    },
    {
      id: 2,
      title: 'Player Injuries to Watch Out For',
      content: 'Keep an eye on these key players and their injuries heading into Week 14.',
      date: '2024-12-07',
    },
    {
      id: 3,
      title: 'Breaking: Player Trade Rumors',
      content: 'Rumors are swirling about major trades involving star players!',
      date: '2024-12-06',
    },
  ];

  useEffect(() => {
    if (isAuthenticated && !userDetails && user && user.id) {
      dispatch(fetchUserById(user.id));
    }
    dispatch(fetchRankings());
  }, [isAuthenticated, userDetails, user, dispatch]);

  const handleAuthButtonClick = () => {
    navigate('/register');
  };

  const toggleList = () => {
    setShowOverall((prev) => !prev);
  };

  const top5Overall = [...rankings]
    ?.sort((a, b) => a.rank - b.rank)
    .slice(0, 5)
    .map((ranking) => players.find((player) => player.id === ranking.player_id));

  const top5User = [...rankings]
    ?.filter((ranking) => ranking.user_id === user?.id)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)
    .map((ranking) => players.find((player) => player.id === ranking.player_id));

  return (
    <div className="home-page">
      {/* User Info Card Positioned in the Top-Left */}
      {userLoadingStatus === 'loading' ? (
        <p className="loading-message">Loading user information...</p>
      ) : isAuthenticated && user ? (
        <div className="user-info-container">
          <div className="user-info-card">
            <div className="user-avatar">
              <img src={`https://i.pravatar.cc/100?u=${user?.id}`} alt="User Avatar" />
            </div>
            <div className="user-info-text">
              <p className="user-name">{user?.username || 'Loading...'}</p>
              <p className="user-email">{userDetails?.email || 'Unknown Email'}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="welcome-section">
        <h1 className="home-title">Welcome back to your Fantasy Football Portal!</h1>
        <h2 className="home-subtitle">Stay on top of the stats and make your best picks!</h2>
      </div>

      <div className="home-content">
        <div className="main-content">
          {!isAuthenticated && (
            <div className="auth-section">
              <p className="login-message">Please login or register to continue your journey.</p>
              <button className="auth-button" onClick={handleAuthButtonClick}>
                Register
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div className="news-section">
              <h3 className="news-title">News and Updates</h3>
              <ul className="news-list">
                {mockNews.map((article) => (
                  <li key={article.id} className="news-item">
                    <h4 className="news-article-title">{article.title}</h4>
                    <p className="news-article-date">{article.date}</p>
                    <p className="news-article-content">{article.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <div className="sidebar">
            <h3 className="sidebar-title">
              {showOverall ? 'Top 5 Overall Ranked Players' : 'Your Top 5 Ranked Players'}
            </h3>
            <button className="toggle-button" onClick={toggleList}>
              {showOverall ? 'Switch to Your Top 5' : 'Switch to Overall Top 5'}
            </button>
            <ul className="ranking-list">
              {(showOverall ? top5Overall : top5User)?.map((player, index) => (
                <li key={player?.id || index} className="ranking-item">
                  <span className="player-name">{player?.name || 'Unknown Player'}</span>{' '}
                  <span className="player-team">{player?.team || 'Unknown Team'}</span>{' '}
                  <span className="player-position">{player?.position || 'Unknown Position'}</span>{' '}
                  <span className="player-rank">Rank: {index + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
