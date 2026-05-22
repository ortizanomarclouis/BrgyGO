import React, { useState } from 'react';
import './PaymentModal.css';
import api from '../../hooks/api';

const DOCUMENT_FEES = {
  BARANGAY_CLEARANCE: 50,
  CERTIFICATE_OF_INDIGENCY: 0,
  CERTIFICATE_OF_RESIDENCY: 50,
  BARANGAY_ID: 100,
};

function PaymentModal({ request, onClose, onPaid }) {
  const [step, setStep] = useState('choose'); // 'choose' | 'gcash' | 'maya' | 'cash' | 'success'
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fee = DOCUMENT_FEES[request?.documentType] ?? 50;
  const docLabel = request?.documentType?.replace(/_/g, ' ') ?? 'Document';

  const submitPayment = async (method) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/payments', {
        requestId: request.id,
        method,
        referenceNumber: method !== 'CASH' ? refNumber : null,
        amount: fee,
      });
      setStep('success');
      setTimeout(() => {
        onPaid({ requestId: request.id, method, documentType: request.documentType });
      }, 1400);
    } catch (e) {
      setError(e.response?.data?.error || 'Payment submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onlineLabel = step === 'gcash' ? 'GCash' : 'Maya (PayMaya)';

  return (
    <div className="pm-overlay">
      <div className="pm-modal">
        <button className="pm-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="pm-header">
          <div className="pm-credit-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div>
            <h2>Payment Required</h2>
            <p>Complete payment to receive your soft copy</p>
          </div>
        </div>

        <div className="pm-doc-banner">
          <span className="pm-doc-label">{docLabel}</span>
          <div className="pm-fee-block">
            <span className="pm-fee-sublabel">PROCESSING FEE</span>
            <span className="pm-fee-amount">₱{fee}.00</span>
          </div>
        </div>

        {fee === 0 && (
          <div className="pm-free-notice">
            This document is free of charge. Click below to proceed.
            <button className="pm-submit pm-free-btn" onClick={() => submitPayment('FREE')}>
              Get my document
            </button>
          </div>
        )}

        {fee > 0 && error && <div className="pm-error">{error}</div>}

        {fee > 0 && step === 'choose' && (
          <>
            <p className="pm-choose-hint">
              Choose how you'd like to pay. <strong>Online payment</strong> lets you download your
              document immediately. Cash payment requires you to visit the barangay hall first.
            </p>
            <div className="pm-methods">
              <button className="pm-method-btn pm-gcash" onClick={() => setStep('gcash')}>
                <span className="pm-method-avatar" style={{ background: '#007AFF' }}>G</span>
                <div>
                  <strong>GCash</strong>
                  <small>Instant soft copy after verification</small>
                </div>
                <span className="pm-chevron">›</span>
              </button>
              <button className="pm-method-btn pm-maya" onClick={() => setStep('maya')}>
                <span className="pm-method-avatar" style={{ background: '#00B14F' }}>M</span>
                <div>
                  <strong>Maya (PayMaya)</strong>
                  <small>Instant soft copy after verification</small>
                </div>
                <span className="pm-chevron">›</span>
              </button>
              <button className="pm-method-btn pm-cash" onClick={() => setStep('cash')}>
                <span className="pm-method-avatar" style={{ background: '#F5A623' }}>P</span>
                <div>
                  <strong>Cash on Hand</strong>
                  <small>Visit barangay hall · soft copy after confirmation</small>
                </div>
                <span className="pm-chevron">›</span>
              </button>
            </div>
          </>
        )}

        {fee > 0 && (step === 'gcash' || step === 'maya') && (
          <div className="pm-form">
            <p className="pm-instruction">
              Send <strong>₱{fee}.00</strong> to the barangay {onlineLabel} number{' '}
              <strong>09XX-XXX-XXXX</strong>, then enter your reference number below.
            </p>
            <label>Reference number</label>
            <input
              type="text"
              placeholder="e.g. 1234567890"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
            />
            {error && <div className="pm-error">{error}</div>}
            <div className="pm-actions">
              <button className="pm-back" onClick={() => { setStep('choose'); setRefNumber(''); setError(''); }}>
                ← Back
              </button>
              <button
                className="pm-submit"
                disabled={loading || !refNumber.trim()}
                onClick={() => submitPayment('ONLINE')}
              >
                {loading ? 'Submitting…' : 'Confirm payment'}
              </button>
            </div>
          </div>
        )}

        {fee > 0 && step === 'cash' && (
          <div className="pm-form">
            <div className="pm-cash-info">
              <div>📍 Barangay Hall, Main Street</div>
              <div>🕐 Mon–Fri, 8:00 AM – 5:00 PM</div>
              <div>📋 Reference: <strong>{request?.referenceNumber}</strong></div>
              <div>💵 Amount to pay: <strong>₱{fee}.00</strong></div>
            </div>
            <p className="pm-instruction" style={{ marginTop: '10px' }}>
              Your download will be unlocked once staff confirms your payment at the office.
            </p>
            {error && <div className="pm-error">{error}</div>}
            <div className="pm-actions">
              <button className="pm-back" onClick={() => { setStep('choose'); setError(''); }}>
                ← Back
              </button>
              <button className="pm-submit" disabled={loading} onClick={() => submitPayment('CASH')}>
                {loading ? 'Submitting…' : 'I will pay at the office'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="pm-success">
            <div className="pm-success-icon">✅</div>
            <p>
              {refNumber
                ? 'Payment submitted! Preparing your document…'
                : 'Noted! Please visit the barangay office to complete your payment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;