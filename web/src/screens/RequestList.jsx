import React, { useEffect, useState } from 'react';
import './RequestList.css';
import api from '../hooks/api';

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
        setRequests(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load your requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

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
                  <div className={`request-status status-${request.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                    {request.status}
                  </div>
                </div>
                <div className="request-meta">
                  <span>Ref: {request.referenceNumber || 'N/A'}</span>
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="request-purpose">{request.purpose}</div>
                <div className="request-footer">
                  <span>Notes: {request.processingNotes || 'Pending review'}</span>
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
