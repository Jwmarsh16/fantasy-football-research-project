// src/components/profile/EditReviewModal.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../../style/EditReviewModal.css';

function EditReviewModal({
  editingReview,
  setEditingReview,
  dispatch,
  parsedUserId,
  updateRanking,
  updateReview,
  fetchReviews,
  fetchRankings
}) {
  // Guard: only render when there is a review to edit
  if (!editingReview) return null;

  // Use `rank` property (not `ranking`) if available
  const initialRank = editingReview.rank ?? '';

  return (
    <div className="modal-overlay">
      <Formik
        initialValues={{
          rank: initialRank,                       // updated: use editingReview.rank
          content: editingReview.content,
        }}
        validationSchema={Yup.object({
          rank: Yup.number().min(1).max(100).required('Required'),
          content: Yup.string().max(450).required('Required'),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (editingReview.ranking_id) {
              await dispatch(updateRanking({
                id: editingReview.ranking_id,
                player_id: editingReview.player_id,
                user_id: parsedUserId,
                rank: values.rank,
              })).unwrap();
            }
            await dispatch(updateReview({
              id: editingReview.id,
              player_id: editingReview.player_id,
              user_id: parsedUserId,
              content: values.content,
            })).unwrap();
            dispatch(fetchReviews());
            dispatch(fetchRankings());
            setEditingReview(null);
          } catch (error) {
            console.error('Failed to update review and ranking:', error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="edit-review-form">
            <h3>Edit Review for {editingReview.playerName}</h3>

            <div className="form-group">
              <label htmlFor="rank">Rank</label>
              <Field
                type="number"
                id="rank"
                name="rank"
                className="input-field"
              />
              <ErrorMessage name="rank" component="div" className="error-message" />
            </div>

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
