import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from './api';

function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching user data...");
        const data = await getUserById(id);
        console.log("User data fetched:", data);
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to fetch user data.");
      }
    }
    fetchData();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.username}'s Profile</h1>
      <p>Email: {user.email}</p>
      <h2>Reviews</h2>
      <ul>
        {user.reviews.map(review => (
          <li key={review.id}>
            {review.content} (Player ID: {review.player_id})
          </li>
        ))}
      </ul>
      <h2>Rankings</h2>
      <ul>
        {user.rankings.map(ranking => (
          <li key={ranking.id}>
            Player ID: {ranking.player_id}, Rank: {ranking.rank}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserProfile;
