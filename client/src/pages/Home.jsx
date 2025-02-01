import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserById } from '../redux/slices/userSlice';
import { fetchRankings } from '../redux/slices/rankingSlice';
import { fetchPlayers } from '../redux/slices/playerSlice'; // Ensure this exists in playerSlice.js
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

  useEffect(() => {
    if (isAuthenticated && !userDetails && user && user.id) {
      dispatch(fetchUserById(user.id));
    }
    dispatch(fetchRankings());
    dispatch(fetchPlayers()); // Ensure players are fetched initially
  }, [isAuthenticated, userDetails, user, dispatch]);

  const handleAuthButtonClick = () => {
    navigate('/register');
  };

  const toggleList = () => {
    setShowOverall((prev) => !prev);
  };

  const top5Overall = players.length > 0 && rankings.length > 0
    ? [...rankings]
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 5)
        .map((ranking) => players.find((player) => player.id === ranking.player_id))
    : [];

  const top5User = players.length > 0 && rankings.length > 0
    ? [...rankings]
        .filter((ranking) => ranking.user_id === user?.id)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 5)
        .map((ranking) => players.find((player) => player.id === ranking.player_id))
    : [];

  const mockNews = [
    {
      id: 1,
      title: "🚀 Fantasy Football Week 14: Must-Start Players",
      content:
        "Our experts break down the must-start players for this week, including a surprising breakout candidate at running back.",
      date: "2024-12-08",
      category: "Player Trends",
    },
    {
      id: 2,
      title: "🔄 Trade Rumors: Could This Star WR Be on the Move?",
      content:
        "Insider reports suggest a major trade could be happening soon. Find out how this could impact your fantasy team.",
      date: "2024-12-07",
      category: "Trade Rumors",
    },
    {
      id: 3,
      title: "🛑 Injury Report: Who’s Out for Week 14?",
      content:
        "Several big-name players are questionable heading into the week. See who's in, who's out, and how to adjust your lineup.",
      date: "2024-12-06",
      category: "Injury Report",
    },
    {
      id: 4,
      title: "🔥 Sleeper Picks: Under-the-Radar Players to Watch",
      content:
        "Looking for an edge? We highlight five sleeper picks who could deliver big performances this week.",
      date: "2024-12-05",
      category: "Sleeper Picks",
    },
    {
      id: 5,
      title: "📊 Fantasy Rankings Update: Who’s Climbing the Charts?",
      content:
        "Based on recent performances, some players are seeing major jumps in the rankings. Find out who’s trending up!",
      date: "2024-12-04",
      category: "Rankings",
    },
  ];

  return (
    <div className="home-page">
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
              <h3 className="news-title">🏈 Fantasy Football News & Updates</h3>
              <ul className="news-list">
                {mockNews.map((article) => (
                  <li key={article.id} className="news-item">
                    <h4 className="news-article-title">{article.title}</h4>
                    <p className="news-article-category"><strong>Category:</strong> {article.category}</p>
                    <p className="news-article-date">{article.date}</p>
                    <p className="news-article-content">{article.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;