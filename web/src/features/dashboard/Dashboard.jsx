import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Dashboard.css';
import { useAuth } from '../../hooks';
import api from '../../hooks/api';

function Dashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentRequests, setRecentRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [staffRequests, setStaffRequests] = useState([]);
  const [staffIssues, setStaffIssues] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [activeStaffTab, setActiveStaffTab] = useState('requests');
  const [staffMessage, setStaffMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const NOTIF_KEY = `brgygoNotifications_${user?.id || 'guest'}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      setNotifications(stored ? JSON.parse(stored) : []);
    } catch {
      setNotifications([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications)); } catch {}
  }, [notifications, NOTIF_KEY]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNotification = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    setNotifications((current) => [
      { id, message, type, time: new Date().toLocaleTimeString() },
      ...current,
    ]);
  }, []);

  const formatStatusLabel = useCallback((status) =>
    status ? status.replace(/_/g, ' ') : '', []);

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (url.includes('|')) {
      const parts = url.split('|');
      if (parts.length >= 3) return `data:${parts[1]};base64,${parts[2]}`;
    }
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    return `${api.defaults.baseURL}${url}`;
  };

  const getLocalStorageJson = (key, defaultValue) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch { return defaultValue; }
  };

  const setLocalStorageJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  const notifyAnnouncementChanges = useCallback((fetchedAnnouncements) => {
    const META_KEY = `brgygoAnnouncementMeta_${user?.id}`;
    const storedMeta = getLocalStorageJson(META_KEY, {});
    const hasSeenBefore = Object.keys(storedMeta).length > 0;
    const updatedMeta = { ...storedMeta };
    (fetchedAnnouncements || []).forEach((a) => {
      if (!a?.id) return;
      const currentStamp = a.updatedAt
        ? new Date(a.updatedAt).toISOString()
        : a.createdAt ? new Date(a.createdAt).toISOString() : null;
      if (!currentStamp) return;
      const prev = storedMeta[a.id];
      if (hasSeenBefore) {
        if (!prev) addNotification(`📢 New announcement: ${a.title}`, 'info');
        else if (currentStamp !== prev) addNotification(`📢 Announcement updated: ${a.title}`, 'info');
      }
      updatedMeta[a.id] = currentStamp;
    });
    setLocalStorageJson(META_KEY, updatedMeta);
  }, [addNotification, user?.id]);

  const notifyRequestStatusChanges = useCallback((fetchedRequests) => {
    const META_KEY = `brgygoRequestStatusMeta_${user?.id}`;
    const storedMeta = getLocalStorageJson(META_KEY, {});
    const hasSeenBefore = Object.keys(storedMeta).length > 0;
    const updatedMeta = { ...storedMeta };
    (fetchedRequests || []).forEach((request) => {
      if (!request?.id) return;
      const currentStatus = request.status?.toString();
      const previousStatus = storedMeta[request.id];
      const label = formatStatusLabel(currentStatus);
      const ref = request.referenceNumber || `#${request.id}`;
      if (currentStatus) {
        if (!hasSeenBefore) {
          if (currentStatus !== 'SUBMITTED') addNotification(`📋 Your request ${ref} status: ${label}`, 'info');
        } else if (previousStatus && currentStatus !== previousStatus) {
          addNotification(`📋 Your request ${ref} is now: ${label}`, 'info');
          if (['APPROVED', 'COMPLETED', 'READY_FOR_RELEASE'].includes(currentStatus)) {
            addNotification(`📄 Your document for ${ref} is ready to download!`, 'success');
          }
        }
        updatedMeta[request.id] = currentStatus;
      }
    });
    setLocalStorageJson(META_KEY, updatedMeta);
  }, [addNotification, formatStatusLabel, user?.id]);

  const notifyIssueStatusChanges = useCallback((fetchedIssues) => {
    const META_KEY = `brgygoIssueStatusMeta_${user?.id}`;
    const storedMeta = getLocalStorageJson(META_KEY, {});
    const hasSeenBefore = Object.keys(storedMeta).length > 0;
    const updatedMeta = { ...storedMeta };
    (fetchedIssues || []).forEach((issue) => {
      if (!issue?.id) return;
      const currentStatus = issue.status?.toString();
      const previousStatus = storedMeta[issue.id];
      const label = formatStatusLabel(currentStatus);
      const ref = issue.trackingNumber || `#${issue.id}`;
      if (currentStatus) {
        if (!hasSeenBefore) {
          if (!['REPORTED'].includes(currentStatus)) addNotification(`⚠️ Your issue ${ref} status: ${label}`, 'info');
        } else if (previousStatus && currentStatus !== previousStatus) {
          addNotification(`⚠️ Your issue ${ref} is now: ${label}`, 'info');
        }
        updatedMeta[issue.id] = currentStatus;
      }
    });
    setLocalStorageJson(META_KEY, updatedMeta);
  }, [addNotification, formatStatusLabel, user?.id]);

  const notifyStaffNewActivity = useCallback((fetchedRequests, fetchedIssues) => {
    const REQ_META_KEY = 'brgygoStaffRequestMeta';
    const ISSUE_META_KEY = 'brgygoStaffIssueMeta';
    const storedReqMeta = getLocalStorageJson(REQ_META_KEY, {});
    const hasSeenRequests = Object.keys(storedReqMeta).length > 0;
    const updatedReqMeta = { ...storedReqMeta };
    (fetchedRequests || []).forEach((req) => {
      if (!req?.id) return;
      if (hasSeenRequests && !storedReqMeta[req.id]) {
        const name = req.requestorFullName || 'A resident';
        const type = req.documentType?.replace(/_/g, ' ') || 'document';
        addNotification(`📋 ${name} requested: ${type}`, 'info');
      }
      updatedReqMeta[req.id] = true;
    });
    setLocalStorageJson(REQ_META_KEY, updatedReqMeta);
    const storedIssueMeta = getLocalStorageJson(ISSUE_META_KEY, {});
    const hasSeenIssues = Object.keys(storedIssueMeta).length > 0;
    const updatedIssueMeta = { ...storedIssueMeta };
    (fetchedIssues || []).forEach((issue) => {
      if (!issue?.id) return;
      if (hasSeenIssues && !storedIssueMeta[issue.id]) {
        const name = issue.reportedByName || 'A resident';
        const cat = issue.category?.replace(/_/g, ' ') || 'issue';
        addNotification(`⚠️ ${name} reported: ${cat}`, 'info');
      }
      updatedIssueMeta[issue.id] = true;
    });
    setLocalStorageJson(ISSUE_META_KEY, updatedIssueMeta);
  }, [addNotification]);

  const fetchMyIssues = useCallback(async () => {
    if (isStaff) return;
    try {
      const userId = user?.id;
      const response = await api.get(`/api/issues${userId ? `?userId=${userId}` : ''}`);
      const issues = Array.isArray(response.data) ? response.data : [];
      setMyIssues(issues);
      notifyIssueStatusChanges(issues);
    } catch { setMyIssues([]); }
  }, [isStaff, user, notifyIssueStatusChanges]);

  const fetchStaffDashboardData = useCallback(async (shouldNotify = false) => {
    try {
      const [reqRes, issueRes] = await Promise.all([
        api.get('/api/requests/all'),
        api.get('/api/issues/all'),
      ]);
      const requests = reqRes.data || [];
      const issues = issueRes.data || [];

      // Only show active (non-completed, non-cancelled, non-rejected) requests on dashboard
      const activeRequests = Array.isArray(requests)
        ? requests.filter(r =>
            ['SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED', 'APPROVED', 'READY_FOR_RELEASE'].includes(r.status)
          )
        : [];

      setStaffRequests(activeRequests);
      setStaffIssues(Array.isArray(issues) ? issues : []);
      if (shouldNotify) notifyStaffNewActivity(requests, issues);
    } catch {
      setStaffRequests([]);
      setStaffIssues([]);
    }
  }, [notifyStaffNewActivity]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        try {
          const userId = user?.id;
          const res = await api.get(`/api/requests${userId ? `?userId=${userId}` : ''}`);
          if (res.data?.content) {
            const fetched = res.data.content.slice(0, 3);
            setRecentRequests(fetched);
            if (!isStaff) notifyRequestStatusChanges(fetched);
          }
        } catch {}
        try {
          const res = await api.get('/api/announcements');
          if (res.data?.content) {
            const fetched = res.data.content.slice(0, 3);
            setAnnouncements(fetched);
            if (!isStaff) notifyAnnouncementChanges(fetched);
          }
        } catch {}
        if (!isStaff) await fetchMyIssues();
        if (isStaff) await fetchStaffDashboardData(true);
      } catch {}
      finally { setLoading(false); }
    };
    fetchDashboardData();
  }, [user, isStaff, notifyAnnouncementChanges, notifyRequestStatusChanges, fetchMyIssues, fetchStaffDashboardData]);

  // Approve request and automatically generate the soft copy (resident pays before downloading)
  const handleApproveRequest = async (requestId) => {
    try {
      await api.put(`/api/requests/${requestId}/status`, {
        status: 'APPROVED',
        notes: 'Document approved. Soft copy is ready — resident will be prompted to pay before downloading.',
      });
      // Pre-generate the certificate so it's ready when resident pays
      try {
        await api.get(`/api/requests/${requestId}/certificate`);
      } catch {
        // Certificate generation failure is non-blocking
      }
      const msg = `Request #${requestId} approved. Resident can now pay and download their soft copy.`;
      setStaffMessage(msg);
      addNotification(`✅ ${msg}`, 'success');
      fetchStaffDashboardData(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to approve request.';
      setStaffMessage(msg);
      addNotification(msg, 'info');
    }
  };

  const handleRequestStatusChange = async (requestId, status) => {
    // Route approve through the dedicated handler
    if (status === 'APPROVED') {
      return handleApproveRequest(requestId);
    }
    try {
      await api.put(`/api/requests/${requestId}/status`, {
        status,
        notes: `Status changed to ${formatStatusLabel(status)} by staff`,
      });
      const msg = `Request #${requestId} marked as ${formatStatusLabel(status)}`;
      setStaffMessage(msg);
      addNotification(`📋 ${msg}`, 'success');
      fetchStaffDashboardData(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to update request status.';
      setStaffMessage(msg);
      addNotification(msg, 'info');
    }
  };

  const handleIssueStatusChange = async (issueId, status) => {
    try {
      await api.put(`/api/issues/${issueId}/status`, {
        status,
        notes: `Status changed to ${formatStatusLabel(status)} by staff`,
      });
      const msg = `Issue #${issueId} marked as ${formatStatusLabel(status)}`;
      setStaffMessage(msg);
      addNotification(`⚠️ ${msg}`, 'success');
      fetchStaffDashboardData(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to update issue status.';
      setStaffMessage(msg);
      addNotification(msg, 'info');
    }
  };

  const handleLogout = () => { logout(); onNavigate('login'); };

  const handleStaffQuickAction = (action) => {
    if (action === 'residentRequests') setActiveStaffTab('requests');
    else if (action === 'issueReports') setActiveStaffTab('issues');
    else if (action === 'manageAnnouncements') onNavigate('announcements');
    else if (action === 'requestHistory') onNavigate('requesthistory');
    else onNavigate('profile');
  };

  const handleClearNotifications = () => setNotifications([]);
  const handleRemoveNotification = (id) => setNotifications((c) => c.filter((n) => n.id !== id));

  const getIssueStatusClass = (status) => {
    if (!status) return 'status-reported';
    return `status-${status.toLowerCase().replace(/_/g, '-')}`;
  };

  // Different sidebar items for staff vs resident
  const residentMenuItems = [
    { id: 'dashboard',     label: 'Dashboard',     icon: '📊' },
    { id: 'myrequests',    label: 'My Requests',   icon: '📋' },
    { id: 'report',        label: 'Report Issue',  icon: '⚠️' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'profile',       label: 'Profile',       icon: '👤' },
  ];

  const staffMenuItems = [
    { id: 'dashboard',      label: 'Dashboard',       icon: '📊' },
    { id: 'requesthistory', label: 'Request History', icon: '📂' },
    { id: 'announcements',  label: 'Announcements',   icon: '📢' },
    { id: 'profile',        label: 'Profile',         icon: '👤' },
  ];

  const menuItems = isStaff ? staffMenuItems : residentMenuItems;
  const userInitial = user?.fullName?.[0]?.toUpperCase() || 'U';
  const unreadCount = notifications.length;

  return (
    <div className="dashboard-container">
      {/* ── Sidebar ── */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <img src="/Logo.png" alt="BrgyGO Logo" />
          </div>
          <h2>BrgyGO</h2>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="menu-item"
              onClick={(e) => { e.preventDefault(); onNavigate(item.id); }}>
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

      {/* ── Main ── */}
      <div className="dashboard-main">

        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          </div>
          <div className="header-center">
            <h1>Welcome Back, {user?.fullName || 'User'}</h1>
          </div>

          <div className="header-right">
            <div className="notif-wrapper" ref={notifRef}>
              <button className="notif-bell-btn" onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <span className="notif-dropdown-title">Notifications</span>
                    {notifications.length > 0 && (
                      <button className="notif-clear-btn" onClick={handleClearNotifications}>Clear all</button>
                    )}
                  </div>
                  <div className="notif-dropdown-body">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                          stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`notif-item notif-item-${n.type}`}>
                          <div className={`notif-item-dot dot-${n.type}`} />
                          <div className="notif-item-body">
                            <div className="notif-item-msg">{n.message}</div>
                            <div className="notif-item-time">{n.time}</div>
                          </div>
                          <button className="notif-item-close"
                            onClick={() => handleRemoveNotification(n.id)} title="Dismiss">✕</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="user-avatar" onClick={() => onNavigate('profile')} title="Go to Profile">
              {userInitial}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          <div className="content-header">
            <h2>Welcome, {user?.fullName || 'User'}</h2>
            <p>Manage your barangay services efficiently</p>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              {isStaff ? (
                <>
                  <button className="action-btn request-btn" onClick={() => handleStaffQuickAction('residentRequests')}>
                    <span className="action-icon">📑</span>
                    <span className="action-label">Resident Requests</span>
                    <span className="action-desc">Review and process active document requests</span>
                  </button>
                  <button className="action-btn report-btn" onClick={() => handleStaffQuickAction('issueReports')}>
                    <span className="action-icon">🚨</span>
                    <span className="action-label">Issue Reports</span>
                    <span className="action-desc">View and update resident issue reports</span>
                  </button>
                  <button className="action-btn announcement-btn" onClick={() => handleStaffQuickAction('manageAnnouncements')}>
                    <span className="action-icon">📣</span>
                    <span className="action-label">Manage Announcements</span>
                    <span className="action-desc">Create, view, and update announcements</span>
                  </button>
                  <button className="action-btn profile-btn" onClick={() => handleStaffQuickAction('requestHistory')}>
                    <span className="action-icon">📂</span>
                    <span className="action-label">Request History</span>
                    <span className="action-desc">View full history of all resident requests</span>
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

          {/* Dashboard Grid — RESIDENTS ONLY */}
          {!isStaff && (
            <div className="dashboard-grid">
              <div className="dashboard-card requests-card">
                <div className="card-header">
                  <h3>📋 My Recent Requests</h3>
                  <a href="#view-all" className="view-all"
                    onClick={(e) => { e.preventDefault(); onNavigate('myrequests'); }}>View All</a>
                </div>
                <div className="card-content">
                  {loading ? <div className="loading-state">Loading...</div>
                    : recentRequests.length === 0 ? <div className="empty-state">No requests yet</div>
                    : recentRequests.map((request) => (
                      <div key={request.id} className="request-item">
                        <div className="request-info">
                          <div className="request-type">{request.documentType?.replace(/_/g, ' ') || 'Document'}</div>
                          <div className="request-ref">Ref: {request.referenceNumber || request.refNumber}</div>
                        </div>
                        <div className={`status-badge status-${(request.status || '').toLowerCase().replace(/_/g, '-')}`}>
                          {formatStatusLabel(request.status)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="dashboard-card announcements-card">
                <div className="card-header"><h3>📢 Latest Announcements</h3></div>
                <div className="card-content announcements-list">
                  {loading ? <div className="loading-state">Loading...</div>
                    : announcements.length === 0 ? <div className="empty-state">No announcements</div>
                    : announcements.map((a) => (
                      <div key={a.id} className="announcement-item">
                        <div className="announcement-title">{a.title}</div>
                        <div className="announcement-desc">{a.description}</div>
                        <div className="announcement-date">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : a.date}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="dashboard-card stats-card">
                <div className="card-header"><h3>📊 Your Activity</h3></div>
                <div className="card-content stats-content">
                  <div className="stat-item">
                    <div className="stat-number">{recentRequests.length}</div>
                    <div className="stat-label">Total Requests</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {recentRequests.filter(r => ['APPROVED', 'COMPLETED', 'READY_FOR_RELEASE'].includes(r.status)).length}
                    </div>
                    <div className="stat-label">Approved</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {recentRequests.filter(r => (r.status || '').includes('REVIEW')).length}
                    </div>
                    <div className="stat-label">Under Review</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Issue Reports — RESIDENTS ONLY */}
          {!isStaff && (
            <div className="my-issues-section">
              <div className="card-header" style={{ marginBottom: '16px' }}>
                <h3>⚠️ My Issue Reports</h3>
                <button className="view-all"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => onNavigate('report')}>
                  Report New Issue
                </button>
              </div>
              {loading ? (
                <div className="status-message">Loading your issue reports...</div>
              ) : myIssues.length === 0 ? (
                <div className="dashboard-card" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
                  <p>You haven't reported any issues yet.</p>
                  <button className="action-btn report-btn"
                    style={{ display: 'inline-flex', marginTop: '12px', padding: '10px 20px' }}
                    onClick={() => onNavigate('report')}>
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
                          <div className="issue-category-badge">{issue.category?.replace(/_/g, ' ') || 'Issue'}</div>
                          <div className="issue-tracking">Tracking: {issue.trackingNumber || `#${issue.id}`}</div>
                        </div>
                        <div className={`issue-status-badge ${getIssueStatusClass(issue.status)}`}>
                          {formatStatusLabel(issue.status)}
                        </div>
                      </div>
                      <div className="issue-description">{issue.description}</div>
                      {issue.address && <div className="issue-address">📍 {issue.address}</div>}
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

          {/* Staff Control Center — STAFF/ADMIN ONLY */}
          {isStaff && (
            <div className="staff-dashboard-section">
              <div className="section-header staff-header">
                <h3>👷 Staff Control Center</h3>
                <div className="staff-tabs">
                  <button className={`staff-tab ${activeStaffTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveStaffTab('requests')}>
                    Resident Requests
                    {staffRequests.length > 0 && (
                      <span style={{
                        marginLeft: '8px', background: '#e74c3c', color: '#fff',
                        borderRadius: '999px', fontSize: '11px', padding: '1px 7px', fontWeight: 700,
                      }}>{staffRequests.length}</span>
                    )}
                  </button>
                  <button className={`staff-tab ${activeStaffTab === 'issues' ? 'active' : ''}`}
                    onClick={() => setActiveStaffTab('issues')}>
                    Issue Reports
                    {staffIssues.length > 0 && (
                      <span style={{
                        marginLeft: '8px', background: '#e74c3c', color: '#fff',
                        borderRadius: '999px', fontSize: '11px', padding: '1px 7px', fontWeight: 700,
                      }}>{staffIssues.length}</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="staff-card">
                {activeStaffTab === 'requests' ? (
                  <div className="staff-list">
                    {staffRequests.length === 0 ? (
                      <div className="empty-state">No active document requests.</div>
                    ) : staffRequests.map((request) => {
                      const isApproved = ['APPROVED', 'READY_FOR_RELEASE'].includes(request.status);
                      return (
                        <div key={request.id} className="staff-item staff-request-item">
                          <div className="staff-item-row">
                            <div>
                              <div className="staff-item-title">
                                {request.documentType?.replace(/_/g, ' ') || 'Document Request'}
                              </div>
                              <div className="staff-item-meta">
                                Requested by: <strong>{request.requestorFullName || 'N/A'}</strong>
                              </div>
                              <div className="staff-item-meta">
                                Status:{' '}
                                <span style={{
                                  padding: '2px 8px', borderRadius: '999px', fontSize: '12px',
                                  fontWeight: 700,
                                  background: isApproved ? '#d1fae5' : '#fef3c7',
                                  color: isApproved ? '#065f46' : '#92400e',
                                }}>
                                  {formatStatusLabel(request.status)}
                                </span>
                              </div>
                              <div className="staff-item-meta">Ref: {request.referenceNumber || `#${request.id}`}</div>
                            </div>
                            <div className="staff-actions">
                              {/* Only show In Progress if still submitted/under-review */}
                              {['SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED'].includes(request.status) && (
                                <button onClick={() => handleRequestStatusChange(request.id, 'UNDER_REVIEW')}>
                                  In Progress
                                </button>
                              )}
                              {/* Approve — triggers cert generation automatically */}
                              {!isApproved && (
                                <button
                                  style={{ background: '#2f9b44' }}
                                  onClick={() => handleRequestStatusChange(request.id, 'APPROVED')}
                                >
                                  ✅ Approve
                                </button>
                              )}
                              {/* Complete — only once approved */}
                              {isApproved && (
                                <button
                                  style={{ background: '#1a56db' }}
                                  onClick={() => handleRequestStatusChange(request.id, 'COMPLETED')}
                                >
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="staff-item-detail">
                            <div>Email: {request.requestorEmail || 'N/A'}</div>
                            <div>Address: {request.requestorAddress || 'N/A'}</div>
                            <div>Purpose: {request.purpose || 'N/A'}</div>
                            {isApproved && (
                              <div style={{
                                marginTop: '10px', padding: '8px 12px',
                                background: '#e6f4ea', borderRadius: '8px',
                                color: '#1b5e20', fontSize: '13px',
                              }}>
                                ✅ Soft copy is ready. Resident will be prompted to pay before downloading.
                              </div>
                            )}
                            {request.identityPhotoUrl && (
                              <div className="staff-item-image">
                                <strong>Identity photo submitted:</strong>
                                <img src={resolveMediaUrl(request.identityPhotoUrl)} alt="Identity" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="staff-list">
                    {staffIssues.length === 0 ? (
                      <div className="empty-state">No issue reports at the moment.</div>
                    ) : staffIssues.map((issue) => (
                      <div key={issue.id} className="staff-item staff-issue-item">
                        <div className="staff-item-row">
                          <div>
                            <div className="staff-item-title">{issue.category?.replace(/_/g, ' ') || 'Issue Report'}</div>
                            <div className="staff-item-meta">Raised by: <strong>{issue.reportedByName || 'N/A'}</strong></div>
                            <div className="staff-item-meta">Email: {issue.reportedByEmail || 'N/A'}</div>
                            <div className="staff-item-meta">Status: {formatStatusLabel(issue.status)}</div>
                            <div className="staff-item-meta">Tracking: {issue.trackingNumber || `#${issue.id}`}</div>
                          </div>
                          <div className="staff-actions">
                            <button onClick={() => handleIssueStatusChange(issue.id, 'IN_PROGRESS')}>In Progress</button>
                            <button onClick={() => handleIssueStatusChange(issue.id, 'RESOLVED')}>Done</button>
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
                    ))}
                  </div>
                )}
              </div>

              {/* View full history link */}
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button
                  onClick={() => onNavigate('requesthistory')}
                  style={{
                    background: 'none', border: '1px solid #d1d5db',
                    borderRadius: '8px', padding: '8px 16px',
                    cursor: 'pointer', fontSize: '13px', color: '#374151',
                  }}
                >
                  📂 View Full Request History →
                </button>
              </div>

              {staffMessage && <div className="staff-message" style={{ marginTop: '16px' }}>{staffMessage}</div>}
            </div>
          )}

        </div>
      </div>

      <div className="dashboard-footer"></div>
    </div>
  );
}

export default Dashboard;