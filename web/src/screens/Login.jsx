import React, { useState } from 'react';
import './Login.css';
import { useLogin } from '../hooks';

function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { handleLogin, loading } = useLogin();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const result = await handleLogin(email, password, rememberMe);

    if (result.success) {
      onNavigate('dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">

      <div className="page-header">
        <div className="header-content">
          <img src="/Logo.png" alt="BrgyGO Logo" className="header-logo" />
          <h1>BrgyGO</h1>
        </div>
      </div>

      <div className="login-content">

        <div className="login-left">
          <div className="left-content">
            <div className="brgygo-logo">
              <img src="/Logo.png" alt="BrgyGO Logo" className="logo-icon-large" />
            </div>
            <h1 className="brgygo-title">Governance Reimagined</h1>
            <div className="left-text">
              <h2>For Modern Communities</h2>
              <p>Experience the future of barangay management with BrgyGO. Streamlined document requests, efficient issue reporting, and seamless</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-card">
            <div className="login-header">
              <img src="/Logo.png" alt="BrgyGO Logo" className="logo-image" />
              <p>Faster. Easier. Organized</p>
            </div>

            {error && (
              <div style={{
                color: '#e74c3c',
                backgroundColor: '#fdf2f2',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me</label>
              </div>

              <button type="submit" className="signin-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="login-links">
              <p>
                Don't have an account?{' '}
                <a href="#register" onClick={(e) => { e.preventDefault(); onNavigate('register'); }}>
                  Register here
                </a>
              </p>
              <a href="#forgot" className="forgot-link">
                Forgot password?
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;