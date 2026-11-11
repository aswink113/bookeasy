import React, { useState, useEffect, useRef } from 'react';
import { Store, Calendar, Clock, Check, X, Bell, Settings, LogOut, TrendingUp, Users, RefreshCw, XCircle, User, Zap, ShieldCheck, Camera, Crop } from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';
import EditProfileModal from '../widgets/EditProfileModal';
import MerchantSubscriptionModal from '../widgets/MerchantSubscriptionModal';
import ImageCropModal from '../widgets/ImageCropModal';

export default function MerchantDashboard({ onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [subscription, setSubscription] = useState({ is_subscribed: false, subscription_end: null });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempCoverSrc, setTempCoverSrc] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const photoInputRef = useRef(null);
  const user = apiService.getUser();

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsData, subData] = await Promise.all([
        apiService.getMerchantBookings().catch(() => []),
        apiService.getSubscriptionStatus().catch(() => ({ is_subscribed: false })),
      ]);
      setRequests(bookingsData);
      setSubscription(subData);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAction = async (bookingId, newStatus) => {
    if (newStatus === 'declined' || newStatus === 'cancelled') {
      const confirmed = window.confirm(
        'Are you sure you want to cancel / decline this appointment? The customer will receive an immediate cancellation notification email.'
      );
      if (!confirmed) return;
    }

    setActionLoading(bookingId);
    try {
      await apiService.updateBookingStatus(bookingId, newStatus);
      setSuccessMsg(
        newStatus === 'accepted'
          ? 'Booking accepted successfully!'
          : 'Appointment cancelled/declined. Cancellation email sent to customer.'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted' || r.status === 'confirmed').length;
  const totalRevenue = requests
    .filter((r) => r.status === 'accepted' || r.status === 'confirmed')
    .reduce((sum, r) => sum + (Number(r.base_price) || 0), 0);

  const formatBookingDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
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
            {/* Change Shop Cover Photo with 16:9 Aspect Ratio Crop */}
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setTempCoverSrc(reader.result);
                    setShowCropModal(true);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={updatingPhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.primaryNavy,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: updatingPhoto ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              }}
            >
              <Camera size={15} color={theme.colors.sunsetOrange} />
              <span>{updatingPhoto ? 'Saving Photo...' : 'Update Cover (16:9)'}</span>
            </button>

            {/* Subscription Status Pill */}
            {subscription.is_subscribed ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  padding: '6px 14px',
                  borderRadius: theme.radii.full,
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: '1px solid #BBF7D0',
                }}
              >
                <ShieldCheck size={15} color="#166534" />
                <span>Active Partner Pro</span>
              </div>
            ) : (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: theme.radii.md,
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.3)',
                }}
              >
                <Zap size={15} />
                <span>Upgrade to Partner Pro</span>
              </button>
            )}

            <button
              onClick={() => setShowEditProfile(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.primaryNavy,
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <User size={16} color={theme.colors.sunsetOrange} />
              <span>My Profile ({user?.name || 'Partner'})</span>
            </button>

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
        {/* Alerts / Feedback Banner */}
        {successMsg && (
          <div
            style={{
              backgroundColor: '#DCFCE7',
              color: '#166534',
              padding: '14px 20px',
              borderRadius: theme.radii.lg,
              marginBottom: '24px',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>✓ {successMsg}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '14px 20px',
              borderRadius: theme.radii.lg,
              marginBottom: '24px',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: '1px solid #FECACA',
            }}
          >
            {error}
          </div>
        )}

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
              {pendingCount} Pending
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
            <div style={{ fontSize: '0.85rem', color: theme.colors.textSecondary, fontWeight: 600 }}>Confirmed Bookings</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: theme.colors.successGreen, marginTop: '8px' }}>
              {acceptedCount} Confirmed
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
              ₹{totalRevenue}
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
            <div>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                Booking Requests & Appointments
              </h3>
              <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Manage incoming client bookings in real-time</span>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#F8FAFC',
                color: theme.colors.primaryNavy,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textMuted }}>
              Loading booking requests...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textMuted }}>
              No bookings received yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {requests.map((item) => {
                const s = (item.status || '').toLowerCase();
                const isActioning = actionLoading === item.id;

                return (
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
                      backgroundColor: s !== 'pending' ? '#F8FAFC' : '#FFFFFF',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: theme.colors.primaryNavy }}>
                          {item.shop_name || 'Customer'}
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
                          {item.service_type || 'Service'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
                          ID: #{String(item.id).slice(0, 8).toUpperCase()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: theme.colors.textSecondary }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {formatBookingDate(item.booking_date)}
                        </span>
                        {item.base_price && (
                          <span style={{ fontWeight: 700, color: theme.colors.primaryNavy }}>₹{item.base_price}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {s === 'pending' ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            disabled={isActioning}
                            onClick={() => handleAction(item.id, 'accepted')}
                            style={{
                              backgroundColor: theme.colors.successGreen,
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: theme.radii.md,
                              padding: '10px 20px',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              cursor: isActioning ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Check size={16} /> Accept
                          </button>
                          <button
                            disabled={isActioning}
                            onClick={() => handleAction(item.id, 'declined')}
                            style={{
                              backgroundColor: 'transparent',
                              color: theme.colors.errorRed,
                              border: `1px solid ${theme.colors.errorRed}`,
                              borderRadius: theme.radii.md,
                              padding: '10px 18px',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              cursor: isActioning ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <X size={16} /> Decline
                          </button>
                        </div>
                      ) : s === 'accepted' || s === 'confirmed' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: theme.colors.successGreen, fontWeight: 700, fontSize: '0.9rem' }}>
                            ✓ Booking Accepted
                          </span>
                          <button
                            disabled={isActioning}
                            onClick={() => handleAction(item.id, 'cancelled')}
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B',
                              border: 'none',
                              borderRadius: theme.radii.md,
                              padding: '8px 14px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: isActioning ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <XCircle size={14} /> Cancel Appointment
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: theme.colors.errorRed, fontWeight: 700, fontSize: '0.9rem' }}>
                          ✕ {s === 'cancelled' ? 'Appointment Cancelled' : 'Booking Declined'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onProfileUpdated={(updated) => {
          setSuccessMsg(`Profile updated! Welcome, ${updated.name}`);
          setTimeout(() => setSuccessMsg(''), 4000);
        }}
      />

      {/* Direct UPI QR Subscription & Activation Modal */}
      <MerchantSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribed={(res) => {
          setSuccessMsg('🎉 Partner Pro Subscription Activated Successfully!');
          setTimeout(() => setSuccessMsg(''), 5000);
          loadDashboardData();
        }}
      />

      {/* 16:9 Cover Photo Cropping Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        imageSrc={tempCoverSrc}
        onClose={() => setShowCropModal(false)}
        onCropComplete={async (croppedData) => {
          setUpdatingPhoto(true);
          try {
            await apiService.updateMerchantPhoto(croppedData);
            setSuccessMsg('Shop cover photo updated with 16:9 widescreen crop!');
            setTimeout(() => setSuccessMsg(''), 5000);
          } catch (err) {
            alert(err.message || 'Failed to update cover photo');
          } finally {
            setUpdatingPhoto(false);
          }
        }}
        aspectRatio={16 / 9}
      />
    </div>
  );
}

