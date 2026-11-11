import '../../style/ReviewRankingList.css';

function ReviewRankingList({ sortedReviews, getUsernameById }) {
  if (!sortedReviews.length) {
    return <p className="community-reviews-status">No reviews yet for this player.</p>;
  }

  return (
    <ul className="community-review-list" role="list">
      {sortedReviews.map(review => (
        <li key={review.id} className="community-review">
          <header className="community-review-meta">
            <strong>{getUsernameById(review.user_id)}</strong>
            {review.rank !== null && <span className="community-review-rank">Rank #{review.rank}</span>}
          </header>
          <p className="community-review-content">{review.content}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewRankingList;
