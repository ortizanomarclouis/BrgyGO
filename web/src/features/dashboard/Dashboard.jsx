import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import { useAuth } from '../../hooks';
import api from '../../hooks/api';

function Dashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentRequests, setRecentRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [staffRequests, setStaffRequests] = useState([]);
  const [staffIssues, setStaffIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);          // FIX 3: resident issue reports
  const [activeStaffTab, setActiveStaffTab] = useState('requests');
  const [certificatePreview, setCertificatePreview] = useState('');
  const [staffMessage, setStaffMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const addNotification = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    setNotifications((current) => [
      { id, message, type, time: new Date().toLocaleTimeString() },
      ...current,
    ]);
  }, []);

  const formatStatusLabel = useCallback((status) => {
    return status ? status.replace(/_/g, ' ') : '';
  }, []);

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    // FIX: handle base64 stored data (filename|mimetype|base64data format)
    if (url.includes('|')) {
      const parts = url.split('|');
      if (parts.length >= 3) {
        const mimeType = parts[1];
        const base64Data = parts[2];
        return `data:${mimeType};base64,${base64Data}`;
      }
    }
    if (url.startsWith('data:') || url.startsWith('http')) {
      return url;
    }
    return `${api.defaults.baseURL}${url}`;
  };

  const getLocalStorageJson = (key, defaultValue) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const setLocalStorageJson = (key, value) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore localStorage failures
    }
  };

  const notifyAnnouncementChanges = useCallback((fetchedAnnouncements) => {
    const ANNOUNCEMENT_META_KEY = 'brgygoAnnouncementMeta';
    const storedMeta = getLocalStorageJson(ANNOUNCEMENT_META_KEY, {});
    const hasSeenAnnouncements = Object.keys(storedMeta).length > 0;
    const updatedMeta = { ...storedMeta };

    (fetchedAnnouncements || []).forEach((announcement) => {
      if (!announcement?.id) return;
      const currentStamp = announcement.updatedAt
        ? new Date(announcement.updatedAt).toISOString()
        : announcement.createdAt
        ? new Date(announcement.createdAt).toISOString()
        : null;
      if (!currentStamp) return;

      const previousStamp = storedMeta[announcement.id];
      if (hasSeenAnnouncements) {
        if (!previousStamp) {
          addNotification(`New announcement: ${announcement.title}`, 'info');
        } else if (currentStamp !== previousStamp) {
          addNotification(`Announcement updated: ${announcement.title}`, 'info');
        }
      }

      updatedMeta[announcement.id] = currentStamp;
    });

    setLocalStorageJson(ANNOUNCEMENT_META_KEY, updatedMeta);
  }, [addNotification]);

  // FIX 4: Improved notification logic — notifies on ANY status change, not just approved/completed
  const notifyRequestStatusChanges = useCallback((fetchedRequests) => {
    const REQUEST_STATUS_META_KEY = 'brgygoRequestStatusMeta';
    const storedMeta = getLocalStorageJson(REQUEST_STATUS_META_KEY, {});
    const hasSeenRequests = Object.keys(storedMeta).length > 0;
    const updatedMeta = { ...storedMeta };

    (fetchedRequests || []).forEach((request) => {
      if (!request?.id) return;
      const currentStatus = request.status?.toString();
      const previousStatus = storedMeta[request.id];
      const label = formatStatusLabel(currentStatus);
      const ref = request.referenceNumber || `#${request.id}`;

      if (currentStatus) {
        if (!hasSeenRequests) {
          // First load — notify about all non-submitted requests so resident knows current state
          if (currentStatus !== 'SUBMITTED') {
            addNotification(`Your request ${ref} status: ${label}`, 'info');
          }
        } else if (previousStatus && currentStatus && previousStatus !== currentStatus) {
          // Status changed — always notify
          addNotification(`Your request ${ref} is now: ${label}`, 'info');
          // Extra notification for ready-to-download statuses
          if (['APPROVED', 'COMPLETED', 'READY_FOR_RELEASE'].includes(currentStatus)) {
            addNotification(`📄 Your document for ${ref} is ready to download!`, 'success');
          }
        }
        updatedMeta[request.id] = currentStatus;
      }
    });

    setLocalStorageJson(REQUEST_STATUS_META_KEY, updatedMeta);
  }, [addNotification, formatStatusLabel]);

  // FIX 3: Fetch resident's own issue reports
  const fetchMyIssues = useCallback(async () => {
    if (isStaff) return;
    try {
      const userId = user?.id;
      const response = await api.get(`/api/issues${userId ? `?userId=${userId}` : ''}`);
      const issues = Array.isArray(response.data) ? response.data : [];
      setMyIssues(issues);
    } catch (err) {
      console.log('Could not fetch my issues:', err.message);
      setMyIssues([]);
    }
  }, [isStaff, user]);

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
            const fetchedRequests = requestsResponse.data.content.slice(0, 3);
            setRecentRequests(fetchedRequests);
            if (!isStaff) {
              notifyRequestStatusChanges(fetchedRequests);
            }
          }
        } catch (err) {
          console.log('Could not fetch requests:', err.message);
        }
        
        // Fetch announcements
        try {
          const announcementsResponse = await api.get('/api/announcements');
          if (announcementsResponse.data && announcementsResponse.data.content) {
            const fetchedAnnouncements = announcementsResponse.data.content.slice(0, 3);
            setAnnouncements(fetchedAnnouncements);
            if (!isStaff) {
              notifyAnnouncementChanges(fetchedAnnouncements);
            }
          }
        } catch (err) {
          console.log('Could not fetch announcements:', err.message);
        }

        // FIX 3: Fetch resident's issue reports
        if (!isStaff) {
          await fetchMyIssues();
        }

        if (isStaff) {
          await fetchStaffDashboardData();
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isStaff, notifyAnnouncementChanges, notifyRequestStatusChanges, fetchMyIssues]);

  const fetchStaffDashboardData = async () => {
    try {
      const [requestsResponse, issuesResponse] = await Promise.all([
        api.get('/api/requests/pending'),
        api.get('/api/issues/all'),
      ]);
      setStaffRequests(requestsResponse.data || []);
      setStaffIssues(issuesResponse.data || []);
    } catch (err) {
      console.error('Could not fetch staff dashboard data:', err.message);
      setStaffRequests([]);
      setStaffIssues([]);
    }
  };

  const handleRequestStatusChange = async (requestId, status) => {
    try {
      await api.put(`/api/requests/${requestId}/status`, {
        status,
        notes: `Status changed to ${formatStatusLabel(status)} by staff`,
      });
      const message = `Request ${requestId} marked ${formatStatusLabel(status)}`;
      setStaffMessage(message);
      addNotification(message, 'success');
      fetchStaffDashboardData();
    } catch (err) {
      console.error('Error updating request status:', err);
      const message = err.response?.data?.error || 'Unable to update request status.';
      setStaffMessage(message);
      addNotification(message, 'info');
    }
  };

  const handleIssueStatusChange = async (issueId, status) => {
    try {
      await api.put(`/api/issues/${issueId}/status`, {
        status,
        notes: `Status changed to ${formatStatusLabel(status)} by staff`,
      });
      const message = `Issue ${issueId} marked ${formatStatusLabel(status)}`;
      setStaffMessage(message);
      addNotification(message, 'success');
      fetchStaffDashboardData();
    } catch (err) {
      console.error('Error updating issue status:', err);
      const message = err.response?.data?.error || 'Unable to update issue status.';
      setStaffMessage(message);
      addNotification(message, 'info');
    }
  };

  const handleGenerateDocument = async (requestId) => {
    try {
      const response = await api.get(`/api/requests/${requestId}/certificate`);
      const previewText = response.data?.content || JSON.stringify(response.data, null, 2);
      setCertificatePreview(previewText);
      const message = `Soft copy ready for request ${requestId}`;
      setStaffMessage(message);
      addNotification(message, 'success');
    } catch (err) {
      console.error('Error generating certificate:', err);
      const message = err.response?.data?.error || 'Unable to generate document from template.';
      setStaffMessage(message);
      addNotification(message, 'info');
    }
  };

  const handleDownloadCertificate = () => {
    if (!certificatePreview) {
      return;
    }
    const blob = new Blob([certificatePreview], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document-preview.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

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

  const handleStaffQuickAction = (action) => {
    switch (action) {
      case 'residentRequests':
        setActiveStaffTab('requests');
        break;
      case 'issueReports':
        setActiveStaffTab('issues');
        break;
      case 'manageAnnouncements':
        onNavigate('announcements');
        break;
      case 'profile':
      default:
        onNavigate('profile');
        break;
    }
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleRemoveNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // FIX 3: Issue status badge color helper
  const getIssueStatusClass = (status) => {
    if (!status) return 'status-reported';
    const s = status.toLowerCase().replace(/_/g, '-');
    return `status-${s}`;
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
              {isStaff ? (
                <>
                  <button className="action-btn request-btn" onClick={() => handleStaffQuickAction('residentRequests')}>
                    <span className="action-icon">📑</span>
                    <span className="action-label">Resident Requests</span>
                    <span className="action-desc">View submitted document requests from residents</span>
                  </button>
                  <button className="action-btn report-btn" onClick={() => handleStaffQuickAction('issueReports')}>
                    <span className="action-icon">🚨</span>
                    <span className="action-label">Issue Reports</span>
                    <span className="action-desc">View resident issue reports and update status</span>
                  </button>
                  <button className="action-btn announcement-btn" onClick={() => handleStaffQuickAction('manageAnnouncements')}>
                    <span className="action-icon">📣</span>
                    <span className="action-label">Manage Announcements</span>
                    <span className="action-desc">Create, view, and update announcements</span>
                  </button>
                  <button className="action-btn profile-btn" onClick={() => handleStaffQuickAction('profile')}>
                    <span className="action-icon">👤</span>
                    <span className="action-label">Profile</span>
                    <span className="action-desc">Manage your account details</span>
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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
                        <div className="request-type">{request.documentType?.replace(/_/g, ' ') || request.type || 'Document'}</div>
                        <div className="request-ref">Ref: {request.referenceNumber || request.refNumber}</div>
                      </div>
                      <div className={`status-badge status-${(request.status || '').toLowerCase().replace(/_/g, '-')}`}>
                        {formatStatusLabel(request.status)}
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
                  <div className="stat-number">{recentRequests.filter(r => ['APPROVED','COMPLETED','READY_FOR_RELEASE'].includes(r.status)).length}</div>
                  <div className="stat-label">Approved</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{recentRequests.filter(r => (r.status || '').includes('REVIEW')).length}</div>
                  <div className="stat-label">Under Review</div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== FIX 3: MY ISSUE REPORTS — Resident Only ===== */}
          {!isStaff && (
            <div className="my-issues-section">
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <h3>⚠️ My Issue Reports</h3>
                <button
                  className="view-all"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => onNavigate('report')}
                >
                  Report New Issue
                </button>
              </div>

              {loading ? (
                <div className="status-message">Loading your issue reports...</div>
              ) : myIssues.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
                  <p>You haven't reported any issues yet.</p>
                  <button
                    className="action-btn report-btn"
                    style={{ display: 'inline-flex', marginTop: '12px', padding: '10px 20px' }}
                    onClick={() => onNavigate('report')}
                  >
                    <span className="action-icon" style={{ fontSize: '18px' }}>⚠️</span>
                    <span>Report an Issue</span>
                  </button>
                </div>
              ) : (
                <div className="issue-reports-grid">
                  {myIssues.map((issue) => (
                    <div key={issue.id} className="dashboard-card issue-report-card">
                      <div className="issue-card-top">
                        <div>
                          <div className="issue-category-badge">
                            {issue.category?.replace(/_/g, ' ') || 'Issue'}
                          </div>
                          <div className="issue-tracking">
                            Tracking: {issue.trackingNumber || `#${issue.id}`}
                          </div>
                        </div>
                        <div className={`issue-status-badge ${getIssueStatusClass(issue.status)}`}>
                          {formatStatusLabel(issue.status)}
                        </div>
                      </div>

                      <div className="issue-description">{issue.description}</div>

                      {issue.address && (
                        <div className="issue-address">📍 {issue.address}</div>
                      )}

                      <div className="issue-footer">
                        <span className={`issue-urgency urgency-${(issue.urgency || 'medium').toLowerCase()}`}>
                          {issue.urgency || 'MEDIUM'} urgency
                        </span>
                        <span className="issue-date">
                          {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      {issue.resolutionNotes && (
                        <div className="issue-resolution-notes">
                          <strong>Staff notes:</strong> {issue.resolutionNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Staff Control Center */}
          {isStaff && (
            <div className="staff-dashboard-section">
              <div className="section-header staff-header">
                <h3>👷 Staff Control Center</h3>
                <div className="staff-tabs">
                  <button
                    className={`staff-tab ${activeStaffTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveStaffTab('requests')}
                  >
                    Resident Requests
                  </button>
                  <button
                    className={`staff-tab ${activeStaffTab === 'issues' ? 'active' : ''}`}
                    onClick={() => setActiveStaffTab('issues')}
                  >
                    Issue Reports
                  </button>
                </div>
              </div>

              <div className="staff-card">
                {activeStaffTab === 'requests' ? (
                  <div className="staff-list">
                    {staffRequests.length === 0 ? (
                      <div className="empty-state">No pending document requests.</div>
                    ) : (
                      staffRequests.map((request) => (
                        <div key={request.id} className="staff-item staff-request-item">
                          <div className="staff-item-row">
                            <div>
                              <div className="staff-item-title">{request.documentType?.replace(/_/g, ' ') || 'Document Request'}</div>
                              {/* FIX 2: Display requestor name correctly */}
                              <div className="staff-item-meta">
                                Requested by: <strong>{request.requestorFullName || 'N/A'}</strong>
                              </div>
                              <div className="staff-item-meta">Status: {formatStatusLabel(request.status)}</div>
                              <div className="staff-item-meta">Ref: {request.referenceNumber || `#${request.id}`}</div>
                            </div>
                            <div className="staff-actions">
                              <button onClick={() => handleRequestStatusChange(request.id, 'UNDER_REVIEW')}>
                                In Progress
                              </button>
                              <button onClick={() => handleRequestStatusChange(request.id, 'APPROVED')}>
                                Approve
                              </button>
                              <button onClick={() => handleRequestStatusChange(request.id, 'COMPLETED')}>
                                Complete
                              </button>
                              <button onClick={() => handleGenerateDocument(request.id)}>
                                Send Copy
                              </button>
                            </div>
                          </div>
                          <div className="staff-item-detail">
                            <div>Email: {request.requestorEmail || 'N/A'}</div>
                            <div>Address: {request.requestorAddress || 'N/A'}</div>
                            <div>Purpose: {request.purpose || 'N/A'}</div>
                            {request.identityPhotoUrl && (
                              <div className="staff-item-image">
                                <strong>Identity photo submitted:</strong>
                                <img src={resolveMediaUrl(request.identityPhotoUrl)} alt="Identity" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="staff-list">
                    {staffIssues.length === 0 ? (
                      <div className="empty-state">No issue reports at the moment.</div>
                    ) : (
                      staffIssues.map((issue) => (
                        <div key={issue.id} className="staff-item staff-issue-item">
                          <div className="staff-item-row">
                            <div>
                              <div className="staff-item-title">
                                {issue.category?.replace(/_/g, ' ') || 'Issue Report'}
                              </div>
                              {/* FIX 2: Use correct field names from IssueDTO */}
                              <div className="staff-item-meta">
                                Raised by: <strong>{issue.reportedByName || issue.reporterFullName || 'N/A'}</strong>
                              </div>
                              <div className="staff-item-meta">
                                Email: {issue.reportedByEmail || issue.reporterEmail || 'N/A'}
                              </div>
                              <div className="staff-item-meta">Status: {formatStatusLabel(issue.status)}</div>
                              <div className="staff-item-meta">Tracking: {issue.trackingNumber || `#${issue.id}`}</div>
                            </div>
                            <div className="staff-actions">
                              <button onClick={() => handleIssueStatusChange(issue.id, 'IN_PROGRESS')}>
                                In Progress
                              </button>
                              <button onClick={() => handleIssueStatusChange(issue.id, 'RESOLVED')}>
                                Done
                              </button>
                            </div>
                          </div>
                          <div className="staff-item-detail">
                            <div>Description: {issue.description || 'No details provided'}</div>
                            <div>Address: {issue.address || 'N/A'}</div>
                            <div>Urgency: {issue.urgency || 'N/A'}</div>
                            {issue.proofImageUrl && (
                              <div className="staff-item-image">
                                <strong>Proof image:</strong>
                                <img src={resolveMediaUrl(issue.proofImageUrl)} alt="Issue proof" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {certificatePreview && (
                <div className="certificate-preview">
                  <div className="certificate-preview-header">
                    <h4>Document Preview</h4>
                    <button className="download-button" onClick={handleDownloadCertificate}>
                      Download Copy
                    </button>
                  </div>
                  <pre>{certificatePreview}</pre>
                </div>
              )}

              {staffMessage && <div className="staff-message">{staffMessage}</div>}
            </div>
          )}

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