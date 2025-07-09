// src/pages/Login.jsx
import React from 'react';
import { Link } from 'react-router-dom';               /* Added Link import */
import '../style/LoginStyle.css';
import '../style/LoginForm.css';
import LoginForm from '../components/auth/LoginForm';

function Login() {
  return (
    <div className="login-page container">            {/* Wrapped in container */}
      <h2 className="page-title">Login</h2>
      <LoginForm />
      <p className="footer-link">                      {/* Added footer call-to-action */}
        Don’t have an account?{' '}
        <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
