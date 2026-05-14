import React, { useEffect, useState } from 'react';
import './RequestList.css';
import api from '../../hooks/api';

function RequestList({ onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/api/requests');
        const content = response.data?.content;
        setRequests(Array.isArray(content) ? content : Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load your requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const formatStatusLabel = (status) => status ? status.replace(/_/g, ' ') : '';

  const downloadCertificate = async (requestId, documentType) => {
    try {
      const response = await api.get(`/api/requests/${requestId}/certificate`);
      const content = response.data?.content || JSON.stringify(response.data, null, 2);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentType || 'document'}-${requestId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Unable to download document:', err);
      alert(err.response?.data?.error || 'Unable to download document copy at this time.');
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

      {loading && <div className="status-message">Loading requests...</div>}
      {error && <div className="status-message status-error">{error}</div>}

      {!loading && !error && (
        <div className="request-list-grid">
          {requests.length === 0 ? (
            <div className="empty-state">
              <p>No document requests found.</p>
              <button className="primary-button" onClick={() => onNavigate('request')}>
                Create Your First Request
              </button>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-card-top">
                  <div className="request-type">{request.documentType?.replace(/_/g, ' ')}</div>
                  <div className={`request-status status-${request.status?.toLowerCase().replace(/_/g, '-')}`}>
                    {formatStatusLabel(request.status)}
                  </div>
                </div>
                <div className="request-meta">
                  <span>Ref: {request.referenceNumber || 'N/A'}</span>
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="request-purpose">{request.purpose}</div>
                <div className="request-footer">
                  <span>Notes: {request.processingNotes || 'Pending review'}</span>
                  {['APPROVED', 'COMPLETED', 'READY_FOR_RELEASE'].includes(request.status) && (
                    <button
                      className="download-button"
                      onClick={() => downloadCertificate(request.id, request.documentType?.replace(/_/g, '-'))}
                    >
                      Download Copy
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default RequestList;
