import { useId, useLayoutEffect, useRef } from 'react';
import '../../style/ReviewRow.css';

function ReviewRow({
  review,
  isExpanded,
  ownsProfile,
  openMenuReviewId,
  setOpenMenuReviewId,
  setEditingReview,
  handleDeleteReview,
  toggleReviewExpansion,
  updateRowHeight
}) {
  const rowRef = useRef(null);
  const contentId = useId();
  const isMenuOpen = openMenuReviewId === review.id;
  const playerDetails = [review.position, review.team].filter(Boolean).join(' · ');

  useLayoutEffect(() => {
    if (!updateRowHeight) return;

    const row = rowRef.current;
    // The virtual list needs each card's actual height after text wraps or expands.
    const measure = () => updateRowHeight(review.id, row.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [review.id, updateRowHeight]);

  return (
    <article className="review-row" ref={rowRef}>
      <header className="review-row__header">
        <div className="review-row__player-info">
          <h3 className="review-row__player-name">{review.playerName}</h3>
          {playerDetails && <p className="review-row__details">{playerDetails}</p>}
        </div>
        <p className="review-row__ranking">
          {review.ranking === null ? 'Unranked' : `Rank #${review.ranking}`}
        </p>
        {ownsProfile && (
          <div className="review-row__menu-container">
            <button
              type="button"
              className="review-row__menu-button"
              aria-label={`Review options for ${review.playerName}`}
              aria-expanded={isMenuOpen}
              onClick={() => setOpenMenuReviewId(isMenuOpen ? null : review.id)}
            >
              ⋮
            </button>
            {isMenuOpen && (
              <div className="review-row__menu">
                <button
                  type="button"
                  className="review-row__menu-item"
                  onClick={() => {
                    setEditingReview(review);
                    setOpenMenuReviewId(null);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="review-row__menu-item"
                  onClick={() => {
                    handleDeleteReview(review.id);
                    setOpenMenuReviewId(null);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <p id={contentId} className="review-row__content" hidden={!isExpanded}>{review.content}</p>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="ffrh-button ffrh-button--secondary review-row__toggle-button"
        onClick={() => toggleReviewExpansion(review.id)}
      >
        {isExpanded ? 'Hide Review' : 'Show Review'}
      </button>
    </article>
  );
}

export default ReviewRow;
