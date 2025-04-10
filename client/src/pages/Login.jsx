// src/pages/Login.jsx
import React from 'react';
import '../style/LoginStyle.css';
import LoginForm from '../components/auth/LoginForm';

function Login() {
  return (
    <div className="login-page">
      <h2 className="page-title">Login</h2>
      <LoginForm />
    </div>
  );
}

export default Login;
