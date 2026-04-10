import React, { useState } from 'react';
import './Register.css';
import { useRegister } from '../hooks';

function Register({ onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    completeAddress: '',
    agreeTerms: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { handleRegister, loading } = useRegister();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate terms agreement
    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    const result = await handleRegister(formData);

    if (result.success) {
      setSuccess('Account created successfully. Please log in.');
      setError('');
      setTimeout(() => onNavigate('login'), 1500);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="register-container">

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <img src="/Logo.png" alt="BrgyGO Logo" className="header-logo" />
          <h1>BrgyGO</h1>
        </div>
      </div>

      {/* Main content: left + right INSIDE register-content */}
      <div className="register-content">

        {/* LEFT PANEL */}
        <div className="register-left">
          <div className="left-content">
            <div className="brgygo-logo">
              <img src="/Logo.png" alt="BrgyGO Logo" className="logo-icon-large" />
            </div>
            <h1 className="brgygo-title">Governance Reimagined</h1>
            <div className="left-text">
              <h2>For Modern Communities</h2>
              <p>Join BrgyGO and experience the future of barangay management. Streamlined document requests, efficient issue reporting, and seamless communication.</p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="register-right">
          <div className="register-card">
            <div className="register-header">
              <img src="/Logo.png" alt="BrgyGO Logo" className="logo-image" />
              <p>Join BrgyGO digital services</p>
            </div>

            {error && (
              <div style={{
                color: '#e74c3c',
                backgroundColor: '#fdf2f2',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{
                color: '#155724',
                backgroundColor: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: '4px',
                padding: '10px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="password-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  placeholder="Enter your contact number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="completeAddress">Complete Address</label>
                <input
                  type="text"
                  id="completeAddress"
                  name="completeAddress"
                  placeholder="Enter your complete address"
                  value={formData.completeAddress}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agreeTerms">
                  I agree to the Terms and Conditions
                </label>
              </div>

              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="register-links">
              <p>
                Already have an account?{' '}
                <a href="#signin" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;