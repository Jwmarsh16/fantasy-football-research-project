// components/profile/ReviewRow.jsx
import React, { useRef, useLayoutEffect } from 'react';
import '../../style/ReviewRow.css';

function ReviewRow({
  review,
  index,
  style,
  isExpanded,
  currentUser,
  parsedUserId,
  openMenuReviewId,
  setOpenMenuReviewId,
  setEditingReview,
  handleDeleteReviewAndRanking,
  toggleReviewExpansion,
  updateRowHeight
}) {
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    if (isExpanded && contentRef.current) {
      const headerHeight = 60;
      const buttonHeight = 30;
      const padding = 20;
      const contentHeight = contentRef.current.scrollHeight;
      const newHeight = headerHeight + contentHeight + buttonHeight + padding;
      updateRowHeight(index, newHeight);
    }
  }, [isExpanded, index, review.content, updateRowHeight]);

  return (
    <div className="review-ranking-item" style={{ ...style, overflow: 'visible' }}>
      <div className="review-header" style={{ position: 'relative' }}>
        <div className="review-player-info">
          <p className="review-player">{review.playerName}</p>
          <p className="player-details">{review.position} | {review.team}</p>
        </div>
        <p className="ranking-info" style={{ whiteSpace: 'nowrap' }}>
          <strong>Ranking:</strong> {review.ranking !== null ? review.ranking : 'N/A'}
        </p>

        {currentUser.id === parsedUserId && (
          <div className="review-menu-container" style={{ position: 'absolute', top: '5px', right: '5px' }}>
            <button
              className="review-menu-button"
              style={{ transform: 'translateY(-0.5em)' }}
              onClick={() => setOpenMenuReviewId(openMenuReviewId === review.id ? null : review.id)}
            >
              ⋮
            </button>
            {openMenuReviewId === review.id && (
              <div className="review-menu" style={{ top: '22px', right: '5px' }}>
                <button className="review-menu-item" onClick={() => { setEditingReview(review); setOpenMenuReviewId(null); }}>Edit</button>
                <button className="review-menu-item" onClick={() => { handleDeleteReviewAndRanking(review.id, review.player_id); setOpenMenuReviewId(null); }}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="review-condensed">
        {isExpanded ? (
          <div className="review-content" ref={contentRef}>
            <p><strong>Review:</strong> {review.content}</p>
            <button onClick={() => toggleReviewExpansion(review.id)} className="toggle-review-button">Hide Review</button>
          </div>
        ) : (
          <div className="review-content">
            <button onClick={() => toggleReviewExpansion(review.id)} className="toggle-review-button">Show Review</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewRow;
