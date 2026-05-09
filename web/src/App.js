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
import { AuthProvider, useAuth } from './hooks';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');
  const availableScreens = ['login', 'register', 'dashboard', 'request', 'myrequests', 'report', 'announcements', 'profile'];

  const normalizeHash = (hash) => {
    return hash?.replace(/^#/, '') || '';
  };

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

  const handleNavigate = (screen, userData = null) => {
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
      {currentScreen === 'login' && <Login onNavigate={handleNavigate} />}
      {currentScreen === 'register' && <Register onNavigate={handleNavigate} />}
      {currentScreen === 'dashboard' && <Dashboard user={user} onNavigate={handleNavigate} />}
      {currentScreen === 'request' && <RequestDocument onNavigate={handleNavigate} />}
      {currentScreen === 'myrequests' && <RequestList onNavigate={handleNavigate} />}
      {currentScreen === 'report' && <ReportIssue onNavigate={handleNavigate} />}
      {currentScreen === 'announcements' && <Announcements onNavigate={handleNavigate} />}
      {currentScreen === 'profile' && <Profile onNavigate={handleNavigate} />}
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
