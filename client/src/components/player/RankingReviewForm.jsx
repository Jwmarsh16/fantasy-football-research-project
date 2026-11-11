import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import '../../style/RankingReviewForm.css';

const reviewSchema = Yup.object({
  content: Yup.string().trim().max(450, 'Review cannot exceed 450 characters').required('Required'),
});

function RankingReviewForm({ maxRank, rankReady, savedRank, onSaveRank, onRemoveRank }) {
  const { id } = useParams();
  const userId = useSelector(state => state.auth.currentUser?.id);

  if (!userId) {
    return (
      <section className="ranking-review-form" id="rank-player" aria-labelledby="rank-player-title" tabIndex={-1}>
        <h2 id="rank-player-title">Rank this player</h2>
        <p><Link to="/login" state={{ playerId: Number(id) }}>Log in</Link> to save a ranking or post a review.</p>
      </section>
    );
  }

  const rankSchema = Yup.object({
    rank: Yup.number()
      .integer('Enter a whole number')
      .min(1, 'Rank must be at least 1')
      .max(maxRank, `Rank must be at most ${maxRank}`)
      .required('Required'),
  });

  return (
    <section className="ranking-review-form" id="rank-player" aria-labelledby="rank-player-title" tabIndex={-1}>
      <h2 id="rank-player-title">Rank this player</h2>
      <div className="ranking-form-status">
        <p role="status">
          {savedRank != null ? `Your saved rank is ${savedRank}.` : 'Save your own rank for this player.'}
        </p>
        {savedRank != null && <Link to={`/profile/${userId}?tab=rankings`}>View My Rankings</Link>}
      </div>
      <Formik
        initialValues={{ rank: savedRank ?? '' }}
        enableReinitialize
        validationSchema={rankSchema}
        onSubmit={async ({ rank }, { setStatus }) => {
          setStatus(undefined);
          try {
            await onSaveRank(rank);
          } catch {
            setStatus('Could not save your ranking. Please try again.');
          }
        }}
      >
        {({ isSubmitting, status, setSubmitting, setStatus }) => (
          <Form aria-label="Player ranking" className="player-rank-form">
            <div className="player-form-field">
              <label htmlFor="rank">Rank</label>
              <Field
                type="number"
                id="rank"
                name="rank"
                className="ffrh-field"
                disabled={!rankReady}
                aria-describedby={rankReady ? 'rank-range' : undefined}
              />
              {rankReady && <p className="player-form-hint" id="rank-range">Enter a whole number from 1 to {maxRank}.</p>}
              <ErrorMessage name="rank" component="div" className="player-form-error" />
            </div>
            {status && <p className="player-form-error" role="alert">{status}</p>}
            <div className="ranking-form-actions">
              <button type="submit" className="ffrh-button" disabled={isSubmitting || !rankReady}>
                Save ranking
              </button>
              {savedRank != null && (
                <button
                  type="button"
                  className="ffrh-button ffrh-button--danger"
                  disabled={isSubmitting || !rankReady}
                  onClick={async () => {
                    setStatus(undefined);
                    setSubmitting(true);
                    try {
                      await onRemoveRank();
                    } catch {
                      setStatus('Could not remove your ranking. Please try again.');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  Remove ranking
                </button>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
}

export function PlayerReviewForm({ onPostReview }) {
  return (
    <section className="ranking-review-form" aria-labelledby="player-review-title">
      <h2 id="player-review-title">Write a review</h2>
      <Formik
        initialValues={{ content: '' }}
        validationSchema={reviewSchema}
        onSubmit={async ({ content }, { resetForm, setStatus }) => {
          setStatus(undefined);
          try {
            await onPostReview(content.trim());
            resetForm();
            setStatus({ success: 'Review posted.' });
          } catch {
            setStatus({ error: 'Could not post your review. Please try again.' });
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form aria-label="Optional player review">
            <div className="player-form-field">
              <label htmlFor="content">Review (optional)</label>
              <Field as="textarea" id="content" name="content" className="ffrh-field" rows={3} />
              <ErrorMessage name="content" component="div" className="player-form-error" />
            </div>
            {status?.success && <p role="status">{status.success}</p>}
            {status?.error && <p className="player-form-error" role="alert">{status.error}</p>}
            <button type="submit" className="ffrh-button ffrh-button--secondary" disabled={isSubmitting}>
              Post review
            </button>
          </Form>
        )}
      </Formik>
    </section>
  );
}

export default RankingReviewForm;
