import React, { useState } from 'react';
import './Login.css';
import { useLogin } from '../../hooks';

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
    } else if (result.requiresVerification && result.email) {
      onNavigate('verify-otp', { email: result.email });
    } else {
      setError(result.error || 'Login failed');
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

            <div className="oauth-divider">
              <span>or</span>
            </div>

            <a
              href="https://it342-ortizano-brgygo-production.up.railway.app/oauth2/authorization/google"
              className="google-btn"
            >


              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
                Continue with Google
            </a>

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