// Login.jsx - Updated to use Axios and Redux for user login and navigate to profile page upon successful login
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);
  const currentUser = useSelector((state) => state.auth.currentUser); // To get the logged-in user's data

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(loginUser(values))
      .unwrap()
      .then((response) => {
        console.log('User successfully logged in:', response);
        // Assuming currentUser is set correctly in the auth state after login
        if (currentUser && currentUser.id) {
          navigate(`/profile/${currentUser.id}`); // Navigate to the user's specific profile page
        } else {
          navigate('/profile'); // Fallback if currentUser isn't loaded properly
        }
      })
      .catch((error) => {
        console.error('Login failed:', error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="login-page">
      <h2 className="login-title">Login</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <div className="form-field">
              <Field
                type="email"
                name="email"
                placeholder="Email"
                className="input-field"
              />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>
            <div className="form-field">
              <Field
                type="password"
                name="password"
                placeholder="Password"
                className="input-field"
              />
              <ErrorMessage name="password" component="div" className="error-message" />
            </div>
            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
      {authStatus === 'loading' && <p className="loading-message">Logging in...</p>}
      {authStatus === 'failed' && <p className="error-message">Error: {authError}</p>}
    </div>
  );
}

export default Login;
