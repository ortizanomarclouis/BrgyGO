import React, { useEffect, useState } from 'react';
import './RequestList.css';
import api from '../../hooks/api';
import { useAuth } from '../../hooks';
import PaymentModal from '../payment/PaymentModal';

const DOWNLOADABLE_STATUSES = ['APPROVED', 'COMPLETED', 'READY_FOR_RELEASE'];

function RequestList({ onNavigate }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  // Payment modal state
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
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

  // Check if this specific request has already been paid
  const hasPaid = (requestId) => {
    try {
      const paid = JSON.parse(localStorage.getItem('brgygo_paid_requests') || '{}');
      return !!paid[requestId];
    } catch { return false; }
  };

  const markAsPaid = (requestId) => {
    try {
      const paid = JSON.parse(localStorage.getItem('brgygo_paid_requests') || '{}');
      paid[requestId] = true;
      localStorage.setItem('brgygo_paid_requests', JSON.stringify(paid));
    } catch {}
  };

  const downloadCertificate = async (requestId, documentType) => {
    setDownloadingId(requestId);
    setDownloadSuccess('');
    try {
      const response = await api.get(`/api/requests/${requestId}/certificate`);
      const content = response.data?.content || JSON.stringify(response.data, null, 2);
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
      alert(err.response?.data?.error || 'Unable to download document at this time.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Called when resident clicks "Download Copy"
  const handleDownloadClick = (request) => {
    if (hasPaid(request.id)) {
      // Already paid — download directly
      downloadCertificate(request.id, request.documentType);
    } else {
      // Show payment modal first
      setPaymentRequest(request);
    }
  };

  // Called by PaymentModal after successful payment
  const handlePaymentComplete = ({ requestId, method, documentType }) => {
    markAsPaid(requestId);
    setPaymentRequest(null);

    if (method === 'ONLINE') {
      // Online paid — download immediately
      downloadCertificate(requestId, documentType);
    } else {
      // Cash — inform resident to visit the office
      setDownloadSuccess(
        '✓ Cash payment noted. Please visit the Barangay Hall to pay. Your download will be available after confirmation.'
      );
      setTimeout(() => setDownloadSuccess(''), 8000);
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

      {downloadSuccess && (
        <div className="status-message" style={{
          background: '#e6f4ea', color: '#1b5e20',
          borderRadius: '10px', padding: '12px 16px',
          marginBottom: '16px', fontWeight: 600,
        }}>
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
              <button className="primary-button" onClick={() => onNavigate('request')}>
                Create Your First Request
              </button>
            </div>
          ) : (
            requests.map((request) => {
              const normalizedStatus = (request.status || '').trim().toUpperCase();
              const isDownloadable = DOWNLOADABLE_STATUSES.includes(normalizedStatus);
              const isDownloading = downloadingId === request.id;
              const alreadyPaid = hasPaid(request.id);

              return (
                <div key={request.id} className="request-card">
                  <div className="request-card-top">
                    <div className="request-type">
                      {request.documentType?.replace(/_/g, ' ')}
                    </div>
                    <div className={`request-status status-${normalizedStatus.toLowerCase().replace(/_/g, '-')}`}>
                      {formatStatusLabel(request.status)}
                    </div>
                  </div>

                  <div className="request-meta">
                    <span>Ref: {request.referenceNumber || 'N/A'}</span>
                    <span>{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}</span>
                  </div>

                  <div className="request-purpose">{request.purpose}</div>

                  <div className="request-footer">
                    <span>Notes: {request.processingNotes || 'Pending review'}</span>

                    {isDownloadable && (
                      <button
                        className="download-button"
                        disabled={isDownloading}
                        onClick={() => handleDownloadClick(request)}
                      >
                        {isDownloading
                          ? 'Downloading...'
                          : alreadyPaid
                          ? '⬇ Download Copy'
                          : '💳 Pay & Download'}
                      </button>
                    )}

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

      {/* Payment modal — shown to RESIDENT when they click Pay & Download */}
      {paymentRequest && (
        <PaymentModal
          request={paymentRequest}
          onClose={() => setPaymentRequest(null)}
          onPaid={handlePaymentComplete}
        />
      )}
    </div>
  );
}

export default RequestList;