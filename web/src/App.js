import React, { useState } from 'react';
import './App.css';
import Login from './screens/Login';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'register', 'dashboard'
  const [user, setUser] = useState(null);

  const handleNavigate = (screen, userData = null) => {
    setCurrentScreen(screen);
    if (userData) {
      setUser(userData);
    }
  };

  return (
    <div className="App">
      {currentScreen === 'login' && <Login onNavigate={handleNavigate} />}
      {currentScreen === 'register' && <Register onNavigate={handleNavigate} />}
      {currentScreen === 'dashboard' && <Dashboard user={user} onNavigate={handleNavigate} />}
    </div>
  );
}

export default App;
