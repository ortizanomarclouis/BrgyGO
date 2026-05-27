import React, { useState } from 'react';
import './ReportIssue.css';
import { useAuth } from '../../hooks';
import api from '../../hooks/api';

const categories = [
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'SAFETY_AND_SECURITY', label: 'Safety' },
  { value: 'SANITATION', label: 'Sanitation' },
  { value: 'NOISE_DISTURBANCE', label: 'Noise Disturbance' },
  { value: 'OTHERS', label: 'Others' },
];

const urgencies = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

function ReportIssue({ onNavigate }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: 'INFRASTRUCTURE',
    urgency: 'MEDIUM',
    address: '',
    description: '',
    proofImage: null,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10485760) {
        setError('File size must not exceed 10MB.');
        return;
      }

      setFormData({ ...formData, proofImage: file });
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.description.trim() || !formData.address.trim()) {
      const message = 'Please provide a description and address for the issue.';
      setError(message);
      return;
    }

    setLoading(true);
    try {
      const requestData = new FormData();
      requestData.append('category', formData.category);
      requestData.append('urgency', formData.urgency);
      requestData.append('address', formData.address);
      requestData.append('description', formData.description);

      if (user?.id) {
        requestData.append('userId', user.id);
      }

      if (formData.proofImage) {
        requestData.append('proofImage', formData.proofImage);
      }

      await api.post('/api/issues', requestData);
      setSuccess('Your issue report has been submitted successfully.');
      setFormData({ category: 'INFRASTRUCTURE', urgency: 'MEDIUM', address: '', description: '', proofImage: null });
      setImagePreview('');
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to submit your issue.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-issue-page">
      <div className="report-issue-header">
        <div>
          <button className="back-button" onClick={() => onNavigate('dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Report an Issue</h1>
          <p>Tell us about a community issue so barangay staff can respond faster.</p>
        </div>
      </div>

      <div className="report-issue-card">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="report-issue-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Issue Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}>
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="urgency">Urgency</label>
              <select id="urgency" name="urgency" value={formData.urgency} onChange={handleChange}>
                {urgencies.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="address">Location / Address</label>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, barangay, city"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Issue Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the problem in detail"
            />
          </div>

          <div className="form-group">
            <label htmlFor="proofImage">Proof Image (Optional)</label>
            <p className="form-help-text">Upload a photo showing the issue (JPEG, PNG, GIF, or WebP, max 10MB)</p>
            <div className="file-upload-container">
              <input
                id="proofImage"
                type="file"
                name="proofImage"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <label htmlFor="proofImage" className="file-label">
                {formData.proofImage ? '📷 Photo Selected' : '📁 Choose Photo'}
              </label>
            </div>
            {imagePreview && (
              <div className="photo-preview">
                <img src={imagePreview} alt="Proof preview" />
                <p>{formData.proofImage?.name}</p>
              </div>
            )}
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Submitting issue...' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportIssue;