// src/components/profile/EditReviewModal.jsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../../style/EditReviewModal.css';

function EditReviewModal({
  editingReview,
  setEditingReview,
  dispatch,
  updateReview,
  fetchReviews
}) {
  // Guard: only render when there is a review to edit
  if (!editingReview) return null;

  return (
    <div className="modal-overlay">
      <Formik
        initialValues={{
          content: editingReview.content,
        }}
        validationSchema={Yup.object({
          content: Yup.string().trim().max(450).required('Required'),
        })}
        onSubmit={async ({ content }, { setStatus }) => {
          setStatus(undefined);
          try {
            await dispatch(updateReview({
              id: editingReview.id,
              content: content.trim(),
            })).unwrap();
            dispatch(fetchReviews());
            setEditingReview(null);
          } catch {
            setStatus('Could not update your review. Please try again.');
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form className="edit-review-form">
            <h3>Edit Review for {editingReview.playerName}</h3>

            <div className="form-group">
              <label htmlFor="content">Review</label>
              <Field
                as="textarea"
                id="content"
                name="content"
                className="input-field"
              />
              <ErrorMessage name="content" component="div" className="error-message" />
            </div>

            {status && <p className="error-message" role="alert">{status}</p>}
            <div className="form-actions">
              <button type="submit" disabled={isSubmitting} className="submit-button">
                Update
              </button>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default EditReviewModal;
