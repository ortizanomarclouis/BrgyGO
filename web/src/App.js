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
 
  const normalizeHash = (hash) => hash?.replace(/^#/, '') || '';
 
  // ── Detect Google OAuth redirect ──────────────────────────────────────────
  // This effect runs ONCE on mount, before AuthContext has a chance to redirect
  // to login. It must run independently of isAuthenticated.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
 
    if (params.get('googleAuth') === 'true') {
      setGoogleLoading(true);
 
      // Remove the query param from the URL immediately so a refresh
      // or re-render doesn't re-trigger this flow.
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
 
      api.get('/api/auth/google/user')
        .then(res => {
          const { token, ...userData } = res.data;
          localStorage.setItem('token', token || 'google-session');
          localStorage.setItem('user', JSON.stringify(userData));
          // Update the AuthContext so the rest of the app knows the user is logged in
          if (loginWithGoogleData) loginWithGoogleData(userData);
          setCurrentScreen('dashboard');
        })
        .catch(err => {
          console.error('Google user fetch failed:', err);
          // Clear any partial state and send user to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentScreen('login');
        })
        .finally(() => setGoogleLoading(false));
 
      // Do NOT run the hash-based navigation while the Google fetch is in flight
      return;
    }
 
    // ── Normal hash-based navigation (non-Google flow) ──────────────────────
    const targetScreen = normalizeHash(window.location.hash);
    if (availableScreens.includes(targetScreen)) {
      setCurrentScreen(targetScreen);
    } else {
      // Only redirect to dashboard if auth is already resolved (not loading)
      // to avoid flashing login before the stored token is read.
      if (!loading) {
        setCurrentScreen(isAuthenticated ? 'dashboard' : 'login');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- intentionally empty: runs once on mount only
 
  // ── Separate effect: navigate to dashboard once auth resolves ─────────────
  // This handles the case where the app loads with a stored token (returning
  // user) and should land on the dashboard instead of the login screen.
  useEffect(() => {
    if (loading || googleLoading) return; // wait until auth state is known
 
    const params = new URLSearchParams(window.location.search);
    if (params.get('googleAuth') === 'true') return; // Google flow handles its own navigation
 
    const targetScreen = normalizeHash(window.location.hash);
    if (availableScreens.includes(targetScreen)) {
      setCurrentScreen(targetScreen);
    } else if (!isAuthenticated) {
      setCurrentScreen('login');
    } else if (isAuthenticated && currentScreen === 'login') {
      // Returning user with stored token — send to dashboard
      setCurrentScreen('dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);
 
  // ── Hash change listener (in-app navigation) ────────────────────────────
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
        <Login onNavigate={handleNavigate} />
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