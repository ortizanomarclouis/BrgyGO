import React, { useState } from 'react';
import './Profile.css';
import { useAuth } from '../hooks';

function Profile({ onNavigate }) {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
    completeAddress: user?.completeAddress || '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      setStatus('Profile updated successfully.');
    } else {
      setStatus('Unable to update profile.');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-button" onClick={() => onNavigate('dashboard')}>
          ← Back to Dashboard
        </button>
        <div>
          <h1>Update Profile</h1>
          <p>Manage your account details and contact information.</p>
        </div>
      </div>

      <div className="profile-card">
        {status && <div className="status-message">{status}</div>}
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" value={formData.email} onChange={handleChange} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input id="contactNumber" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="completeAddress">Complete Address</label>
            <textarea id="completeAddress" name="completeAddress" value={formData.completeAddress} onChange={handleChange} />
          </div>
          <button type="submit" className="primary-button">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
