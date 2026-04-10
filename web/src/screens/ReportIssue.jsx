import React, { useState } from 'react';
import './ReportIssue.css';
import api from '../hooks/api';

const categories = [
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'SAFETY', label: 'Safety' },
  { value: 'SANITATION', label: 'Sanitation' },
  { value: 'PUBLIC_SERVICE', label: 'Public Service' },
];

const urgencies = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

function ReportIssue({ onNavigate }) {
  const [formData, setFormData] = useState({
    category: 'INFRASTRUCTURE',
    urgency: 'MEDIUM',
    address: '',
    description: '',
    latitude: '',
    longitude: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.description.trim() || !formData.address.trim()) {
      setError('Please provide a description and address for the issue.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/issues', {
        category: formData.category,
        urgency: formData.urgency,
        address: formData.address,
        description: formData.description,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      });
      setSuccess('Your issue report has been submitted successfully.');
      setFormData({ category: 'INFRASTRUCTURE', urgency: 'MEDIUM', address: '', description: '', latitude: '', longitude: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit your issue.');
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
              <input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Street, barangay, city" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Issue Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the problem in detail" />
          </div>

          <div className="form-row small-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input id="latitude" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input id="longitude" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Optional" />
            </div>
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
