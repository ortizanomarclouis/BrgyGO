import React, { useState } from 'react';
import './RequestDocument.css';
import { useDocumentRequest, useAuth } from '../hooks';

const documentOptions = [
  { value: 'BARANGAY_CLEARANCE', label: 'Barangay Clearance' },
  { value: 'CERTIFICATE_OF_INDIGENCY', label: 'Certificate of Indigency' },
  { value: 'CERTIFICATE_OF_RESIDENCY', label: 'Certificate of Residency' },
  { value: 'BARANGAY_ID', label: 'Barangay ID Application' },
];

function RequestDocument({ onNavigate }) {
  const { user } = useAuth();
  const { handleRequest, loading } = useDocumentRequest();
  const [formData, setFormData] = useState({
    documentType: 'BARANGAY_CLEARANCE',
    purpose: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.purpose.trim()) {
      setError('Please describe the purpose of your request.');
      return;
    }

    const result = await handleRequest(formData);
    if (result.success) {
      setSuccess('Document request submitted successfully. Redirecting to dashboard...');
      setFormData({
        documentType: 'BARANGAY_CLEARANCE',
        purpose: '',
      });
      setTimeout(() => onNavigate('dashboard'), 1800);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="request-document-container">
      <div className="request-document-header">
        <button className="back-button" onClick={() => onNavigate('dashboard')}>
          ← Back to Dashboard
        </button>
        <div>
          <h1>Request a Document</h1>
          <p>Fill out the form below and submit your document request.</p>
          <p className="request-subtitle">Logged in as {user?.fullName || user?.email || 'Resident'}</p>
        </div>
      </div>

      <div className="request-document-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="request-document-form">
          <div className="form-group">
            <label htmlFor="documentType">Document Type</label>
            <select
              id="documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              required
            >
              {documentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Request</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Explain why you need this document"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting request...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestDocument;
