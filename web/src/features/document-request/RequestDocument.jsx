import React, { useState } from 'react';
import './RequestDocument.css';
import { useDocumentRequest, useAuth } from '../../hooks';

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
    identityPhoto: null,
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10485760) {
        setError('File size must not exceed 10MB');
        return;
      }

      setFormData({
        ...formData,
        identityPhoto: file,
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.purpose.trim()) {
      const message = 'Please describe the purpose of your request.';
      setError(message);
      return;
    }

    if (!formData.identityPhoto) {
      const message = 'Please upload a photo of a valid ID or residence ID.';
      setError(message);
      return;
    }

    const result = await handleRequest(formData);
    if (result.success) {
      setSuccess('Document request submitted successfully. Redirecting to dashboard...');
      setFormData({
        documentType: 'BARANGAY_CLEARANCE',
        purpose: '',
        identityPhoto: null,
      });
      setPhotoPreview('');
      setTimeout(() => onNavigate('dashboard'), 1800);
    } else {
      const message = result.error || 'Unable to submit request.';
      setError(message);
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

          <div className="form-group">
            <label htmlFor="identityPhoto">Upload ID or Residence Photo *</label>
            <p className="form-help-text">Please upload a clear photo of your valid ID or residence ID (JPEG, PNG, GIF, or WebP, max 10MB)</p>
            <div className="file-upload-container">
              <input
                id="identityPhoto"
                name="identityPhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                required
                className="file-input"
              />
              <label htmlFor="identityPhoto" className="file-label">
                {formData.identityPhoto ? '📷 Photo Selected' : '📁 Choose Photo'}
              </label>
            </div>
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="ID Preview" />
                <p>{formData.identityPhoto?.name}</p>
              </div>
            )}
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
