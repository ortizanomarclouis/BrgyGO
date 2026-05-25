import React, { useState, useEffect, useRef } from 'react';
import api from '../../hooks/api';
import './OtpVerification.css';

function OtpVerification({ email, onVerified, onNavigate }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60); // seconds
  const inputRefs = useRef([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    // Auto-advance to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp: code });
      const userData = res.data;
      localStorage.setItem('token', userData.token || 'verified-session');
      localStorage.setItem('user', JSON.stringify(userData));
      onVerified(userData);
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.post('/api/auth/resend-otp', { email });
      setResendCooldown(60);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend code.');
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-icon">📧</div>
        <h2>Check your email</h2>
        <p className="otp-subtitle">
          We sent a 6-digit code to<br />
          <strong>{email}</strong>
        </p>

        {error && <div className="otp-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="otp-box"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button type="submit" className="otp-submit" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify my account'}
          </button>
        </form>

        <div className="otp-resend">
          {resendCooldown > 0 ? (
            <span>Resend code in {resendCooldown}s</span>
          ) : (
            <button className="otp-resend-btn" onClick={handleResend}>
              Resend code
            </button>
          )}
        </div>

        <button className="otp-back" onClick={() => onNavigate('login')}>
          ← Back to login
        </button>
      </div>
    </div>
  );
}

export default OtpVerification;