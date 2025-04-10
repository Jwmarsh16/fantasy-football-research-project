// src/components/player/RankingReviewForm.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../../style/RankingReviewForm.css';

const RankingReviewForm = ({ maxRank, isAuthenticated, onSubmit, success, currentUser }) => {
  const validationSchema = Yup.object({
    rank: Yup.number()
      .min(1, 'Rank must be at least 1')
      .max(maxRank, `Rank must be at most ${maxRank}`)
      .required('Required'),
    content: Yup.string()
      .max(450, 'Review cannot exceed 450 characters')
      .required('Required'),
  });

  return (
    <div className="ranking-review-form">
      <h2 className="form-title">Add a Rank and Review</h2>
      {success && <p className="success-message">{success}</p>}
      {!isAuthenticated || !currentUser ? (
        <p className="error-message">Please log in to add rankings and reviews.</p>
      ) : (
        <Formik
          initialValues={{ rank: '', content: '' }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form className="player-review-form">
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
            <button type="submit" className="submit-button">Add Rank and Review</button>
          </Form>
        </Formik>
      )}
    </div>
  );
};

export default RankingReviewForm;
