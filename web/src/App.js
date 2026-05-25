import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './features/auth/Login';
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
  'login', 'register', 'dashboard', 'request', 'myrequests',
  'report', 'announcements', 'profile', 'requesthistory',
];

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');

  const normalizeHash = (hash) => hash?.replace(/^#/, '') || '';

  useEffect(() => {
    const targetScreen = normalizeHash(window.location.hash);
    if (availableScreens.includes(targetScreen)) {
      setCurrentScreen(targetScreen);
    } else {
      setCurrentScreen(isAuthenticated ? 'dashboard' : 'login');
    }
  }, [isAuthenticated]);

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

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('googleAuth') === 'true') {
    // Fetch the authenticated user from backend
    api.get('/api/auth/google/user').then(res => {
      localStorage.setItem('token', res.data.token || 'google-session');
      localStorage.setItem('user', JSON.stringify(res.data));
      setCurrentScreen('dashboard');
    }).catch(() => setCurrentScreen('login'));
  }
}, []);
  const handleNavigate = (screen) => {
    if (availableScreens.includes(screen)) {
      window.location.hash = `#${screen}`;
      setCurrentScreen(screen);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentScreen === 'login'          && <Login onNavigate={handleNavigate} />}
      {currentScreen === 'register'       && <Register onNavigate={handleNavigate} />}
      {currentScreen === 'dashboard'      && <Dashboard user={user} onNavigate={handleNavigate} />}
      {currentScreen === 'request'        && <RequestDocument onNavigate={handleNavigate} />}
      {currentScreen === 'myrequests'     && <RequestList onNavigate={handleNavigate} />}
      {currentScreen === 'report'         && <ReportIssue onNavigate={handleNavigate} />}
      {currentScreen === 'announcements'  && <Announcements onNavigate={handleNavigate} />}
      {currentScreen === 'profile'        && <Profile onNavigate={handleNavigate} />}
      {currentScreen === 'requesthistory' && <RequestHistory onNavigate={handleNavigate} />}
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