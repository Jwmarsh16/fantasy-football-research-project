// Register.jsx - Integrated with Flask backend using Axios for user registration and navigating to login page after successful registration
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../redux/slices/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);

  const initialValues = {
    name: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(registerUser(values)).unwrap()
      .then((response) => {
        console.log('User successfully registered:', response);
        navigate('/login'); // Navigate to login page after successful registration
      })
      .catch((error) => {
        console.error('Registration failed:', error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div>
      <h2>Register</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <Field
                type="text"
                name="name"
                placeholder="Name"
              />
              <ErrorMessage name="name" component="div" className="error" />
            </div>
            <div>
              <Field
                type="email"
                name="email"
                placeholder="Email"
              />
              <ErrorMessage name="email" component="div" className="error" />
            </div>
            <div>
              <Field
                type="password"
                name="password"
                placeholder="Password"
              />
              <ErrorMessage name="password" component="div" className="error" />
            </div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </Form>
        )}
      </Formik>
      {authStatus === 'loading' && <p>Registering...</p>}
      {authStatus === 'failed' && <p>Error: {authError}</p>}
    </div>
  );
}

export default Register;
