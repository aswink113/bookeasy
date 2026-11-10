import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  X, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Send, 
  KeyRound, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

export default function EditProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const currentUser = apiService.getUser();

  const [name, setName] = useState(currentUser?.name || '');
  const [newEmail, setNewEmail] = useState(currentUser?.email || '');
  const [otp, setOtp] = useState('');
  
  // OTP flow states
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpHint, setOtpHint] = useState('');

  if (!isOpen) return null;

  const isEmailChanged = newEmail.trim().toLowerCase() !== (currentUser?.email || '').toLowerCase();

  const handleSendOtp = async () => {
    setError('');
    setSuccess('');
    setOtpHint('');

    if (!newEmail.trim() || !newEmail.includes('@')) {
      setError('Please enter a valid new email address');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await apiService.sendEmailChangeOTP(newEmail);
      setOtpSent(true);
      setSuccess(`A 6-digit OTP verification code was sent to ${newEmail}`);
      if (res.dev_hint) {
        setOtpHint(`Dev mode OTP: ${res.dev_hint}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP to new email');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Username / Name cannot be blank');
      return;
    }

    if (isEmailChanged && !otp.trim()) {
      setError('Please request and enter the OTP sent to your new email to verify ownership');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        ...(isEmailChanged ? { newEmail: newEmail.trim(), emailOtp: otp.trim() } : {})
      };

      const updated = await apiService.updateProfile(payload);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onProfileUpdated(updated);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update profile. If you changed your email, check your OTP.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
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
          borderRadius: theme.radii.xl,
          maxWidth: '500px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #0F1E36 0%, #1E3A5F 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 122, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} color={theme.colors.sunsetOrange} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>My Profile Settings</h3>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Update username & verified email</span>
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

        {/* Content Body */}
        <form onSubmit={handleSaveProfile} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                padding: '12px 14px',
                borderRadius: theme.radii.md,
                fontSize: '0.85rem',
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

          {success && (
            <div
              style={{
                backgroundColor: '#DCFCE7',
                border: '1px solid #BBF7D0',
                color: '#166534',
                padding: '12px 14px',
                borderRadius: theme.radii.md,
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px',
              }}
            >
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}

          {otpHint && (
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                padding: '8px 12px',
                borderRadius: theme.radii.md,
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '18px',
              }}
            >
              💡 {otpHint}
            </div>
          )}

          {/* Username Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
              Username / Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: theme.radii.md,
                  border: `1.5px solid ${theme.colors.borderLight}`,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                  color: theme.colors.primaryNavy,
                  backgroundColor: '#F8FAFC',
                }}
              />
            </div>
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                Email Address
              </label>
              {isEmailChanged && (
                <span style={{ fontSize: '0.75rem', color: theme.colors.sunsetOrange, fontWeight: 700 }}>
                  * Requires OTP verification
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setOtpSent(false);
                  setOtp('');
                }}
                placeholder="Enter new email address"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: theme.radii.md,
                  border: isEmailChanged ? `1.5px solid ${theme.colors.sunsetOrange}` : `1.5px solid ${theme.colors.borderLight}`,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  outline: 'none',
                  color: theme.colors.primaryNavy,
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>
          </div>

          {/* If email is changed: Show OTP verification step */}
          {isEmailChanged && (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px dashed #CBD5E1',
                borderRadius: theme.radii.lg,
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={15} color={theme.colors.sunsetOrange} /> OTP Code for New Email
                </span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  style={{
                    backgroundColor: theme.colors.sunsetOrange,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: theme.radii.md,
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: sendingOtp ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Send size={12} /> {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP received on new email"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: theme.radii.md,
                  border: '1.5px solid #CBD5E1',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '3px',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: theme.colors.primaryNavy,
                }}
              />
              <span style={{ display: 'block', marginTop: '6px', fontSize: '0.74rem', color: theme.colors.textMuted }}>
                If the OTP is wrong or invalid, your new email request will be automatically rejected.
              </span>
            </div>
          )}

          {/* Buttons Footer */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.textSecondary,
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: '12px',
                borderRadius: theme.radii.md,
                border: 'none',
                background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1E36 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15, 30, 54, 0.2)',
              }}
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
