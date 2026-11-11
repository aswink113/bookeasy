import React, { useState } from 'react';
import { 
  Star, 
  X, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Store, 
  ThumbsUp, 
  ShieldCheck,
  Heart
} from 'lucide-react';
import { theme } from '../theme/appTheme';

/**
 * ReviewModal
 * Luxury 5-Star Rating & Feedback modal template for Bokivo customers.
 * Includes interactive hover stars, rating sentiment tags, optional comment, and instant submission.
 */
export default function ReviewModal({ booking, isOpen, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const RATING_SENTIMENTS = {
    1: { label: 'Needs Improvement', desc: 'Disappointed with the experience' },
    2: { label: 'Fair Service', desc: 'Could have been much better' },
    3: { label: 'Good Experience', desc: 'Average and satisfactory' },
    4: { label: 'Great Service!', desc: 'Very pleased with the partner' },
    5: { label: 'Exceptional & Flawless! ✨', desc: 'Exceeded all expectations' },
  };

  const activeScore = hoverRating || rating;
  const sentiment = RATING_SENTIMENTS[activeScore] || RATING_SENTIMENTS[5];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating between 1 and 5');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (onReviewSubmitted) {
        await onReviewSubmitted({
          bookingId: booking.id,
          rating,
          comment,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(15, 30, 54, 0.3)',
          border: '1px solid #E2E8F0',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 26px 18px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)',
              }}
            >
              <Star size={22} fill="#F59E0B" color="#F59E0B" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                Rate Your Experience
              </h3>
              <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>
                Help fellow customers discover top verified venues
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.15s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {success ? (
          /* Thank You Screen */
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Check size={32} color="#166534" />
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
              Thank You for Your Feedback!
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.textSecondary }}>
              Your verified rating has been published to {booking.shop_name}'s profile.
            </p>
          </div>
        ) : (
          /* Rating Form */
          <form onSubmit={handleSubmit} style={{ padding: '24px 26px' }}>
            {error && (
              <div
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '16px',
                  border: '1px solid #FECACA',
                }}
              >
                {error}
              </div>
            )}

            {/* Merchant Details Box */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '16px',
                padding: '14px 18px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '22px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Store size={20} color={theme.colors.sunsetOrange} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  {booking.shop_name}
                </h4>
                <span style={{ fontSize: '0.8rem', color: theme.colors.textSecondary }}>
                  {booking.service_type || 'Service'} • {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* 5-Star Interactive Rating Selector */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', gap: '10px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);

                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        transform: (hoverRating || rating) === star ? 'scale(1.2)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <Star
                        size={38}
                        fill={isFilled ? '#F59E0B' : 'transparent'}
                        color={isFilled ? '#F59E0B' : '#CBD5E1'}
                        strokeWidth={isFilled ? 0 : 1.5}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Sentiment Dynamic Card */}
              <div style={{ minHeight: '44px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                  {sentiment.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, marginTop: '2px' }}>
                  {sentiment.desc}
                </div>
              </div>
            </div>

            {/* Review Comment Box */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: theme.colors.primaryNavy,
                  marginBottom: '8px',
                }}
              >
                <MessageSquare size={14} color={theme.colors.sunsetOrange} />
                <span>Write Your Review (Optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the punctuality, cleanliness, hospitality, and quality of service? Share your thoughts..."
                rows={4}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2E8F0',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'none',
                  backgroundColor: '#FFFFFF',
                  color: theme.colors.primaryNavy,
                  lineHeight: '1.4',
                }}
                onFocus={(e) => (e.target.style.borderColor = theme.colors.sunsetOrange)}
                onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
              />
            </div>

            {/* Submit Action Button */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: theme.radii.md,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <Star size={18} fill="#FFFFFF" />
                <span>{submitting ? 'Submitting...' : 'Submit Rating & Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
