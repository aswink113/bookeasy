import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

export default function LoginScreen({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiService.login(email.trim(), password);
      const role = res?.user?.role || localStorage.getItem('user_role');
      if (role === 'customer') {
        onNavigate('customer-home');
      } else {
        onNavigate('merchant-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: theme.radii.xl,
          padding: '40px 32px',
          boxShadow: theme.shadows.card,
          border: `1px solid ${theme.colors.borderLight}`,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
            Welcome Back
          </h2>
          <p style={{ color: theme.colors.textSecondary, fontSize: '0.95rem', margin: 0 }}>
            Log in to your Bokivo account.
          </p>
        </div>

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

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color={theme.colors.textMuted}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px 12px 42px',
                  borderRadius: theme.radii.md,
                  border: `1px solid ${theme.colors.borderLight}`,
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: '#FAFAFA',
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.colors.textPrimary }}>
                Password
              </label>
              <span style={{ fontSize: '0.825rem', color: theme.colors.accentBlue, cursor: 'pointer', fontWeight: 600 }}>
                Forgot?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color={theme.colors.textMuted}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 42px 12px 42px',
                  borderRadius: theme.radii.md,
                  border: `1px solid ${theme.colors.borderLight}`,
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: '#FAFAFA',
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              backgroundColor: theme.colors.primaryNavy,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.radii.md,
              padding: '14px 20px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Log In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: theme.colors.textSecondary }}>
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('signup')}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.accentBlue,
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

