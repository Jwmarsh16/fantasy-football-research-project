// src/pages/Login.jsx
import { Link, useLocation } from 'react-router-dom';
import '../style/FormPage.css';
import LoginForm from '../components/auth/LoginForm';

function Login() {
  const { state } = useLocation();

  return (
    <main className="form-page">
      <h1 className="form-page-title">Login</h1>
      <LoginForm />
      <p className="form-page-footer">
        Don’t have an account?{' '}
        <Link to="/register" state={state}>Register here</Link>
      </p>
    </main>
  );
}

export default Login;
