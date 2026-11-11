// src/components/auth/LoginForm.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
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
        if (response && response.id) {
          const playerId = state?.playerId;
          const destination = Number.isSafeInteger(playerId) && playerId > 0 ? `/players/${playerId}` : '/';
          navigate(destination);
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
      {({ isSubmitting, touched, errors }) => (
        <Form className="form-panel">
          <div className="form-panel-field">
            <label htmlFor="login-email">Email</label>
            <Field id="login-email" type="email" name="email" autoComplete="email" className="ffrh-field"
              aria-invalid={Boolean(touched.email && errors.email)}
              aria-describedby={touched.email && errors.email ? 'login-email-error' : undefined} />
            <ErrorMessage id="login-email-error" name="email" component="p" className="form-panel-error" />
          </div>

          <div className="form-panel-field">
            <label htmlFor="login-password">Password</label>
            <Field id="login-password" type="password" name="password" autoComplete="current-password" className="ffrh-field"
              aria-invalid={Boolean(touched.password && errors.password)}
              aria-describedby={touched.password && errors.password ? 'login-password-error' : undefined} />
            <ErrorMessage id="login-password-error" name="password" component="p" className="form-panel-error" />
          </div>

          <button type="submit" disabled={isSubmitting} className="ffrh-button">
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          {authStatus === 'failed' && <p className="form-panel-error" role="alert">{authError}</p>}
        </Form>
      )}
    </Formik>
  );
}

export default LoginForm;
