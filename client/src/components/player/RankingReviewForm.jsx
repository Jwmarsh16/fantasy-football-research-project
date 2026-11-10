import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import '../../style/RankingReviewForm.css';

const reviewSchema = Yup.object({
  content: Yup.string().trim().max(450, 'Review cannot exceed 450 characters').required('Required'),
});

function RankingReviewForm({ maxRank, rankReady, signedIn, savedRank, onSaveRank, onRemoveRank, onPostReview }) {
  if (!signedIn) {
    return (
      <div className="ranking-review-form">
        <h2 className="form-title">Rank and review this player</h2>
        <p><Link to="/login">Log in</Link> to save a ranking or post a review.</p>
      </div>
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
    <div className="ranking-review-form">
      <h2 className="form-title">Rank and review this player</h2>
      <p role="status">
        {savedRank != null ? `Your saved rank is ${savedRank}.` : 'Save your own rank for this player.'}
      </p>
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
          <Form aria-label="Player ranking">
            <div className="form-group">
              <label htmlFor="rank">Rank</label>
              <Field type="number" id="rank" name="rank" className="input-field" disabled={!rankReady} />
              <ErrorMessage name="rank" component="div" className="error-message" />
            </div>
            {status && <p className="error-message" role="alert">{status}</p>}
            <div className="ranking-form-actions">
              <button type="submit" className="submit-button" disabled={isSubmitting || !rankReady}>
                Save ranking
              </button>
              {savedRank != null && (
                <button
                  type="button"
                  className="submit-button"
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
          <Form aria-label="Optional player review" className="optional-player-review">
            <div className="form-group">
              <label htmlFor="content">Review (optional)</label>
              <Field as="textarea" id="content" name="content" className="input-field" />
              <ErrorMessage name="content" component="div" className="error-message" />
            </div>
            {status?.success && <p className="success-message" role="status">{status.success}</p>}
            {status?.error && <p className="error-message" role="alert">{status.error}</p>}
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              Post review
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default RankingReviewForm;
