// src/components/profile/ReviewRow.jsx
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
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const buttonRef = useRef(null);
  const collapsedMeasured = useRef(false);
  const expandedMeasured = useRef(false);

  useLayoutEffect(() => {
    // Measure collapsed height once
    if (!isExpanded && !collapsedMeasured.current) {
      if (headerRef.current && buttonRef.current) {
        const headerH = headerRef.current.getBoundingClientRect().height;
        const buttonH = buttonRef.current.getBoundingClientRect().height;
        const styles = getComputedStyle(buttonRef.current.parentElement);
        const margin =
          parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
        const collapsedTotal = headerH + buttonH + margin;
        updateRowHeight(index, collapsedTotal);
        collapsedMeasured.current = true;
      }
    }

    // Measure expanded height once
    if (isExpanded && !expandedMeasured.current) {
      if (
        headerRef.current &&
        contentRef.current &&
        buttonRef.current
      ) {
        const headerH = headerRef.current.getBoundingClientRect().height;
        const contentH = contentRef.current.scrollHeight;
        const buttonH = buttonRef.current.getBoundingClientRect().height;
        const styles = getComputedStyle(contentRef.current);
        const margin =
          parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
        const total = headerH + contentH + buttonH + margin;
        updateRowHeight(index, total);
        expandedMeasured.current = true;
      }
    }
  }, [isExpanded, index, updateRowHeight]);

  // ensure we never spread undefined
  const wrapperStyle = { ...(style || {}), overflow: 'visible' };

  return (
    <div
      className={`review-row${isExpanded ? ' expanded' : ''}`}
      style={wrapperStyle}
    >
      <div className="review-row__header" ref={headerRef}>
        <div className="review-row__player-info">
          <p className="review-row__player-name">
            {review.playerName}
          </p>
          <p className="review-row__details">
            {review.position} | {review.team}
          </p>
        </div>
        <p className="review-row__ranking">
          Ranking:&nbsp;
          {review.ranking !== null ? review.ranking : 'N/A'}
        </p>
        {currentUser?.id === parsedUserId && (
          <div className="review-row__menu-container">
            <button
              className="review-row__menu-button"
              onClick={() =>
                setOpenMenuReviewId(
                  openMenuReviewId === review.id ? null : review.id
                )
              }
            >
              ⋮
            </button>
            {openMenuReviewId === review.id && (
              <div className="review-row__menu">
                <button
                  className="review-row__menu-item"
                  onClick={() => {
                    setEditingReview(review);
                    setOpenMenuReviewId(null);
                  }}
                >
                  Edit
                </button>
                <button
                  className="review-row__menu-item"
                  onClick={() => {
                    handleDeleteReviewAndRanking(
                      review.id,
                      review.player_id
                    );
                    setOpenMenuReviewId(null);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="review-row__body">
        {isExpanded ? (
          <div
            className="review-row__content"
            ref={contentRef}
          >
            <p>{review.content}</p>
            <button
              ref={buttonRef}
              onClick={() =>
                toggleReviewExpansion(review.id)
              }
              className="review-row__toggle-button"
            >
              Hide Review
            </button>
          </div>
        ) : (
          <div className="review-row__content collapsed">
            <button
              ref={buttonRef}
              onClick={() =>
                toggleReviewExpansion(review.id)
              }
              className="review-row__toggle-button"
            >
              Show Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewRow;
