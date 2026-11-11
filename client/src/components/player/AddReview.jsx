import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { addReview } from '../../redux/slices/reviewSlice';
import '../../style/FormPage.css';

const validationSchema = Yup.object({
  reviewText: Yup.string()
    .trim()
    .min(10, 'Review must be at least 10 characters long')
    .max(450, 'Review cannot exceed 450 characters')
    .required('Review text is required'),
});

function AddReview() {
  const dispatch = useDispatch();
  const { playerId } = useParams();
  const currentUser = useSelector(state => state.auth.currentUser);

  if (!currentUser) {
    return <main className="form-page"><p><Link to="/login">Log in</Link> to post a review.</p></main>;
  }

  return (
    <main className="form-page">
      <h1 className="form-page-title">Add Review</h1>
      <Formik
        initialValues={{ reviewText: '' }}
        validationSchema={validationSchema}
        onSubmit={async ({ reviewText }, { resetForm, setStatus }) => {
          setStatus(undefined);
          try {
            await dispatch(addReview({
              player_id: Number(playerId),
              content: reviewText.trim(),
            })).unwrap();
            resetForm();
            setStatus({ success: 'Review posted.' });
          } catch {
            setStatus({ error: 'Could not post your review. Please try again.' });
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form className="form-panel">
            <div className="form-panel-field">
              <label htmlFor="reviewText">Review</label>
              <Field as="textarea" id="reviewText" name="reviewText" className="ffrh-field" rows={4} />
              <ErrorMessage name="reviewText" component="p" className="form-panel-error" />
            </div>
            {status?.success && <p role="status">{status.success}</p>}
            {status?.error && <p className="form-panel-error" role="alert">{status.error}</p>}
            <button type="submit" className="ffrh-button" disabled={isSubmitting}>Submit Review</button>
          </Form>
        )}
      </Formik>
    </main>
  );
}

export default AddReview;
