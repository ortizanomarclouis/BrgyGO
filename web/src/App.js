import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './features/auth/Login';
import api from './hooks/api';
import OtpVerification from './features/auth/OtpVerification';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import RequestDocument from './features/document-request/RequestDocument';
import RequestList from './features/document-request/RequestList';
import ReportIssue from './features/issues/ReportIssue';
import Announcements from './features/announcements/Announcements';
import Profile from './features/auth/Profile';
import RequestHistory from './features/history/Requesthistory';
import { AuthProvider, useAuth } from './hooks';

const availableScreens = [
  'login', 'register', 'verify-otp', 'dashboard', 'request', 'myrequests',
  'report', 'announcements', 'profile', 'requesthistory',
];

function AppContent() {
  const { user, isAuthenticated, loading, loginWithGoogleData } = useAuth();

  const [currentScreen, setCurrentScreen] = useState('login');
  const [otpEmail, setOtpEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const normalizeHash = (hash) => hash?.replace(/^#/, '') || '';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // ── NEW: one-time token exchange (replaces the broken session-cookie flow) ──
    const googleToken = params.get('googleToken');
    if (googleToken) {
      setGoogleLoading(true);

      // Remove the query param from the URL immediately
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);

      api.get(`/api/auth/google/exchange?token=${googleToken}`)
        .then(res => {
          const { token, ...userData } = res.data;
          localStorage.setItem('token', token || 'google-session');
          localStorage.setItem('user', JSON.stringify(userData));
          if (loginWithGoogleData) loginWithGoogleData(userData);
          setCurrentScreen('dashboard');
        })
        .catch(err => {
          console.error('Google token exchange failed:', err);
          setGoogleError('Google sign-in failed. Please try again.');
          setCurrentScreen('login');
        })
        .finally(() => setGoogleLoading(false));

      return;
    }

    // ── Legacy: googleAuth=true (kept for backward compat, but now returns error) ──
    if (params.get('googleAuth') === 'true') {
      setGoogleLoading(true);
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);

      api.get('/api/auth/google/user')
        .then(res => {
          const { token, ...userData } = res.data;
          localStorage.setItem('token', token || 'google-session');
          localStorage.setItem('user', JSON.stringify(userData));
          if (loginWithGoogleData) loginWithGoogleData(userData);
          setCurrentScreen('dashboard');
        })
        .catch(err => {
          console.error('Google user fetch failed:', err);
          setGoogleError('Google sign-in failed. Please try again.');
          setCurrentScreen('login');
        })
        .finally(() => setGoogleLoading(false));

      return;
    }

    // ── Error from backend ──────────────────────────────────────────────────
    if (params.get('googleAuth') === 'error') {
      window.history.replaceState({}, '', window.location.origin + window.location.pathname);
      setGoogleError('Google sign-in failed. Please try again.');
      setCurrentScreen('login');
      return;
    }

    // ── Normal hash-based navigation ────────────────────────────────────────
    const targetScreen = normalizeHash(window.location.hash);
    if (availableScreens.includes(targetScreen)) {
      setCurrentScreen(targetScreen);
    } else {
      setCurrentScreen(isAuthenticated ? 'dashboard' : 'login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Hash change listener (in-app navigation)
  useEffect(() => {
    const onHashChange = () => {
      const targetScreen = normalizeHash(window.location.hash);
      if (availableScreens.includes(targetScreen)) {
        setCurrentScreen(targetScreen);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (screen, params = {}) => {
    if (availableScreens.includes(screen)) {
      if (screen === 'verify-otp' && params.email) {
        setOtpEmail(params.email);
      }
      window.location.hash = `#${screen}`;
      setCurrentScreen(screen);
    }
  };

  if (loading || googleLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontSize: '16px', color: '#555',
      }}>
        {googleLoading ? 'Signing in with Google…' : 'Loading…'}
      </div>
    );
  }

  return (
    <div className="App">
      {currentScreen === 'login' && (
        <Login onNavigate={handleNavigate} googleError={googleError} />
      )}
      {currentScreen === 'register' && (
        <Register onNavigate={handleNavigate} />
      )}
      {currentScreen === 'verify-otp' && (
        <OtpVerification
          email={otpEmail}
          onVerified={() => handleNavigate('dashboard')}
          onNavigate={handleNavigate}
        />
      )}
      {currentScreen === 'dashboard' && (
        <Dashboard user={user} onNavigate={handleNavigate} />
      )}
      {currentScreen === 'request' && (
        <RequestDocument onNavigate={handleNavigate} />
      )}
      {currentScreen === 'myrequests' && (
        <RequestList onNavigate={handleNavigate} />
      )}
      {currentScreen === 'report' && (
        <ReportIssue onNavigate={handleNavigate} />
      )}
      {currentScreen === 'announcements' && (
        <Announcements onNavigate={handleNavigate} />
      )}
      {currentScreen === 'profile' && (
        <Profile onNavigate={handleNavigate} />
      )}
      {currentScreen === 'requesthistory' && (
        <RequestHistory onNavigate={handleNavigate} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;