// components/auth/RegisterForm.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../../style/RegisterForm.css';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const initialValues = {
  name: '',
  email: '',
  password: '',
};

function RegisterForm({ onSubmit }) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="register-form">
          <div className="form-group">
            <Field type="text" name="name" placeholder="Name" className="form-control" />
            <ErrorMessage name="name" component="div" className="error-message" />
          </div>
          <div className="form-group">
            <Field type="email" name="email" placeholder="Email" className="form-control" />
            <ErrorMessage name="email" component="div" className="error-message" />
          </div>
          <div className="form-group">
            <Field type="password" name="password" placeholder="Password" className="form-control" />
            <ErrorMessage name="password" component="div" className="error-message" />
          </div>
          <button type="submit" disabled={isSubmitting} className="register-button">
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default RegisterForm;
