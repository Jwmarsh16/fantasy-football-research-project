// AddReview.jsx - Updated to use Formik, Yup, Axios, and Redux for adding reviews
import React from 'react';
import { useDispatch } from 'react-redux';
import { addReview } from '../slices/reviewSlice';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function AddReview() {
  const dispatch = useDispatch();
  const { playerId } = useParams();

  const initialValues = {
    reviewText: '',
  };

  const validationSchema = Yup.object({
    reviewText: Yup.string()
      .required('Review text is required')
      .min(10, 'Review must be at least 10 characters long'),
  });

  const handleSubmit = (values, { resetForm }) => {
    const newReview = {
      playerId: parseInt(playerId),
      content: values.reviewText,
    };
    dispatch(addReview(newReview));
    resetForm();
  };

  return (
    <div>
      <h2>Add Review</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <Field
                as="textarea"
                name="reviewText"
                placeholder="Write your review here..."
              />
              <ErrorMessage name="reviewText" component="div" className="error" />
            </div>
            <button type="submit" disabled={isSubmitting}>
              Submit Review
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AddReview;