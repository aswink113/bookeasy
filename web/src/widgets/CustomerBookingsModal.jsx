import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Store,
  RefreshCw,
  Star
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';
import ReviewModal from './ReviewModal';

export default function CustomerBookingsModal({ onClose }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [reviewingBooking, setReviewingBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getCustomerBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiService.cancelBooking(bookingId);
      setActionMsg('Booking has been cancelled.');
      setTimeout(() => setActionMsg(''), 3000);
      loadBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleReviewSubmit = async ({ bookingId, rating, comment }) => {
    try {
      await apiService.submitReview({ bookingId, rating, comment });
      setActionMsg('Thank you! Your 5-star review and rating have been recorded.');
      setTimeout(() => setActionMsg(''), 4000);
      await loadBookings();
    } catch (err) {
      throw err;
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'accepted' || s === 'confirmed') {
      return (
        <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={13} /> Accepted
        </span>
      );
    }
    if (s === 'declined' || s === 'cancelled') {
      return (
        <span style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <XCircle size={13} /> {s === 'cancelled' ? 'Cancelled' : 'Declined'}
        </span>
      );
    }
    return (
      <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Clock3 size={13} /> Pending Confirmation
      </span>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
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
          maxWidth: '680px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Ultra Crisp Light Theme */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.colors.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            color: theme.colors.primaryNavy,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: theme.colors.sunsetOrangeLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={20} color={theme.colors.sunsetOrange} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                My Appointments & Bookings
              </h3>
              <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>
                Track status and manage your scheduled services
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={loadBookings}
              title="Refresh"
              style={{
                background: '#F8FAFC',
                border: `1px solid ${theme.colors.borderLight}`,
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: theme.colors.textSecondary,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = theme.colors.primaryNavy;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#F8FAFC',
                border: `1px solid ${theme.colors.borderLight}`,
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: theme.colors.textSecondary,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = theme.colors.primaryNavy;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Action toast */}
        {actionMsg && (
          <div style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '10px 24px', fontSize: '0.85rem', fontWeight: 600 }}>
            {actionMsg}
          </div>
        )}

        {/* Content list */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.textSecondary }}>
              Loading your bookings...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '30px', color: theme.colors.errorRed }}>
              <AlertCircle size={28} style={{ marginBottom: '8px' }} />
              <p>{error}</p>
              <button
                onClick={loadBookings}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  backgroundColor: theme.colors.primaryNavy,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: theme.colors.textSecondary }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Calendar size={28} color={theme.colors.textMuted} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: theme.colors.primaryNavy }}>
                No active bookings yet
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: theme.colors.textMuted }}>
                Explore services in your city and click "Book Now" to schedule your first appointment!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {bookings.map((b) => {
                const dateObj = new Date(b.booking_date);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const canCancel = b.status === 'pending' || b.status === 'accepted';

                return (
                  <div
                    key={b.id}
                    style={{
                      border: `1px solid ${theme.colors.borderLight}`,
                      borderRadius: theme.radii.lg,
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: theme.radii.md,
                            backgroundColor: '#F8FAFC',
                            border: `1px solid ${theme.colors.borderLight}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Store size={22} color={theme.colors.primaryNavy} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                            {b.shop_name || 'Service Partner'}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: theme.colors.accentBlue, fontWeight: 700 }}>
                            {b.service_type || 'Service'}
                          </span>
                          {b.address && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: theme.colors.textMuted, marginTop: '2px' }}>
                              <MapPin size={12} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                {b.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {getStatusBadge(b.status)}
                        {b.base_price && (
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.colors.primaryNavy, marginTop: '6px' }}>
                            ₹{b.base_price}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '10px',
                        borderTop: `1px solid ${theme.colors.borderLight}`,
                        fontSize: '0.82rem',
                        color: theme.colors.textSecondary,
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={14} color={theme.colors.accentBlue} /> {formattedDate}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={14} color={theme.colors.accentBlue} /> {formattedTime}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Rating & Review Button: Show after booking time or completed, and hasn't reviewed yet */}
                        {(() => {
                          const isPast = new Date(b.booking_date).getTime() <= Date.now() || b.status === 'completed';
                          const isEligibleForReview = isPast && b.status !== 'cancelled' && b.status !== 'declined';
                          
                          if (b.has_reviewed) {
                            return (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  padding: '5px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  border: '1px solid #FDE68A',
                                }}
                              >
                                <Star size={13} fill="#F59E0B" color="#F59E0B" /> Reviewed
                              </span>
                            );
                          }

                          if (isEligibleForReview) {
                            return (
                              <button
                                onClick={() => setReviewingBooking(b)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: 'linear-gradient(135deg, #FF7A00 0%, #FF9E44 100%)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.35)',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 122, 0, 0.45)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 122, 0, 0.35)';
                                }}
                              >
                                <Star size={13} fill="#FFFFFF" color="#FFFFFF" /> Rate & Review (5★)
                              </button>
                            );
                          }

                          return null;
                        })()}

                        {canCancel && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            style={{
                              border: `1px solid #FCA5A5`,
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              padding: '5px 12px',
                              borderRadius: theme.radii.sm,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review & Rating Modal */}
      <ReviewModal
        booking={reviewingBooking}
        isOpen={Boolean(reviewingBooking)}
        onClose={() => setReviewingBooking(null)}
        onReviewSubmitted={handleReviewSubmit}
      />
    </div>
  );
}

