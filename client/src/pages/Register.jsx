// src/pages/Register.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../redux/slices/authSlice';
import RegisterForm from '../components/auth/RegisterForm';
import '../style/RegisterStyle.css'; // Added new page stylesheet

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authStatus = useSelector((state) => state.auth.status);
  const authError = useSelector((state) => state.auth.error);

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page container"> {/* Wrapped in container */}
      <h2 className="page-title">Register</h2>
      <RegisterForm onSubmit={handleRegister} />
      {authStatus === 'loading' && <p className="status-message">Registering...</p>}
      {authStatus === 'failed' && <p className="error-message">Error: {authError}</p>}
    </div>
  );
}

export default Register;
