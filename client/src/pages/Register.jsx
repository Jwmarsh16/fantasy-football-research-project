// src/pages/Register.jsx
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerUser } from '../redux/slices/authSlice';
import RegisterForm from '../components/auth/RegisterForm';
import '../style/FormPage.css';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      navigate('/login', { state });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="form-page">
      <h1 className="form-page-title">Register</h1>
      <RegisterForm onSubmit={handleRegister} />
      {authStatus === 'failed' && <p className="form-panel-error" role="alert">{authError}</p>}
    </main>
  );
}

export default Register;
