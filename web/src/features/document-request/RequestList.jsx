import React, { useEffect, useState } from 'react';
import './RequestList.css';
import api from '../../hooks/api';
import { useAuth } from '../../hooks';

// FIX 1: All statuses that allow document download
const DOWNLOADABLE_STATUSES = ['APPROVED', 'COMPLETED', 'READY_FOR_RELEASE'];

function RequestList({ onNavigate }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        // FIX 1: Pass userId so we get THIS user's requests, not default user 1
        const userId = user?.id;
        const response = await api.get(`/api/requests${userId ? `?userId=${userId}` : ''}`);
        const content = response.data?.content;
        setRequests(
          Array.isArray(content)
            ? content
            : Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load your requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const formatStatusLabel = (status) =>
    status ? status.replace(/_/g, ' ') : '';

  // FIX 1: Download certificate — properly handles text certificate content
  const downloadCertificate = async (requestId, documentType) => {
    setDownloadingId(requestId);
    setDownloadSuccess('');
    try {
      const response = await api.get(`/api/requests/${requestId}/certificate`);

      // Extract content from response — backend returns { content: "...", ... }
      const content =
        response.data?.content ||
        JSON.stringify(response.data, null, 2);

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const fileName = `${(documentType || 'document').replace(/_/g, '-')}-${requestId}.txt`;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(`✓ Document downloaded: ${fileName}`);
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (err) {
      console.error('Unable to download document:', err);
      alert(
        err.response?.data?.error ||
          'Unable to download document at this time. Please try again.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="request-list-page">
      <div className="request-list-header">
        <div>
          <button className="back-button" onClick={() => onNavigate('dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>My Document Requests</h1>
          <p>Review your submitted requests and track their status.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate('request')}>
          Request a New Document
        </button>
      </div>

      {/* FIX 1: Download success banner */}
      {downloadSuccess && (
        <div
          className="status-message"
          style={{
            background: '#e6f4ea',
            color: '#1b5e20',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontWeight: 600,
          }}
        >
          {downloadSuccess}
        </div>
      )}

      {loading && <div className="status-message">Loading requests...</div>}
      {error && <div className="status-message status-error">{error}</div>}

      {!loading && !error && (
        <div className="request-list-grid">
          {requests.length === 0 ? (
            <div className="empty-state">
              <p>No document requests found.</p>
              <button
                className="primary-button"
                onClick={() => onNavigate('request')}
              >
                Create Your First Request
              </button>
            </div>
          ) : (
            requests.map((request) => {
              // FIX 1: Normalize status for comparison (trim + uppercase)
              const normalizedStatus = (request.status || '').trim().toUpperCase();
              const isDownloadable = DOWNLOADABLE_STATUSES.includes(normalizedStatus);
              const isDownloading = downloadingId === request.id;

              return (
                <div key={request.id} className="request-card">
                  <div className="request-card-top">
                    <div className="request-type">
                      {request.documentType?.replace(/_/g, ' ')}
                    </div>
                    <div
                      className={`request-status status-${normalizedStatus
                        .toLowerCase()
                        .replace(/_/g, '-')}`}
                    >
                      {formatStatusLabel(request.status)}
                    </div>
                  </div>

                  <div className="request-meta">
                    <span>Ref: {request.referenceNumber || 'N/A'}</span>
                    <span>
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : ''}
                    </span>
                  </div>

                  <div className="request-purpose">{request.purpose}</div>

                  <div className="request-footer">
                    <span>
                      Notes: {request.processingNotes || 'Pending review'}
                    </span>

                    {/* FIX 1: Show Download button when status is approved/completed/ready */}
                    {isDownloadable && (
                      <button
                        className="download-button"
                        disabled={isDownloading}
                        onClick={() =>
                          downloadCertificate(request.id, request.documentType)
                        }
                      >
                        {isDownloading ? 'Downloading...' : '⬇ Download Copy'}
                      </button>
                    )}

                    {/* Show a "pending" label for non-downloadable statuses */}
                    {!isDownloadable && normalizedStatus === 'SUBMITTED' && (
                      <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                        Awaiting staff review
                      </span>
                    )}
                    {!isDownloadable && normalizedStatus === 'UNDER_REVIEW' && (
                      <span style={{ fontSize: '12px', color: '#f57c00', fontStyle: 'italic' }}>
                        Being processed by staff
                      </span>
                    )}
                    {!isDownloadable && normalizedStatus === 'REJECTED' && (
                      <span style={{ fontSize: '12px', color: '#c62828', fontStyle: 'italic' }}>
                        Request was rejected
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default RequestList;