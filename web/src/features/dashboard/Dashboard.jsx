import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { useAuth } from '../../hooks';
import api from '../../hooks/api';

function Dashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentRequests, setRecentRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent document requests
        try {
          const userId = user?.id;
          const requestsResponse = await api.get(`/api/requests${userId ? `?userId=${userId}` : ''}`);
          if (requestsResponse.data && requestsResponse.data.content) {
            setRecentRequests(requestsResponse.data.content.slice(0, 3));
          }
        } catch (err) {
          console.log('Could not fetch requests:', err.message);
        }
        
        // Fetch announcements
        try {
          const announcementsResponse = await api.get('/api/announcements');
          if (announcementsResponse.data && announcementsResponse.data.content) {
            setAnnouncements(announcementsResponse.data.content.slice(0, 3));
          }
        } catch (err) {
          console.log('Could not fetch announcements:', err.message);
        }
        
        // Initialize with empty notifications (can be enhanced to fetch from API later)
        setNotifications([]);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'myrequests', label: 'My Request', icon: '📋' },
    { id: 'report', label: 'Report Issue', icon: '⚠️' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleRemoveNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
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
            <a
              key={item.id}
              href={`#${item.id}`}
              className="menu-item"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
            >
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
            <h1>Welcome Back, {user?.fullName || 'User'}</h1>
          </div>

          <div className="header-right">
            <button 
              className="user-avatar" 
              onClick={() => onNavigate('profile')}
              title="Go to Profile"
            >
              {userInitial}
            </button>
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
                <a href="#view-all" className="view-all" onClick={(e) => { e.preventDefault(); onNavigate('myrequests'); }}>View All</a>
              </div>
              <div className="card-content">
                {loading ? (
                  <div className="loading-state">Loading...</div>
                ) : recentRequests.length === 0 ? (
                  <div className="empty-state">No requests yet</div>
                ) : (
                  recentRequests.map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-info">
                        <div className="request-type">{request.documentType || request.type || 'Document'}</div>
                        <div className="request-ref">Ref: {request.referenceNumber || request.refNumber}</div>
                      </div>
                      <div className={`status-badge status-${(request.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                        {request.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Announcements Card */}
            <div className="dashboard-card announcements-card">
              <div className="card-header">
                <h3>📢 Latest Announcements</h3>
              </div>
              <div className="card-content announcements-list">
                {loading ? (
                  <div className="loading-state">Loading...</div>
                ) : announcements.length === 0 ? (
                  <div className="empty-state">No announcements</div>
                ) : (
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="announcement-item">
                      <div className="announcement-title">{announcement.title}</div>
                      <div className="announcement-desc">{announcement.description}</div>
                      <div className="announcement-date">
                        {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : announcement.date}
                      </div>
                    </div>
                  ))
                )}
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
                  <div className="stat-number">{recentRequests.filter(r => (r.status || '').toLowerCase().includes('approved')).length}</div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{recentRequests.filter(r => (r.status || '').toLowerCase().includes('review')).length}</div>
                  <div className="stat-label">Under Review</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="notifications-section">
            <div className="section-header">
              <h3>🔔 Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  className="clear-all" 
                  onClick={handleClearNotifications}
                  style={{ cursor: 'pointer' }}
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-notifications">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className={`notification-item notification-${notification.type}`}>
                    <div className="notification-icon">
                      {notification.type === 'success' ? '✓' : 'ℹ'}
                    </div>
                    <div className="notification-content">
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{notification.time}</div>
                    </div>
                    <button 
                      className="notification-close"
                      onClick={() => handleRemoveNotification(notification.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer"></div>
    </div>
  );
}

export default Dashboard;
