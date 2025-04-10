import React, { useLayoutEffect, useRef } from 'react';
import '../../style/ReviewRow.css';

const ReviewRow = ({
  index,
  review,
  style,
  isExpanded,
  currentUser,
  parsedUserId,
  openMenuReviewId,
  toggleReviewExpansion,
  setOpenMenuReviewId,
  setEditingReview,
  handleDeleteReviewAndRanking,
  updateRowHeight
}) => {
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
          <div className="review-menu-container">
            <button
              className="review-menu-button"
              onClick={() =>
                setOpenMenuReviewId(openMenuReviewId === review.id ? null : review.id)
              }
            >
              ⋮
            </button>

            {openMenuReviewId === review.id && (
              <div className="review-menu">
                <button className="review-menu-item" onClick={() => {
                  setEditingReview(review);
                  setOpenMenuReviewId(null);
                }}>
                  Edit
                </button>
                <button className="review-menu-item" onClick={() => {
                  handleDeleteReviewAndRanking(review.id, review.player_id);
                  setOpenMenuReviewId(null);
                }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="review-condensed">
        {isExpanded ? (
          <div className="review-content" ref={contentRef}>
            <p><strong>Review:</strong> {review.content}</p>
            <button onClick={() => toggleReviewExpansion(review.id)} className="toggle-review-button">
              Hide Review
            </button>
          </div>
        ) : (
          <div className="review-content">
            <button onClick={() => toggleReviewExpansion(review.id)} className="toggle-review-button">
              Show Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewRow;
