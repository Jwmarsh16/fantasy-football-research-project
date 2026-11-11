// src/pages/Login.jsx
import { Link, useLocation } from 'react-router-dom';
import '../style/LoginStyle.css';
import '../style/LoginForm.css';
import LoginForm from '../components/auth/LoginForm';

function Login() {
  const { state } = useLocation();

  return (
    <div className="login-page container">            {/* Wrapped in container */}
      <h2 className="page-title">Login</h2>
      <LoginForm />
      <p className="footer-link">                      {/* Added footer call-to-action */}
        Don’t have an account?{' '}
        <Link to="/register" state={state}>Register here</Link>
      </p>
    </div>
  );
}

export default Login;
