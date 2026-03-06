import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './screens/Login';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import { AuthProvider, useAuth } from './hooks';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('login');
    }
  }, [isAuthenticated]);

  const handleNavigate = (screen, userData = null) => {
    setCurrentScreen(screen);
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
