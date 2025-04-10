import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../../style/EditReviewModal.css';

const EditReviewModal = ({
  review,
  onSubmit,
  onClose,
  isSubmitting,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit Review for {review.playerName}</h3>
        <Formik
          initialValues={{
            rank: review.ranking !== null ? review.ranking : '',
            content: review.content,
          }}
          validationSchema={Yup.object({
            rank: Yup.number()
              .min(1, 'Rank must be at least 1')
              .max(100, 'Rank must be at most 100')
              .required('Required'),
            content: Yup.string()
              .max(450, 'Review cannot exceed 450 characters')
              .required('Required'),
          })}
          onSubmit={onSubmit}
        >
          {() => (
            <Form className="edit-review-form">
              <div className="form-group">
                <label htmlFor="rank">Rank</label>
                <Field type="number" id="rank" name="rank" className="input-field" />
                <ErrorMessage name="rank" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label htmlFor="content">Review</label>
                <Field as="textarea" id="content" name="content" className="input-field" />
                <ErrorMessage name="content" component="div" className="error-message" />
              </div>
              <button type="submit" disabled={isSubmitting} className="submit-button">
                Update
              </button>
              <button type="button" onClick={onClose} className="cancel-button">
                Cancel
              </button>
            </Form>
          )}
        </Formik>
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default EditReviewModal;
