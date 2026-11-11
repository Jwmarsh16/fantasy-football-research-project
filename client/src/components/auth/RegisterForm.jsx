// components/auth/RegisterForm.jsx
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

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
      {({ isSubmitting, touched, errors }) => (
        <Form className="form-panel">
          <div className="form-panel-field">
            <label htmlFor="register-name">Name</label>
            <Field id="register-name" type="text" name="name" autoComplete="nickname" className="ffrh-field"
              aria-invalid={Boolean(touched.name && errors.name)}
              aria-describedby={touched.name && errors.name ? 'register-name-error' : undefined} />
            <ErrorMessage id="register-name-error" name="name" component="p" className="form-panel-error" />
          </div>
          <div className="form-panel-field">
            <label htmlFor="register-email">Email</label>
            <Field id="register-email" type="email" name="email" autoComplete="email" className="ffrh-field"
              aria-invalid={Boolean(touched.email && errors.email)}
              aria-describedby={touched.email && errors.email ? 'register-email-error' : undefined} />
            <ErrorMessage id="register-email-error" name="email" component="p" className="form-panel-error" />
          </div>
          <div className="form-panel-field">
            <label htmlFor="register-password">Password</label>
            <Field id="register-password" type="password" name="password" autoComplete="new-password" className="ffrh-field"
              aria-invalid={Boolean(touched.password && errors.password)}
              aria-describedby={touched.password && errors.password ? 'register-password-error' : undefined} />
            <ErrorMessage id="register-password-error" name="password" component="p" className="form-panel-error" />
          </div>
          <button type="submit" disabled={isSubmitting} className="ffrh-button">
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default RegisterForm;
