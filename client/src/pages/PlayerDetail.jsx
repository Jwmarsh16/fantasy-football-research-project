// src/pages/PlayerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import {
  setPlayer, setReviews, setMaxRank
} from '../redux/slices/playerSlice';
import { fetchUsers } from '../redux/slices/userSlice';
import { addRanking, fetchRankings } from '../redux/slices/rankingSlice';
import { addReview, fetchReviews } from '../redux/slices/reviewSlice';

import PlayerInfoCard from '../components/player/PlayerInfoCard';
import RankingReviewForm from '../components/player/RankingReviewForm';
import SortDropdown from '../components/player/SortDropdown';
import ReviewRankingList from '../components/player/ReviewRankingList';

import '../style/PlayerDetailStyle.css';

const getPlayerHeadshot = (playerName) => {
  const formattedName = playerName.toLowerCase().replace(/ /g, "_");
  return `/images/players/${formattedName}.png`;
};

const formatStatKey = (key) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function PlayerDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const player = useSelector((state) => state.player.currentPlayer);
  const reviews = useSelector((state) => state.player.reviews);
  const rankings = useSelector((state) => state.ranking.rankings);
  const maxRank = useSelector((state) => state.player.maxRank);
  const users = useSelector((state) => state.user.users);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [sortOrder, setSortOrder] = useState('asc');
  const [showReviews, setShowReviews] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const playerResponse = await axios.get(`/api/players/${id}`);
        dispatch(setPlayer(playerResponse.data));

        const allPlayers = await axios.get('/api/players');
        dispatch(setMaxRank(allPlayers.data.length));

        if (!users.length) dispatch(fetchUsers());
      } catch (error) {
        console.error('Failed to fetch player data:', error);
        setError('Failed to fetch player data.');
      }
    }

    fetchData();
  }, [id, dispatch, users.length]);

  const handleCombinedSubmit = async (values, { resetForm }) => {
    if (!isAuthenticated || !currentUser) {
      setError('You must be logged in to add a ranking and review.');
      return;
    }

    try {
      await dispatch(addRanking({
        rank: values.rank,
        player_id: parseInt(id),
        user_id: currentUser.id,
      })).unwrap();

      await dispatch(addReview({
        content: values.content,
        player_id: parseInt(id),
        user_id: currentUser.id,
      })).unwrap();

      setSuccess('Ranking and review added successfully!');
      resetForm();
      dispatch(fetchRankings());
      dispatch(fetchReviews());

      const updatedPlayer = await axios.get(`/api/players/${id}`);
      dispatch(setPlayer(updatedPlayer.data));
    } catch (error) {
      console.error('Failed to add ranking and review:', error);
      setError('Failed to add ranking and review.');
    }
  };

  const handleToggleReviews = async () => {
    if (!showReviews) {
      try {
        const response = await axios.get('/api/reviews');
        const playerReviews = response.data.filter(
          (review) => review.player_id === parseInt(id)
        );
        dispatch(setReviews(playerReviews));
        dispatch(fetchRankings());
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setError('Failed to fetch reviews.');
      }
    }
    setShowReviews(!showReviews);
  };

  const getUsernameById = (userId) => {
    const user = users.find((user) => user.id === parseInt(userId));
    return user ? user.username : 'Unknown User';
  };

  const combined = reviews
    .filter((review) => review.player_id === parseInt(id))
    .map((review) => {
      const rankingObj = rankings.find(
        (ranking) =>
          ranking.player_id === review.player_id &&
          ranking.user_id === review.user_id
      );
      return {
        ...review,
        rank: rankingObj ? rankingObj.rank : null,
      };
    });

  const sortedReviews = [...combined].sort((a, b) => {
    const aRank = a.rank !== null ? a.rank : Infinity;
    const bRank = b.rank !== null ? b.rank : Infinity;
    return sortOrder === 'asc' ? aRank - bRank : bRank - aRank;
  });

  if (error) return <div className="error-message">{error}</div>;
  if (!player) return <div className="loading-message">Loading...</div>;

  return (
    <div className="player-detail-container">
      <PlayerInfoCard
        player={player}
        getPlayerHeadshot={getPlayerHeadshot}
        formatStatKey={formatStatKey}
      />

      <RankingReviewForm
        maxRank={maxRank}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onSubmit={handleCombinedSubmit}
        success={success}
      />

      <div className="toggle-reviews-section">
        <button className="toggle-button" onClick={handleToggleReviews}>
          {showReviews ? 'Hide Reviews and Rankings' : 'Show Reviews and Rankings'}
        </button>
      </div>

      {showReviews && (
        <>
          <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
          <ReviewRankingList sortedReviews={sortedReviews} getUsernameById={getUsernameById} />
        </>
      )}
    </div>
  );
}

export default PlayerDetail;
