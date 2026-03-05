import React, { useState } from 'react';
import './Register.css';

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // Mock registration - navigate to login
    onNavigate('login');
  };

  return (
    <div className="register-container">
      <div className="page-header">
        <div className="header-content">
          <img src="/Logo.jpg" alt="BrgyGO Logo" className="header-logo" />
          <h1>BrgyGO</h1>
        </div>
      </div>
      <div className="register-content">
        <div className="left-content">
          <div className="brgygo-logo">
            <img src="/Logo.jpg" alt="BrgyGO Logo" className="logo-icon-large" />
          </div>
          <h1 className="brgygo-title">BrgyGO</h1>
          <div className="left-text">
            <h2>Image</h2>
            <p>Lorem ipsum</p>
            <p>Lorem ipsum</p>
          </div>
        </div>
      </div>

      <div className="register-right">
        <div className="register-card">
          <div className="register-header">
            <img src="/Logo.jpg" alt="BrgyGO Logo" className="logo-image" />
            <p>Join BarangayGO digital services</p>
          </div>

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

            <button type="submit" className="signup-btn">
              Sign up
            </button>
          </form>

          <div className="register-links">
            <p>
              Already have an account?{' '}
              <a href="#signin" onClick={() => onNavigate('login')}>
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
      </div>
  );
}

export default Register;
