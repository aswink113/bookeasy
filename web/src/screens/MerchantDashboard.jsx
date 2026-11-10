import React, { useState } from 'react';
import { Store, Calendar, Clock, Check, X, Bell, Settings, LogOut, TrendingUp, Users } from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

export default function MerchantDashboard({ onNavigate }) {
  const [requests, setRequests] = useState([
    { id: 1, customer: 'Aswin Kumar', service: 'Haircut & Styling', time: 'Today, 4:00 PM', price: '₹450', status: 'pending' },
    { id: 2, customer: 'Sreya Sen', service: 'Deep Tissue Massage', time: 'Tomorrow, 11:00 AM', price: '₹1200', status: 'pending' },
    { id: 3, customer: 'Ravi Shankar', service: 'Car Wash & Polish', time: 'Jan 28, 2:30 PM', price: '₹650', status: 'pending' },
    { id: 4, customer: 'Neha Sharma', service: 'Facial & Glow Therapy', time: 'Jan 29, 5:00 PM', price: '₹850', status: 'pending' },
  ]);

  const handleAction = (id, newStatus) => {
    setRequests(
      requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.surfaceWhite }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${theme.colors.borderLight}`,
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Bokivo Logo"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                Merchant Studio
              </h2>
              <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>Bokivo Partner Hub</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                apiService.logout();
                onNavigate('login');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.errorRed,
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* KPI Quick Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              padding: '24px',
              border: `1px solid ${theme.colors.borderLight}`,
              boxShadow: theme.shadows.card,
            }}
          >
            <div style={{ fontSize: '0.85rem', color: theme.colors.textSecondary, fontWeight: 600 }}>Active Bookings</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.colors.primaryNavy, marginTop: '8px' }}>
              {requests.filter((r) => r.status === 'pending').length} Pending
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              padding: '24px',
              border: `1px solid ${theme.colors.borderLight}`,
              boxShadow: theme.shadows.card,
            }}
          >
            <div style={{ fontSize: '0.85rem', color: theme.colors.textSecondary, fontWeight: 600 }}>Confirmed This Week</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.colors.successGreen, marginTop: '8px' }}>
              18 Completed
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              padding: '24px',
              border: `1px solid ${theme.colors.borderLight}`,
              boxShadow: theme.shadows.card,
            }}
          >
            <div style={{ fontSize: '0.85rem', color: theme.colors.textSecondary, fontWeight: 600 }}>Gross Booking Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.colors.accentBlue, marginTop: '8px' }}>
              ₹14,250
            </div>
          </div>
        </div>

        {/* Bookings Queue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: theme.radii.xl,
            padding: '28px',
            border: `1px solid ${theme.colors.borderLight}`,
            boxShadow: theme.shadows.card,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
              Booking Requests
            </h3>
            <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Real-Time Dispatch</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${theme.colors.borderLight}`,
                  borderRadius: theme.radii.lg,
                  padding: '20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  backgroundColor: item.status !== 'pending' ? '#F8FAFC' : '#FFFFFF',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: theme.colors.primaryNavy }}>
                      {item.customer}
                    </h4>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: theme.radii.full,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: '#EFF6FF',
                        color: theme.colors.accentBlue,
                      }}
                    >
                      {item.service}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: theme.colors.textSecondary }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {item.time}
                    </span>
                    <span style={{ fontWeight: 700, color: theme.colors.primaryNavy }}>{item.price}</span>
                  </div>
                </div>

                <div>
                  {item.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleAction(item.id, 'accepted')}
                        style={{
                          backgroundColor: theme.colors.successGreen,
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: theme.radii.md,
                          padding: '10px 20px',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Check size={16} /> Accept
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'declined')}
                        style={{
                          backgroundColor: 'transparent',
                          color: theme.colors.errorRed,
                          border: `1px solid ${theme.colors.errorRed}`,
                          borderRadius: theme.radii.md,
                          padding: '10px 18px',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <X size={16} /> Decline
                      </button>
                    </div>
                  ) : item.status === 'accepted' ? (
                    <span style={{ color: theme.colors.successGreen, fontWeight: 700, fontSize: '0.9rem' }}>
                      ✓ Booking Accepted
                    </span>
                  ) : (
                    <span style={{ color: theme.colors.errorRed, fontWeight: 700, fontSize: '0.9rem' }}>
                      ✕ Booking Declined
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

