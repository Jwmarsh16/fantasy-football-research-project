// src/components/player/ReviewRankingList.jsx
import React from 'react';
import '../../style/ReviewRankingList.css';

const ReviewRankingList = ({ sortedReviews, getUsernameById }) => (
  <div className="reviews-rankings-display">
    <h3 className="section-title">Reviews and Rankings</h3>
    {sortedReviews && sortedReviews.length > 0 ? (
      sortedReviews.map((item, index) => (
        <div key={index} className="review-ranking-item">
          <div className="review-header">
            <p className="review-player">
              <span className="review-username">{getUsernameById(item.user_id)}</span>
              <span className="review-ranking"> - Rank: {item.rank !== null ? item.rank : 'N/A'}</span>
            </p>
          </div>
          <p className="review-content">{item.content}</p>
        </div>
      ))
    ) : (
      <p className="no-reviews-message">No reviews or rankings available.</p>
    )}
  </div>
);

export default ReviewRankingList;
