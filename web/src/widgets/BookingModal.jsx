import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  X, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  Store,
  Lock
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

export default function BookingModal({ merchant, onClose, onConfirm }) {
  // Step 1: 'datetime' (Choose Date & Slot) -> Step 2: 'confirm' (Review summary & Confirm)
  const [step, setStep] = useState('datetime');

  // Next 7 days generator for visual date cards
  const getDates = () => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      list.push({ iso, dayName, dayNum, monthName, raw: d });
    }
    return list;
  };

  const datesList = getDates();

  const [selectedDate, setSelectedDate] = useState(datesList[0].iso);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [lockedSlots, setLockedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch booked slots whenever merchant or selectedDate changes
  useEffect(() => {
    let isMounted = true;
    async function fetchLockedSlots() {
      if (!merchant?.id || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const slots = await apiService.getBookedSlots(merchant.id, selectedDate);
        if (isMounted) {
          setLockedSlots(slots);
          // If current selected slot is locked or empty, select the first available slot
          const allCandidateSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '11:30 AM',
            '12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM',
            '04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'
          ];
          const available = allCandidateSlots.filter(s => !slots.includes(s));
          if (available.length > 0) {
            setSelectedSlot(prev => (slots.includes(prev) || !prev ? available[0] : prev));
          } else {
            setSelectedSlot('');
          }
        }
      } catch (err) {
        console.error('Error fetching booked slots:', err);
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    fetchLockedSlots();
    return () => {
      isMounted = false;
    };
  }, [merchant?.id, selectedDate]);

  // Categorized slots (Morning, Afternoon, Evening)
  const timeCategories = [
    {
      label: 'Morning Slots',
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '11:30 AM'],
    },
    {
      label: 'Afternoon Slots',
      slots: ['12:30 PM', '01:30 PM', '02:30 PM', '03:30 PM'],
    },
    {
      label: 'Evening Slots',
      slots: ['04:30 PM', '05:30 PM', '06:30 PM', '07:30 PM'],
    },
  ];

  // Format chosen date for review step
  const getChosenDateDisplay = () => {
    const found = datesList.find((d) => d.iso === selectedDate);
    if (!found) return selectedDate;
    return `${found.dayName}, ${found.dayNum} ${found.monthName}`;
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select an available time slot.');
      return;
    }
    setStep('confirm');
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      // Parse slot time to hour and minute
      const [timePart, modifier] = selectedSlot.split(' ');
      let [hours, minutes] = timePart.split(':').map((n) => parseInt(n, 10));
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const d = new Date(selectedDate);
      d.setHours(hours, minutes, 0, 0);

      await onConfirm(merchant, d.toISOString(), notes);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)', // Lighter, clean backdrop
        backdropFilter: 'blur(8px)',
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
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(15, 30, 54, 0.2)',
          border: '1px solid #E2E8F0',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Ultra Crisp Modern Light Theme */}
        <div
          style={{
            padding: '22px 24px 18px',
            borderBottom: `1px solid #F1F5F9`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            color: theme.colors.primaryNavy,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step === 'confirm' && (
              <button
                type="button"
                onClick={() => setStep('datetime')}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: theme.colors.primaryNavy,
                }}
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                {step === 'datetime' ? 'Choose Date & Time' : 'Review & Confirm Booking'}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.84rem', color: theme.colors.sunsetOrange, fontWeight: 700 }}>
                {merchant.shop_name} • <span style={{ color: theme.colors.tealAccent }}>{merchant.service_type}</span>
              </p>
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F5F9';
              e.currentTarget.style.color = theme.colors.primaryNavy;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress Tracker (Step 1 -> Step 2) */}
        <div style={{ display: 'flex', borderBottom: `1px solid #E2E8F0`, backgroundColor: '#F8FAFC' }}>
          <div
            style={{
              flex: 1,
              padding: '11px 16px',
              textAlign: 'center',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: step === 'datetime' ? theme.colors.sunsetOrange : theme.colors.textMuted,
              borderBottom: step === 'datetime' ? `2.5px solid ${theme.colors.sunsetOrange}` : '2.5px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            1. Select Slot
          </div>
          <div
            style={{
              flex: 1,
              padding: '11px 16px',
              textAlign: 'center',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: step === 'confirm' ? theme.colors.sunsetOrange : theme.colors.textMuted,
              borderBottom: step === 'confirm' ? `2.5px solid ${theme.colors.sunsetOrange}` : '2.5px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            2. Confirm Booking
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {step === 'datetime' ? (
            /* STEP 1: DATE & TIME SELECTION */
            <div>
              {/* Date Selection Carousel */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: theme.colors.primaryNavy, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} color={theme.colors.accentBlue} /> Select Date
                  </label>
                  <span style={{ fontSize: '0.78rem', color: theme.colors.textMuted }}>Next 7 days available</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                  }}
                >
                  {datesList.map((d) => {
                    const isSelected = selectedDate === d.iso;
                    return (
                      <button
                        key={d.iso}
                        type="button"
                        onClick={() => setSelectedDate(d.iso)}
                        style={{
                          flex: '0 0 76px',
                          padding: '12px 6px',
                          borderRadius: theme.radii.lg,
                          border: isSelected ? `2px solid ${theme.colors.primaryNavy}` : `1px solid ${theme.colors.borderLight}`,
                          backgroundColor: isSelected ? theme.colors.primaryNavy : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? theme.colors.accentBlue : theme.colors.textSecondary }}>
                          {d.dayName}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                          {d.dayNum}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: isSelected ? '#CBD5E1' : theme.colors.textMuted }}>
                          {d.monthName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Categories */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.88rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                    <Clock size={16} color={theme.colors.accentBlue} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Select Time Slot
                  </label>
                  {loadingSlots ? (
                    <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Checking availability...</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} color="#EF4444" /> Locked slots are unavailable
                    </span>
                  )}
                </div>

                {timeCategories.map((cat, idx) => (
                  <div key={idx} style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      {cat.label}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {cat.slots.map((slot) => {
                        const isLocked = lockedSlots.includes(slot);
                        const isSelected = selectedSlot === slot && !isLocked;

                        if (isLocked) {
                          return (
                            <div
                              key={slot}
                              title="This slot is already booked and locked by another user"
                              style={{
                                padding: '10px 4px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                borderRadius: theme.radii.md,
                                border: '1px solid #FCA5A5',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                cursor: 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                opacity: 0.9,
                              }}
                            >
                              <Lock size={12} color="#DC2626" />
                              <span>{slot}</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            style={{
                              padding: '10px 4px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              borderRadius: theme.radii.md,
                              border: isSelected ? `2px solid ${theme.colors.primaryNavy}` : `1px solid ${theme.colors.borderLight}`,
                              backgroundColor: isSelected ? theme.colors.primaryNavy : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              boxShadow: isSelected ? '0 2px 8px rgba(15, 23, 42, 0.12)' : 'none',
                            }}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional Instructions */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.textPrimary, marginBottom: '6px' }}>
                  Notes / Requests for Partner (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. First time haircut, specific stylist..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Bottom Continue Button */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
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
                  type="button"
                  onClick={handleProceedToConfirm}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: theme.radii.md,
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 122, 0, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 122, 0, 0.35)';
                  }}
                >
                  <span>Continue</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: SUMMARY & CONFIRM BOOKING */
            <div>
              {/* Partner Card */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: theme.radii.xl,
                  padding: '18px',
                  border: `1px solid ${theme.colors.borderLight}`,
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: theme.radii.lg,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${theme.colors.borderLight}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Store size={26} color={theme.colors.primaryNavy} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                    {merchant.shop_name}
                  </h4>
                  <span style={{ fontSize: '0.82rem', color: theme.colors.accentBlue, fontWeight: 700 }}>
                    {merchant.service_type}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: theme.colors.textMuted, marginTop: '4px' }}>
                    <MapPin size={12} />
                    <span>{merchant.address}</span>
                  </div>
                </div>
              </div>

              {/* Slot Summary Box */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: theme.radii.lg,
                  border: `1px solid ${theme.colors.borderLight}`,
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: theme.colors.textMuted, fontWeight: 700 }}>
                    Scheduled Date & Time
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: theme.colors.primaryNavy, marginTop: '2px' }}>
                    {getChosenDateDisplay()} at {selectedSlot}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.colors.accentBlue,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Change
                </button>
              </div>

              {/* Price Details */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: theme.radii.lg,
                  border: `1px solid ${theme.colors.borderLight}`,
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  <span>Service Base Fee</span>
                  <span>₹{merchant.base_price || 299}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: theme.colors.textPrimary, marginBottom: '8px' }}>
                  <span>Instant Booking Convenience Fee</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
                </div>
                {notes && (
                  <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, borderTop: `1px dashed ${theme.colors.borderLight}`, paddingTop: '8px', marginTop: '8px' }}>
                    <strong>Note:</strong> "{notes}"
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, color: theme.colors.primaryNavy, borderTop: `1px solid ${theme.colors.borderLight}`, paddingTop: '10px', marginTop: '10px' }}>
                  <span>Total Payable at Venue</span>
                  <span style={{ color: theme.colors.primaryNavy }}>₹{merchant.base_price || 299}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                <ShieldCheck size={18} />
                <span>Zero cancellation fee • Instant partner confirmation</span>
              </div>

              {/* Final Confirm Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    backgroundColor: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    color: theme.colors.textSecondary,
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '13px',
                    borderRadius: theme.radii.md,
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.98rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
                    opacity: submitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 122, 0, 0.45)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 122, 0, 0.35)';
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{submitting ? 'Confirming Booking...' : 'Confirm Booking'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
