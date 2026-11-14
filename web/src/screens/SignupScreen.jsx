import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Store, 
  MapPin, 
  Tag, 
  DollarSign, 
  ArrowRight, 
  Loader2, 
  KeyRound, 
  CheckCircle2, 
  RefreshCw,
  Camera,
  Crop,
  Sparkles
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';
import TermsModal from '../widgets/TermsModal';
import ImageCropModal from '../widgets/ImageCropModal';

export default function SignupScreen({ onNavigate }) {
  const [role, setRole] = useState('customer'); // 'customer' | 'merchant'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpNotice, setOtpNotice] = useState('');

  // Dynamic Categories from database
  const [categoriesList, setCategoriesList] = useState([]);

  // Merchant specific fields
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState('Salon');

  useEffect(() => {
    // Fetch master categories from API
    apiService.getMasterCategories()
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
          setServiceType(cats[0].name);
        }
      })
      .catch(() => {
        // Fallback default categories
        setCategoriesList([
          { name: 'Salon', icon: '✂️' },
          { name: 'Spa & Massage', icon: '💆' },
          { name: 'Dental Clinic', icon: '🦷' },
          { name: 'Car Detailing', icon: '🚗' },
          { name: 'Fitness & Yoga', icon: '🧘' },
        ]);
      });
  }, []);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startOtpCountdown = () => {
    setOtpTimer(60);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setError('');
    setSendingOtp(true);
    try {
      const res = await apiService.sendOTP(email);
      setOtpSent(true);
      startOtpCountdown();
      if (res.dev_hint) {
        setOtpNotice(`Code sent from bokivo.team@gmail.com! (Dev Hint: ${res.dev_hint})`);
      } else {
        setOtpNotice('Verification 6-digit code has been dispatched to your email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check email.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    if (!otpSent) {
      setError('Please click "Send OTP" and verify your email address to continue.');
      return;
    }

    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.signup({
        name,
        email: email.trim(),
        password,
        role,
        otp: otp.trim(),
        shopName,
        address,
        serviceType,
      });

      // Auto login after signup
      await apiService.login(email.trim(), password);

      if (role === 'customer') {
        onNavigate('customer-home');
      } else {
        onNavigate('merchant-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.surfaceWhite,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: theme.radii.xl,
          padding: '40px 32px',
          boxShadow: theme.shadows.card,
          border: `1px solid ${theme.colors.borderLight}`,
        }}
      >
        {/* Header with App Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              border: `1px solid ${theme.colors.borderLight}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              padding: '8px',
            }}
          >
            <img
              src="/logo.png"
              alt="Bokivo Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: theme.colors.primaryNavy, margin: '0 0 8px 0' }}>
            Create an Account
          </h2>
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.95rem', margin: 0 }}>
            Secure email verification powered by Bokivo
          </p>
        </div>

        {/* Role Segment Control */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            padding: '4px',
            borderRadius: theme.radii.lg,
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => setRole('customer')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: theme.radii.md,
              border: 'none',
              backgroundColor: role === 'customer' ? '#FFFFFF' : 'transparent',
              color: role === 'customer' ? theme.colors.primaryNavy : theme.colors.textSecondary,
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: role === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('merchant')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: theme.radii.md,
              border: 'none',
              backgroundColor: role === 'merchant' ? '#FFFFFF' : 'transparent',
              color: role === 'merchant' ? theme.colors.primaryNavy : theme.colors.textSecondary,
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: role === 'merchant' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Merchant Partner
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: theme.colors.errorRed,
              padding: '12px 16px',
              borderRadius: theme.radii.md,
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* OTP Success notice */}
        {otpNotice && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #10B981',
              color: '#065F46',
              padding: '12px 16px',
              borderRadius: theme.radii.md,
              marginBottom: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} color="#10B981" />
            <span>{otpNotice}</span>
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color={theme.colors.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px 11px 42px',
                  borderRadius: theme.radii.md,
                  border: `1px solid ${theme.colors.borderLight}`,
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Email Address with OTP dispatch trigger */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Mail size={18} color={theme.colors.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 14px 11px 42px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={sendingOtp || otpTimer > 0}
                style={{
                  backgroundColor: otpSent ? '#F1F5F9' : theme.colors.primaryNavy,
                  color: otpSent ? theme.colors.primaryNavy : '#FFFFFF',
                  border: `1px solid ${theme.colors.borderLight}`,
                  borderRadius: theme.radii.md,
                  padding: '0 16px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: sendingOtp || otpTimer > 0 ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {sendingOtp ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : otpTimer > 0 ? (
                  `Resend in ${otpTimer}s`
                ) : otpSent ? (
                  <>
                    <RefreshCw size={14} /> Resend OTP
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </div>

          {/* 6-Digit OTP Code Input */}
          {otpSent && (
            <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                Enter 6-Digit OTP Code
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color={theme.colors.accentBlue} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 14px 11px 42px',
                    borderRadius: theme.radii.md,
                    border: `2px solid ${theme.colors.accentBlue}`,
                    fontSize: '1.05rem',
                    letterSpacing: '4px',
                    fontWeight: 700,
                    outline: 'none',
                    backgroundColor: '#F0F9FF',
                  }}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color={theme.colors.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 42px 11px 42px',
                  borderRadius: theme.radii.md,
                  border: `1px solid ${theme.colors.borderLight}`,
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.colors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Conditional Merchant Fields */}
          {role === 'merchant' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `1px solid ${theme.colors.borderLight}`, paddingTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Shop Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Store size={18} color={theme.colors.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required={role === 'merchant'}
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Urban Cut Studio"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 14px 11px 42px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Shop Address / Location
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color={theme.colors.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required={role === 'merchant'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="MG Road, Bangalore, India"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 14px 11px 42px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Service Category
                </label>
                <div style={{ position: 'relative' }}>
                  <Tag size={18} color={theme.colors.textMuted} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 14px 11px 42px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.95rem',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                    }}
                  >
                    {categoriesList.map((cat, idx) => (
                      <option key={cat.id || idx} value={cat.name}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted, marginTop: '6px' }}>
                  💡 Service catalog, pricing, hours, and store photos can be configured inside your Merchant Studio after signup.
                </div>
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: theme.colors.primaryNavy }}
            />
            <label htmlFor="terms" style={{ fontSize: '0.85rem', color: theme.colors.textSecondary }}>
              I accept the{' '}
              <span
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                style={{ color: theme.colors.accentBlue, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Terms of Service
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: theme.colors.primaryNavy,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.radii.md,
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
              boxShadow: theme.shadows.primaryNavy,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: theme.colors.textSecondary }}>
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.accentBlue,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Log In
          </button>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

      {/* Image Cropper Modal (16:9 Ratio) */}
      <ImageCropModal
        isOpen={showCropModal}
        imageSrc={tempImageForCrop}
        onClose={() => setShowCropModal(false)}
        onCropComplete={(croppedData) => {
          setCroppedImage(croppedData);
        }}
        aspectRatio={16 / 9}
      />
    </div>
  );
}
