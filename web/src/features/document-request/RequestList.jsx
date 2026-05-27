import React, { useEffect, useState, useCallback } from 'react';
import './RequestList.css';
import api from '../../hooks/api';
import { useAuth } from '../../hooks';
import PaymentModal from '../payment/PaymentModal';

const PAY_FIRST_STATUSES = ['APPROVED'];
const DIRECT_DOWNLOAD_STATUSES = ['COMPLETED', 'READY_FOR_RELEASE'];

function writeResidentNotification(userId, message, type = 'success') {
  try {
    const key = `brgygoNotifications_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    existing.unshift({
      id,
      message,
      type,
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      seen: false,
    });
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
  } catch {}
}

/**
 * Generate and download a PDF certificate using jsPDF (no external server needed).
 * Dynamically imports jsPDF so it doesn't bloat the initial bundle.
 */
async function downloadAsPdf(content, documentType, requestId) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW  = doc.internal.pageSize.getWidth();
  const pageH  = doc.internal.pageSize.getHeight();
  const margin = 20;

  // ── Outer border (like a real PH barangay document) ─────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageW - 20, pageH - 20);
  doc.setLineWidth(0.5);
  doc.rect(13, 13, pageW - 26, pageH - 26);

  // ── Header: Republic of the Philippines ─────────────────────────────────
  let y = 30;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Republic of the Philippines', pageW / 2, y, { align: 'center' });
  y += 5;
  doc.text('Province / City', pageW / 2, y, { align: 'center' });
  y += 5;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bolditalic');
  doc.text('Barangay', pageW / 2, y, { align: 'center' });
  y += 8;

  // Divider
  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 3;
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // ── Office of the Barangay Captain ───────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OFFICE OF THE BARANGAY CAPTAIN', pageW / 2, y, { align: 'center' });
  y += 12;

  // ── Document Title ────────────────────────────────────────────────────────
  const docLabel = (documentType || 'DOCUMENT').replace(/_/g, ' ');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(docLabel, pageW / 2, y, { align: 'center' });
  y += 5;

  // Underline below title
  const titleW = doc.getTextWidth(docLabel);
  doc.setLineWidth(0.8);
  doc.line((pageW - titleW) / 2, y, (pageW + titleW) / 2, y);
  y += 14;

  // ── Reference info ────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const nowStr = new Date().toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.text(`Reference ID: ${requestId}`, margin + 5, y);
  doc.text(`Date Issued: ${nowStr}`, pageW - margin - 5, y, { align: 'right' });
  y += 10;

  // ── Certificate body text ─────────────────────────────────────────────────
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  // Strip the ASCII border lines from the content (the === lines)
  const cleanContent = (content || '')
    .replace(/[^\x00-\x7F]/g, '')   // strip non-ASCII (box drawing chars)
    .replace(/={3,}/g, '')           // strip === borders
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join('\n');

  const contentW = pageW - margin * 2 - 10;
  const lines = doc.splitTextToSize(cleanContent, contentW);
  const lineH = 6.5;
  const maxY  = pageH - margin - 20;

  lines.forEach((line) => {
    if (y + lineH > maxY) {
      doc.addPage();

      // Re-draw border on new page
      doc.setDrawColor(0);
      doc.setLineWidth(1.5);
      doc.rect(10, 10, pageW - 20, pageH - 20);
      doc.setLineWidth(0.5);
      doc.rect(13, 13, pageW - 26, pageH - 26);

      y = 25;
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, margin + 5, y);
    y += lineH;
  });

  // ── Signature area ────────────────────────────────────────────────────────
  y = Math.max(y + 20, pageH - 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);

  const sigX = pageW - margin - 60;
  doc.text('Punong Barangay', sigX, y, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(sigX - 30, y - 4, sigX + 30, y - 4);

  // ── O.R. / Doc Stamp footer ───────────────────────────────────────────────
  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('O.R No.: ______________________', margin + 5, y);
  y += 5;
  doc.text('Date Issued: ______________________', margin + 5, y);
  y += 5;
  doc.text('Doc. Stamp: Paid', margin + 5, y);

  // ── Footer ────────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `BrgyGO Digital Barangay System  •  Page ${p} of ${totalPages}`,
      pageW / 2,
      pageH - 6,
      { align: 'center' }
    );
  }

  const fileName = `${docLabel.replace(/\s+/g, '-')}-${requestId}.pdf`;
  doc.save(fileName);
  return fileName;
}

function RequestList({ onNavigate }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [paymentRequest, setPaymentRequest] = useState(null);

  const STATUS_META_KEY = `brgygoRequestStatusMeta_${user?.id}`;

  const formatStatusLabel = (status) =>
    status ? status.replace(/_/g, ' ') : '';

  const checkAndNotifyStatusChanges = useCallback((fetchedRequests) => {
    if (!user?.id) return;
    try {
      const stored = JSON.parse(localStorage.getItem(STATUS_META_KEY) || '{}');
      const updated = { ...stored };
      const hasSeenBefore = Object.keys(stored).length > 0;

      fetchedRequests.forEach((req) => {
        if (!req?.id) return;
        const currentStatus = req.status?.toString();
        const previousStatus = stored[req.id?.toString()];
        const ref = req.referenceNumber || `#${req.id}`;
        const label = formatStatusLabel(currentStatus);

        if (!currentStatus) return;

        if (!hasSeenBefore) {
          if (!['SUBMITTED'].includes(currentStatus)) {
            writeResidentNotification(user.id, `📋 Your request ${ref} status: ${label}`, 'info');
          }
        } else if (previousStatus && currentStatus !== previousStatus) {
          writeResidentNotification(user.id, `📋 Your request ${ref} is now: ${label}`, 'info');

          if (['APPROVED'].includes(currentStatus)) {
            writeResidentNotification(
              user.id,
              `✅ Your request ${ref} has been APPROVED! You can now pay and download your document.`,
              'success'
            );
          }
          if (['COMPLETED', 'READY_FOR_RELEASE'].includes(currentStatus)) {
            writeResidentNotification(
              user.id,
              `📄 Your document for ${ref} is ready to download!`,
              'success'
            );
          }
          if (['REJECTED'].includes(currentStatus)) {
            writeResidentNotification(
              user.id,
              `❌ Your request ${ref} was rejected. Please contact the barangay for details.`,
              'info'
            );
          }
        }

        updated[req.id?.toString()] = currentStatus;
      });

      localStorage.setItem(STATUS_META_KEY, JSON.stringify(updated));
    } catch {}
  }, [user?.id, STATUS_META_KEY]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const userId = user?.id;
      const response = await api.get(`/api/requests${userId ? `?userId=${userId}` : ''}`);
      const content = response.data?.content;
      const list = Array.isArray(content)
        ? content
        : Array.isArray(response.data)
        ? response.data
        : [];
      setRequests(list);
      checkAndNotifyStatusChanges(list);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load your requests.');
    } finally {
      setLoading(false);
    }
  }, [user, checkAndNotifyStatusChanges]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    const interval = setInterval(() => { fetchRequests(); }, 20000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  // ── PDF Download ──────────────────────────────────────────────────────────
  const downloadCertificate = async (requestId, documentType) => {
    setDownloadingId(requestId);
    setDownloadSuccess('');
    try {
      // Fetch certificate content from backend
      const response = await api.get(`/api/requests/${requestId}/certificate`);
      const content = response.data?.content || JSON.stringify(response.data, null, 2);

      // Generate and download PDF
      const fileName = await downloadAsPdf(content, documentType, requestId);

      setDownloadSuccess(`✓ PDF downloaded: ${fileName}`);
      setTimeout(() => setDownloadSuccess(''), 5000);
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to download document at this time.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadClick = (request) => {
    const status = (request.status || '').trim().toUpperCase();
    if (DIRECT_DOWNLOAD_STATUSES.includes(status)) {
      downloadCertificate(request.id, request.documentType);
    } else if (PAY_FIRST_STATUSES.includes(status)) {
      setPaymentRequest(request);
    }
  };

  const handlePaymentComplete = ({ requestId, method, documentType }) => {
    setPaymentRequest(null);
    if (method === 'ONLINE' || method === 'FREE') {
      fetchRequests().then(() => {
        downloadCertificate(requestId, documentType);
      });
    } else {
      setDownloadSuccess(
        '✓ Cash payment noted. Please visit the Barangay Hall to pay. Your download button will appear once staff confirms your payment.'
      );
      setTimeout(() => setDownloadSuccess(''), 10000);
      fetchRequests();
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
              const isDirectDownload = DIRECT_DOWNLOAD_STATUSES.includes(normalizedStatus);
              const isPayFirst = PAY_FIRST_STATUSES.includes(normalizedStatus);
              const isDownloading = downloadingId === request.id;

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

                    {isDirectDownload && (
                      <button
                        className="download-button"
                        disabled={isDownloading}
                        onClick={() => handleDownloadClick(request)}
                      >
                        {isDownloading ? 'Generating PDF…' : '⬇ Download PDF'}
                      </button>
                    )}

                    {isPayFirst && (
                      <button
                        className="download-button"
                        disabled={isDownloading}
                        onClick={() => handleDownloadClick(request)}
                        style={{ background: '#1a73e8' }}
                      >
                        {isDownloading ? 'Generating PDF…' : '💳 Pay & Download PDF'}
                      </button>
                    )}

                    {!isDirectDownload && !isPayFirst && normalizedStatus === 'SUBMITTED' && (
                      <span style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                        Awaiting staff review
                      </span>
                    )}
                    {!isDirectDownload && !isPayFirst && normalizedStatus === 'UNDER_REVIEW' && (
                      <span style={{ fontSize: '12px', color: '#f57c00', fontStyle: 'italic' }}>
                        Being processed by staff
                      </span>
                    )}
                    {!isDirectDownload && !isPayFirst && normalizedStatus === 'REJECTED' && (
                      <span style={{ fontSize: '12px', color: '#c62828', fontStyle: 'italic' }}>
                        Request was rejected
                      </span>
                    )}
                    {!isDirectDownload && !isPayFirst && normalizedStatus === 'ADDITIONAL_DOCUMENTS_REQUIRED' && (
                      <span style={{ fontSize: '12px', color: '#7b1fa2', fontStyle: 'italic' }}>
                        Additional documents required
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

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