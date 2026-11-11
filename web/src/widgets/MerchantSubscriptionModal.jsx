import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  Check,
  Zap,
  Clock,
  Smartphone
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

export default function MerchantSubscriptionModal({ isOpen, onClose, onSubscribed }) {
  const [plans, setPlans] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState('monthly'); // 'monthly', 'quarterly', 'annual'
  const [utrNumber, setUtrNumber] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPlanInfo();
      setError('');
      setSuccessResult(null);
      setUtrNumber('');
    }
  }, [isOpen]);

  const loadPlanInfo = async () => {
    setLoadingInfo(true);
    try {
      const data = await apiService.getUPIPlanInfo();
      setPlans(data);
    } catch (err) {
      setError(err.message || 'Failed to load subscription details');
    } finally {
      setLoadingInfo(false);
    }
  };

  if (!isOpen) return null;

  const currentPrice = 
    selectedCycle === 'annual' ? (plans?.annual_amount || 4499) :
    selectedCycle === 'quarterly' ? (plans?.quarterly_amount || 1299) :
    (plans?.monthly_amount || 499);

  const upiId = plans?.upi_id || 'bokivo@upi';
  const payeeName = plans?.payee_name || 'Bokivo Partner Network';

  // Standard NPCI UPI URI string format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${currentPrice.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Bokivo Partner Subscription`)}`;

  // Quick high-res QR code generator API using official standard
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiUri)}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  const handleSubmitUTR = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length !== 12) {
      setError('UPI Reference (UTR) must be exactly 12 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.submitSubscriptionUTR(cleanUtr, selectedCycle, currentPrice);
      setSuccessResult(res);
      if (onSubscribed) onSubscribed(res);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the UTR number entered.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 24px',
            background: 'linear-gradient(135deg, #0F1E36 0%, #1E3A5F 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF7A00 0%, #FF9E42 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)',
              }}
            >
              <Zap size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.3px' }}>
                Bokivo Partner Subscription
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Instant Activation via Direct UPI QR (0% Gateway Fee)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {successResult ? (
            /* SUCCESS VIEW */
            <div style={{ textAlign: 'center', padding: '20px 8px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: theme.colors.primaryNavy, margin: '0 0 8px' }}>
                Partner Subscription Verified!
              </h3>
              <p style={{ fontSize: '0.95rem', color: theme.colors.textSecondary, margin: '0 0 20px', lineHeight: 1.5 }}>
                {successResult.message}
              </p>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: `1px solid ${theme.colors.borderLight}`,
                  borderRadius: theme.radii.lg,
                  padding: '16px',
                  maxWidth: '420px',
                  margin: '0 auto 24px',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.86rem' }}>
                  <span style={{ color: theme.colors.textMuted }}>Plan</span>
                  <span style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{successResult.plan_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.86rem' }}>
                  <span style={{ color: theme.colors.textMuted }}>UPI UTR Ref</span>
                  <span style={{ fontWeight: 800, color: '#0284C7', fontFamily: 'monospace' }}>{successResult.utr_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                  <span style={{ color: theme.colors.textMuted }}>Status</span>
                  <span style={{ fontWeight: 800, color: '#16A34A' }}>Active & Verified</span>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1E36 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: theme.radii.md,
                  padding: '12px 32px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                }}
              >
                Back to Merchant Studio
              </button>
            </div>
          ) : (
            /* SUBSCRIPTION & PAYMENT FORM */
            <div>
              {error && (
                <div
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    padding: '12px 16px',
                    borderRadius: theme.radii.md,
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '18px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Select Plan Tier */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: theme.colors.primaryNavy, marginBottom: '10px' }}>
                  1. Select Subscription Plan
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'monthly', title: 'Monthly', price: plans?.monthly_amount || 499, period: '/ month', badge: null },
                    { id: 'quarterly', title: '3 Months', price: plans?.quarterly_amount || 1299, period: '/ quarter', badge: 'Popular' },
                    { id: 'annual', title: 'Annual', price: plans?.annual_amount || 4499, period: '/ year', badge: 'Save 25%' },
                  ].map((p) => {
                    const isSelected = selectedCycle === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedCycle(p.id)}
                        style={{
                          border: isSelected ? `2px solid ${theme.colors.sunsetOrange}` : `1px solid ${theme.colors.borderLight}`,
                          backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                          borderRadius: theme.radii.lg,
                          padding: '12px 10px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          position: 'relative',
                          transition: 'all 0.15s',
                        }}
                      >
                        {p.badge && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '8px',
                              backgroundColor: theme.colors.sunsetOrange,
                              color: '#FFFFFF',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '999px',
                            }}
                          >
                            {p.badge}
                          </span>
                        )}
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? theme.colors.sunsetOrange : theme.colors.textSecondary }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: theme.colors.primaryNavy, marginTop: '2px' }}>
                          ₹{p.price}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: theme.colors.textMuted }}>
                          {p.period}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: UPI QR Code & Direct Scan Area */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: `1.5px solid ${theme.colors.borderLight}`,
                  borderRadius: theme.radii.xl,
                  padding: '20px',
                  marginBottom: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 800, color: theme.colors.primaryNavy, marginBottom: '12px' }}>
                  <QrCode size={18} color={theme.colors.sunsetOrange} />
                  <span>2. Scan QR with Any UPI App</span>
                </div>

                {/* QR Code Container */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '12px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    marginBottom: '14px',
                  }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="Bokivo Subscription UPI QR"
                    style={{ width: '190px', height: '190px', display: 'block', borderRadius: '8px' }}
                  />
                </div>

                {/* Amount to pay highlighted */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Amount to Transfer: </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                    ₹{currentPrice.toFixed(2)}
                  </span>
                </div>

                {/* Copy VPA Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    color: theme.colors.primaryNavy,
                  }}
                >
                  <span>UPI ID: <strong>{upiId}</strong></span>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: copiedVpa ? '#16A34A' : theme.colors.sunsetOrange,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                    }}
                  >
                    {copiedVpa ? <Check size={14} /> : <Copy size={14} />}
                    {copiedVpa ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Open in Mobile UPI App link */}
                <a
                  href={upiUri}
                  style={{
                    marginTop: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#0284C7',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Smartphone size={14} /> Pay Directly from Installed UPI App (GPay/PhonePe)
                </a>
              </div>

              {/* Step 3: Enter 12-digit UTR Reference */}
              <form onSubmit={handleSubmitUTR}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  3. Enter 12-Digit UPI Reference (UTR)
                </label>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <input
                    type="text"
                    maxLength={12}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 431289104821"
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: theme.radii.md,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      letterSpacing: '2px',
                      textAlign: 'center',
                      outline: 'none',
                      color: theme.colors.primaryNavy,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </div>
                <span style={{ display: 'block', fontSize: '0.74rem', color: theme.colors.textMuted, marginBottom: '20px' }}>
                  💡 Found under "UPI Transaction ID" or "Google Transaction ID" in your GPay / PhonePe / Paytm receipt.
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: theme.radii.md,
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: theme.shadows.orangeGlow,
                  }}
                >
                  {submitting ? 'Verifying Reference...' : 'Verify UTR & Activate Subscription'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
