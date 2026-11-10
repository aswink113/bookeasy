import React, { useState } from 'react';
import { Star, ShieldCheck, Check, Sparkles, ArrowRight } from 'lucide-react';
import { theme } from '../theme/appTheme';

export default function SubscriptionScreen({ onNavigate }) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = () => {
    setProcessing(true);

    // Simulate Razorpay checkout invocation
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('merchant-dashboard');
      }, 1500);
    }, 1800);
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
          padding: '44px 36px',
          boxShadow: theme.shadows.card,
          border: `1px solid ${theme.colors.borderLight}`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Star size={44} fill="#F59E0B" color="#F59E0B" />
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: theme.colors.primaryNavy, margin: '0 0 12px 0' }}>
          Unlock Merchant Power
        </h2>

        <p style={{ color: theme.colors.textSecondary, fontSize: '1rem', lineHeight: 1.6, margin: '0 0 32px 0' }}>
          Grow your business with Bokivo. Start your 15-day free trial or subscribe for just ₹999/month.
        </p>

        {/* Benefits list */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: `1px solid ${theme.colors.borderLight}`,
            borderRadius: theme.radii.lg,
            padding: '20px',
            textAlign: 'left',
            marginBottom: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {[
            'Unlimited customer bookings & inquiries',
            'Priority map placement in discovery feed',
            'Real-time customer push notifications (FCM)',
            'Advanced analytics & revenue ledger tracking',
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={13} color="#16A34A" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '0.9rem', color: theme.colors.textPrimary, fontWeight: 500 }}>
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Success or Action */}
        {success ? (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#DCFCE7',
              borderRadius: theme.radii.md,
              color: '#166534',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            Subscription Activated! Launching dashboard...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleSubscribe}
              disabled={processing}
              style={{
                backgroundColor: theme.colors.primaryNavy,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: theme.radii.md,
                padding: '16px 24px',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                cursor: processing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {processing ? (
                'Processing Razorpay Checkout...'
              ) : (
                <>
                  <Sparkles size={18} color="#F59E0B" /> SUBSCRIBE NOW (₹999/mo)
                </>
              )}
            </button>

            <button
              onClick={() => onNavigate('merchant-dashboard')}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.textSecondary,
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '8px',
                cursor: 'pointer',
              }}
            >
              Start 15-Day Free Trial →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

