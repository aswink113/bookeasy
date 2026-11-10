import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

export default function CustomerProfileDrawer({ isOpen, onClose, onOpenBookings, onOpenEditProfile, onLogout }) {
  const user = apiService.getUser();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '24px 20px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: theme.colors.accentBlue,
                color: theme.colors.primaryNavy,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.4rem',
              }}
            >
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {user.name || 'Valued Customer'}
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Customer Account</span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  marginTop: '4px',
                }}
              >
                <Sparkles size={11} /> Bokivo Verified
              </div>
            </div>
          </div>
        </div>

        {/* Quick Menu Options */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            My Activity
          </div>

          <div
            onClick={() => {
              onClose();
              onOpenBookings();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: theme.radii.lg,
              cursor: 'pointer',
              backgroundColor: '#F8FAFC',
              border: `1px solid ${theme.colors.borderLight}`,
              marginBottom: '10px',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color={theme.colors.accentBlue} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.colors.primaryNavy }}>My Appointments</div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>View, reschedule or cancel bookings</div>
              </div>
            </div>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: theme.radii.lg,
              cursor: 'pointer',
              backgroundColor: '#F8FAFC',
              border: `1px solid ${theme.colors.borderLight}`,
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: theme.colors.primaryNavy }}>Saved Favorites</div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Your preferred salons, spas & clinics</div>
              </div>
            </div>
            <ChevronRight size={18} color={theme.colors.textMuted} />
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Account & Settings
          </div>

          <div
            onClick={() => {
              onClose();
              onOpenEditProfile();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: theme.radii.lg,
              cursor: 'pointer',
              backgroundColor: '#EFF6FF',
              border: `1.5px solid ${theme.colors.accentBlue}`,
              marginBottom: '10px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DBEAFE')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: theme.colors.primaryNavy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.colors.primaryNavy }}>My Profile & Settings</div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>Edit name, change email with OTP</div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.colors.primaryNavy, backgroundColor: '#FFFFFF', padding: '4px 10px', borderRadius: '12px' }}>
              Edit
            </span>
          </div>

          {[
            { icon: <CreditCard size={18} color="#6366F1" />, title: 'Payment Methods & UPI', desc: 'Manage saved cards, UPI and wallets' },
            { icon: <Bell size={18} color="#F59E0B" />, title: 'Notifications & Alerts', desc: 'SMS, WhatsApp and booking reminders' },
            { icon: <Shield size={18} color="#10B981" />, title: 'Privacy & Security', desc: 'Password, permissions and account data' },
            { icon: <HelpCircle size={18} color="#0EA5E9" />, title: '24/7 Customer Support', desc: 'Help center, FAQs and instant chat' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: theme.radii.lg,
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: theme.colors.textPrimary }}>{item.title}</div>
                  <div style={{ fontSize: '0.72rem', color: theme.colors.textMuted }}>{item.desc}</div>
                </div>
              </div>
              <ChevronRight size={16} color={theme.colors.borderDark} />
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: `1px solid ${theme.colors.borderLight}`,
            backgroundColor: '#F8FAFC',
          }}
        >
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: theme.radii.md,
              border: '1px solid #FCA5A5',
              backgroundColor: '#FFFFFF',
              color: '#DC2626',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <LogOut size={16} /> Sign Out of Bokivo
          </button>
        </div>
      </div>
    </div>
  );
}

