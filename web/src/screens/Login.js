import React, { useState } from 'react';
import './Login.css';

function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    // Mock login - navigate to dashboard
    onNavigate('dashboard', { email, name: 'Wyben' });
  };

  return (
    <div className="login-container">
      <div className="page-header">
        <div className="header-content">
          <img src="/Logo.jpg" alt="BrgyGO Logo" className="header-logo" />
          <h1>BrgyGO</h1>
        </div>
      </div>
      <div className="login-content">
        <div className="left-content">
          <div className="brgygo-logo">
            <img src="/Logo.jpg" alt="BrgyGO Logo" className="logo-icon-large" />
          </div>
          <h1 className="brgygo-title">BrgyGO</h1>
          <div className="left-text">
            <h2>Image</h2>
            <p>Lorem ipsum</p>
            <p>Lorem ipsum</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <img src="/Logo.jpg" alt="BrgyGO Logo" className="logo-image" />
            <p>Faster. Easier. Organized</p>
          </div>

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

            <button type="submit" className="signin-btn">
              Sign in
            </button>
          </form>

          <div className="login-links">
            <p>
              Don't have an account?{' '}
              <a href="#register" onClick={() => onNavigate('register')}>
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
  );
}

export default Login;
