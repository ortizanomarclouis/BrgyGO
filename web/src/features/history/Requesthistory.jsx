import React, { useEffect, useState, useCallback } from 'react';
import './Requesthistory.css';
import api from '../../hooks/api';

const STATUS_COLORS = {
  SUBMITTED: 'status-submitted',
  UNDER_REVIEW: 'status-under-review',
  ADDITIONAL_DOCUMENTS_REQUIRED: 'status-additional',
  APPROVED: 'status-approved',
  READY_FOR_RELEASE: 'status-ready',
  COMPLETED: 'status-completed',
  REJECTED: 'status-rejected',
  CANCELLED: 'status-cancelled',
};

const ALL_STATUSES = [
  'ALL',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'READY_FOR_RELEASE',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
];

const ALL_DOC_TYPES = [
  'ALL',
  'BARANGAY_CLEARANCE',
  'CERTIFICATE_OF_INDIGENCY',
  'CERTIFICATE_OF_RESIDENCY',
];

function formatLabel(str) {
  return str ? str.replace(/_/g, ' ') : '';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function RequestHistory({ onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const [expandedId, setExpandedId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/requests/all');
      const data = Array.isArray(res.data) ? res.data : [];
      setRequests(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Unable to load request history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    let result = [...requests];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        (r.requestorFullName || '').toLowerCase().includes(q) ||
        (r.requestorEmail || '').toLowerCase().includes(q) ||
        (r.referenceNumber || '').toLowerCase().includes(q) ||
        (r.purpose || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.status === statusFilter);
    }

    if (docTypeFilter !== 'ALL') {
      result = result.filter(r => r.documentType === docTypeFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'name') return (a.requestorFullName || '').localeCompare(b.requestorFullName || '');
      return 0;
    });

    setFiltered(result);
  }, [requests, search, statusFilter, docTypeFilter, sortBy]);

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  // Summary counts
  const counts = {
    total: requests.length,
    pending: requests.filter(r => ['SUBMITTED', 'UNDER_REVIEW'].includes(r.status)).length,
    approved: requests.filter(r => ['APPROVED', 'READY_FOR_RELEASE', 'COMPLETED'].includes(r.status)).length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <div className="rh-page">
      {/* Header */}
      <div className="rh-header">
        <div className="rh-header-left">
          <button className="rh-back-btn" onClick={() => onNavigate('dashboard')}>
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="rh-title">Request History</h1>
            <p className="rh-subtitle">All document requests submitted by residents</p>
          </div>
        </div>
        <button className="rh-refresh-btn" onClick={fetchAll} title="Refresh">
          ↻ Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="rh-summary-grid">
        <div className="rh-summary-card rh-total">
          <span className="rh-summary-num">{counts.total}</span>
          <span className="rh-summary-label">Total Requests</span>
        </div>
        <div className="rh-summary-card rh-pending">
          <span className="rh-summary-num">{counts.pending}</span>
          <span className="rh-summary-label">Pending</span>
        </div>
        <div className="rh-summary-card rh-approved">
          <span className="rh-summary-num">{counts.approved}</span>
          <span className="rh-summary-label">Approved / Done</span>
        </div>
        <div className="rh-summary-card rh-rejected">
          <span className="rh-summary-num">{counts.rejected}</span>
          <span className="rh-summary-label">Rejected</span>
        </div>
      </div>

      {/* Filters */}
      <div className="rh-filters">
        <input
          className="rh-search"
          type="text"
          placeholder="Search by name, email, reference, or purpose…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="rh-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : formatLabel(s)}</option>
          ))}
        </select>
        <select className="rh-select" value={docTypeFilter} onChange={e => setDocTypeFilter(e.target.value)}>
          {ALL_DOC_TYPES.map(t => (
            <option key={t} value={t}>{t === 'ALL' ? 'All Document Types' : formatLabel(t)}</option>
          ))}
        </select>
        <select className="rh-select rh-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="rh-results-count">
          Showing <strong>{filtered.length}</strong> of <strong>{requests.length}</strong> requests
        </p>
      )}

      {/* States */}
      {loading && <div className="rh-state-msg">Loading request history…</div>}
      {error && <div className="rh-state-msg rh-error">{error}</div>}

      {/* Table */}
      {!loading && !error && (
        <div className="rh-table-wrapper">
          {filtered.length === 0 ? (
            <div className="rh-empty">
              <div className="rh-empty-icon">📂</div>
              <p>No requests match your filters.</p>
            </div>
          ) : (
            <table className="rh-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Document Type</th>
                  <th>Reference</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(req => (
                  <React.Fragment key={req.id}>
                    <tr
                      className={`rh-row ${expandedId === req.id ? 'rh-row-expanded' : ''}`}
                      onClick={() => toggleExpand(req.id)}
                    >
                      <td className="rh-td-resident">
                        <div className="rh-avatar">
                          {(req.requestorFullName || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="rh-resident-name">{req.requestorFullName || '—'}</div>
                          <div className="rh-resident-email">{req.requestorEmail || '—'}</div>
                        </div>
                      </td>
                      <td>
                        <span className="rh-doc-type">{formatLabel(req.documentType)}</span>
                      </td>
                      <td>
                        <span className="rh-ref">{req.referenceNumber || `#${req.id}`}</span>
                      </td>
                      <td className="rh-date">{formatDate(req.createdAt)}</td>
                      <td>
                        <span className={`rh-status-badge ${STATUS_COLORS[req.status] || ''}`}>
                          {formatLabel(req.status)}
                        </span>
                      </td>
                      <td>
                        <button className="rh-expand-btn" onClick={e => { e.stopPropagation(); toggleExpand(req.id); }}>
                          {expandedId === req.id ? '▲ Hide' : '▼ View'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expandedId === req.id && (
                      <tr className="rh-detail-row">
                        <td colSpan={6}>
                          <div className="rh-detail-panel">
                            <div className="rh-detail-grid">
                              <div className="rh-detail-section">
                                <h4>Resident Information</h4>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Full Name</span>
                                  <span>{req.requestorFullName || '—'}</span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Email</span>
                                  <span>{req.requestorEmail || '—'}</span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Address</span>
                                  <span>{req.requestorAddress || '—'}</span>
                                </div>
                              </div>

                              <div className="rh-detail-section">
                                <h4>Request Details</h4>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Document Type</span>
                                  <span>{formatLabel(req.documentType)}</span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Purpose</span>
                                  <span>{req.purpose || '—'}</span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Reference No.</span>
                                  <span>{req.referenceNumber || '—'}</span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Submitted</span>
                                  <span>{formatDate(req.createdAt)}</span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Last Updated</span>
                                  <span>{formatDate(req.updatedAt)}</span>
                                </div>
                              </div>

                              <div className="rh-detail-section">
                                <h4>Processing Info</h4>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Status</span>
                                  <span className={`rh-status-badge ${STATUS_COLORS[req.status] || ''}`}>
                                    {formatLabel(req.status)}
                                  </span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Processed By</span>
                                  <span>{req.processedBy || '—'}</span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Release Date</span>
                                  <span>{formatDate(req.releaseDate)}</span>
                                </div>
                                <div className="rh-detail-item">
                                  <span className="rh-detail-label">Notes</span>
                                  <span>{req.processingNotes || '—'}</span>
                                </div>
                              </div>
                            </div>

                            {req.identityPhotoUrl && (
                              <div className="rh-identity-photo">
                                <h4>Submitted ID Photo</h4>
                                <img
                                  src={
                                    req.identityPhotoUrl.includes('|')
                                      ? (() => {
                                          const parts = req.identityPhotoUrl.split('|');
                                          return parts.length >= 3 ? `data:${parts[1]};base64,${parts[2]}` : null;
                                        })()
                                      : req.identityPhotoUrl
                                  }
                                  alt="Identity"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default RequestHistory;