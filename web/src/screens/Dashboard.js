import React, { useState } from 'react';
import './Dashboard.css';

function Dashboard({ user, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'request', label: 'My Request', icon: '📋' },
    { id: 'report', label: 'Report Issue', icon: '⚠️' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    onNavigate('login');
  };

  const userInitial = user?.name?.[0]?.toUpperCase() || 'W';

  return (
    <div className="dashboard-container">
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
        <img src="/Logo.jpg" alt="BrgyGO Logo" className="logo-icon" />
          <h2>BrgyGO</h2>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="menu-item">
              <span className="menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="menu-label">{item.label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="#logout" onClick={handleLogout} className="menu-item logout">
            <span className="menu-icon">🚪</span>
            {sidebarOpen && <span className="menu-label">Logout</span>}
          </a>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          </div>

          <div className="header-center">
            <h1>Welcome Back, {user?.name || 'User'}</h1>
          </div>

          <div className="header-right">
            <div className="user-avatar">{userInitial}</div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-header">
            <h2>Wyben Gwapo</h2>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-placeholder"></div>
            </div>
            <div className="dashboard-card">
              <div className="card-placeholder"></div>
            </div>
            <div className="dashboard-card">
              <div className="card-placeholder"></div>
            </div>
            <div className="dashboard-card">
              <div className="card-placeholder"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer"></div>
    </div>
  );
}

export default Dashboard;
