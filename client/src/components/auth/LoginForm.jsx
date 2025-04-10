// src/components/auth/LoginForm.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import '../../style/LoginForm.css';

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);

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
        if (response && response.id) {
          navigate('/'); // Redirect to home
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
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="login-form">
          <div className="form-group">
            <Field type="email" name="email" placeholder="Email" className="form-control" />
            <ErrorMessage name="email" component="div" className="error-message" />
          </div>

          <div className="form-group">
            <Field type="password" name="password" placeholder="Password" className="form-control" />
            <ErrorMessage name="password" component="div" className="error-message" />
          </div>

          <button type="submit" disabled={isSubmitting} className="login-button">
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          {authStatus === 'loading' && <p>Logging in...</p>}
          {authStatus === 'failed' && <p className="error-message">Error: {authError}</p>}
        </Form>
      )}
    </Formik>
  );
}

export default LoginForm;
