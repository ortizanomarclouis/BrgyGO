import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useAuth } from '../hooks';

function Dashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentRequests, setRecentRequests] = useState([
    { id: 1, type: 'Barangay Clearance', status: 'Approved', date: '2024-03-10', refNumber: 'BR-2024-0001' },
    { id: 2, type: 'Certificate of Residency', status: 'Under Review', date: '2024-03-12', refNumber: 'BR-2024-0002' },
    { id: 3, type: 'Barangay ID', status: 'Submitted', date: '2024-03-14', refNumber: 'BR-2024-0003' },
  ]);
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Barangay Health Drive', description: 'Free health checkup for all residents every Saturday', date: '2024-03-15' },
    { id: 2, title: 'Road Maintenance Update', description: 'Main Street will be under maintenance from March 20-25', date: '2024-03-14' },
    { id: 3, title: 'Community Cleanup Drive', description: 'Join us for the monthly community cleanup next Sunday', date: '2024-03-13' },
  ]);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your document request BR-2024-0001 has been approved', type: 'success', time: '2 hours ago' },
    { id: 2, message: 'New announcement: Road maintenance scheduled for next week', type: 'info', time: '1 day ago' },
    { id: 3, message: 'Your issue report has been acknowledged by staff', type: 'info', time: '3 days ago' },
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'request', label: 'My Request', icon: '📋' },
    { id: 'report', label: 'Report Issue', icon: '⚠️' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const userInitial = user?.fullName?.[0]?.toUpperCase() || 'U';

  return (
    <div className="dashboard-container">
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src="/Logo.png" alt="BrgyGO Logo" className="logo-icon" />
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
            <h2>Welcome, {user?.fullName || 'User'}</h2>
            <p>Manage your barangay services efficiently</p>
          </div>

          {/* Quick Actions Section */}
          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-btn request-btn" onClick={() => onNavigate('request')}>
                <span className="action-icon">📋</span>
                <span className="action-label">Request Document</span>
                <span className="action-desc">Apply for clearance, certificates, and more</span>
              </button>
              <button className="action-btn report-btn" onClick={() => onNavigate('report')}>
                <span className="action-icon">⚠️</span>
                <span className="action-label">Report Issue</span>
                <span className="action-desc">Report community problems and concerns</span>
              </button>
              <button className="action-btn announcement-btn" onClick={() => onNavigate('announcements')}>
                <span className="action-icon">📢</span>
                <span className="action-label">View Announcements</span>
                <span className="action-desc">Check latest barangay news and updates</span>
              </button>
              <button className="action-btn profile-btn" onClick={() => onNavigate('profile')}>
                <span className="action-icon">👤</span>
                <span className="action-label">Update Profile</span>
                <span className="action-desc">Manage your account and personal details</span>
              </button>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="dashboard-grid">
            {/* Recent Requests Card */}
            <div className="dashboard-card requests-card">
              <div className="card-header">
                <h3>📋 My Recent Requests</h3>
                <a href="#view-all" className="view-all">View All</a>
              </div>
              <div className="card-content">
                {recentRequests.map((request) => (
                  <div key={request.id} className="request-item">
                    <div className="request-info">
                      <div className="request-type">{request.type}</div>
                      <div className="request-ref">Ref: {request.refNumber}</div>
                    </div>
                    <div className={`status-badge status-${request.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {request.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements Card */}
            <div className="dashboard-card announcements-card">
              <div className="card-header">
                <h3>📢 Latest Announcements</h3>
              </div>
              <div className="card-content announcements-list">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="announcement-item">
                    <div className="announcement-title">{announcement.title}</div>
                    <div className="announcement-desc">{announcement.description}</div>
                    <div className="announcement-date">{announcement.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics Card */}
            <div className="dashboard-card stats-card">
              <div className="card-header">
                <h3>📊 Your Activity</h3>
              </div>
              <div className="card-content stats-content">
                <div className="stat-item">
                  <div className="stat-number">{recentRequests.length}</div>
                  <div className="stat-label">Total Requests</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{recentRequests.filter(r => r.status === 'Approved').length}</div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{recentRequests.filter(r => r.status === 'Under Review').length}</div>
                  <div className="stat-label">Under Review</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="notifications-section">
            <div className="section-header">
              <h3>🔔 Notifications</h3>
              <a href="#clear-all" className="clear-all">Clear All</a>
            </div>
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div key={notification.id} className={`notification-item notification-${notification.type}`}>
                  <div className="notification-icon">
                    {notification.type === 'success' ? '✓' : 'ℹ'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                  <button className="notification-close">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer"></div>
    </div>
  );
}

export default Dashboard;
