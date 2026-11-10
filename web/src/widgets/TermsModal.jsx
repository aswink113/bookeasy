import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { theme } from '../theme/appTheme';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: theme.radii.xl,
          maxWidth: '560px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme.shadows.modal,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.colors.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} color={theme.colors.accentBlue} />
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: theme.colors.primaryNavy }}>
              Terms of Service
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.colors.textSecondary,
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: theme.colors.textSecondary,
          }}
        >
          <p><strong>1. Acceptance of Terms:</strong> By using this app, you agree to comply with and be bound by these terms.</p>
          <p><strong>2. Service Description:</strong> Bokivo provides a platform for booking appointments with local merchants.</p>
          <p><strong>3. User Obligations:</strong> Users must provide accurate information during signup. Merchants are responsible for their services.</p>
          <p><strong>4. Privacy:</strong> We value your privacy and handle data as per our Privacy Policy.</p>
          <p><strong>5. Subscriptions:</strong> Merchant subscriptions are non-refundable after the trial period.</p>
          <p><strong>6. Termination:</strong> We reserve the right to terminate accounts that violate our community guidelines.</p>
          <p><strong>7. Liability:</strong> Bokivo is not liable for disputes between customers and merchants.</p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${theme.colors.borderLight}`,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: theme.colors.primaryNavy,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.radii.md,
              padding: '10px 24px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

