import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  Check,
  Zap,
  Clock,
  Smartphone,
  Crown,
  TrendingUp,
  Star,
  Lock,
  Unlock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

export default function MerchantSubscriptionModal({ isOpen, onClose, onSubscribed }) {
  const [plans, setPlans] = useState(null);
  
  // Selected Plan: 'trial', 'base', 'plus', 'premium'
  const [selectedPlanId, setSelectedPlanId] = useState('trial');
  
  const [merchantUpiId, setMerchantUpiId] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  // Define the 3 Tiers: Base, Plus, Premium + 14-Day Free Trial
  const TIERS = [
    {
      id: 'trial',
      name: '14-Day Free Trial',
      tagline: 'Risk-Free Experience',
      badge: 'FREE TRIAL',
      badgeColor: '#0284C7',
      priceDisplay: '₹2',
      periodText: 'one-time token service fee',
      durationDays: 14,
      amount: plans?.trial_fee || 2,
      gradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(14, 165, 233, 0.05) 100%)',
      borderGlow: 'rgba(2, 132, 199, 0.4)',
      icon: <Clock size={20} color="#0284C7" />,
      features: [
        { title: 'Full Merchant Dashboard Access', unlocked: true },
        { title: 'Real-Time Appointment Requests', unlocked: true },
        { title: 'Customer Email Confirmations', unlocked: true },
        { title: 'Slot Locking Prevention', unlocked: true },
        { title: 'City-wide Discovery Priority', unlocked: false },
        { title: 'Exclusive Verified Partner Badge', unlocked: false },
        { title: 'Dedicated Partner Support', unlocked: false },
      ],
    },
    {
      id: 'base',
      name: 'Base Plan',
      tagline: 'Essential Shop Discovery',
      badge: 'STARTER',
      badgeColor: '#64748B',
      priceDisplay: '₹299',
      periodText: '/ month (billed monthly)',
      durationDays: 30,
      amount: plans?.monthly_amount || 299,
      gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 250, 252, 0.5) 100%)',
      borderGlow: 'rgba(203, 213, 225, 0.8)',
      icon: <Layers size={20} color="#64748B" />,
      features: [
        { title: 'Full Merchant Dashboard Access', unlocked: true },
        { title: 'Real-Time Appointment Requests', unlocked: true },
        { title: 'Automated Email Notifications', unlocked: true },
        { title: 'Real-time Slot Locking Protection', unlocked: true },
        { title: 'Verified Partner Badge', unlocked: true },
        { title: 'Priority Search Boost', unlocked: false },
        { title: 'VIP Support Hotline', unlocked: false },
      ],
    },
    {
      id: 'plus',
      name: 'Plus Plan',
      tagline: 'High Growth & Smart Bookings',
      badge: 'MOST POPULAR',
      badgeColor: '#FF7A00',
      priceDisplay: '₹799',
      periodText: '3 Months (₹266/mo • 11% OFF)',
      durationDays: 90,
      amount: plans?.quarterly_amount || 799,
      gradient: 'linear-gradient(135deg, rgba(255, 122, 0, 0.12) 0%, rgba(255, 158, 66, 0.04) 100%)',
      borderGlow: '#FF7A00',
      popular: true,
      icon: <TrendingUp size={20} color="#FF7A00" />,
      features: [
        { title: 'All Base Plan Capabilities', unlocked: true },
        { title: '3x Higher Discovery Ranking in City', unlocked: true },
        { title: 'Gold Verified Partner Seal', unlocked: true },
        { title: 'Zero Commission on Walk-ins', unlocked: true },
        { title: 'Extended 90-Day Active Listing', unlocked: true },
        { title: 'SMS & WhatsApp Reminders', unlocked: true },
        { title: 'VIP Account Manager Hotline', unlocked: false },
      ],
    },
    {
      id: 'premium',
      name: 'Premium VIP',
      tagline: 'Ultimate Visibility & Full Suite',
      badge: 'BEST VALUE (25% OFF)',
      badgeColor: '#16A34A',
      priceDisplay: '₹2,699',
      periodText: 'Annual 12 Months (₹224/mo)',
      durationDays: 365,
      amount: plans?.annual_amount || 2699,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.03) 100%)',
      borderGlow: '#10B981',
      icon: <Crown size={22} color="#16A34A" />,
      features: [
        { title: 'All Base & Plus Features Included', unlocked: true },
        { title: '#1 Top Placement in City Search', unlocked: true },
        { title: 'Crown VIP Partner Badge & Recognition', unlocked: true },
        { title: '365 Days Uninterrupted Active Status', unlocked: true },
        { title: 'Dedicated 24/7 Priority Manager', unlocked: true },
        { title: 'Custom Promotion Campaigns & Banners', unlocked: true },
        { title: 'Bokivo Featured Spotlight Placement', unlocked: true },
      ],
    },
  ];

  useEffect(() => {
    if (isOpen) {
      loadPlanInfo();
      setError('');
      setSuccessResult(null);
      setUtrNumber('');
      setMerchantUpiId('');
    }
  }, [isOpen]);

  const loadPlanInfo = async () => {
    setLoadingInfo(true);
    try {
      const data = await apiService.getUPIPlanInfo();
      setPlans(data);
    } catch (err) {
      setError(err.message || 'Failed to load subscription details');
    } finally {
      setLoadingInfo(false);
    }
  };

  if (!isOpen) return null;

  const activeTier = TIERS.find((t) => t.id === selectedPlanId) || TIERS[0];
  const currentPrice = activeTier.amount;
  const upiId = plans?.upi_id || 'bokivo@upi';
  const payeeName = plans?.payee_name || 'Bokivo Partner Network';

  // Standard NPCI UPI URI string format
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${currentPrice.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Bokivo ${activeTier.name}`)}`;

  // High-res QR code generator API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(upiUri)}`;

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  const handleSubmitUTR = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedPlanId === 'trial') {
      const cleanVpa = merchantUpiId.trim();
      if (!cleanVpa || !cleanVpa.includes('@')) {
        setError('Please enter a valid Merchant UPI ID (e.g. yourshop@okhdfcbank) to link your 14-day free trial.');
        return;
      }
    }

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length !== 12) {
      setError('UPI Reference (UTR) must be exactly 12 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.submitSubscriptionUTR(
        cleanUtr, 
        selectedPlanId, 
        currentPrice, 
        merchantUpiId.trim()
      );
      setSuccessResult(res);
      if (onSubscribed) onSubscribed(res);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the UTR number entered.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
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
          borderRadius: '28px',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass Header with Bokivo Geometry */}
        <div
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, #0F1E36 0%, #1E3A5F 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              right: '-40px',
              top: '-40px',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 122, 0, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 2 }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FF7A00 0%, #FF9E42 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(255, 122, 0, 0.4)',
              }}
            >
              <Crown size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.3px' }}>
                  Bokivo Partner Tier Plans
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  0% Fee UPI Gateway
                </span>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                Select your preferred tier (Base, Plus, Premium or 14-Day Free Trial)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
              zIndex: 2,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '26px 28px', overflowY: 'auto', flex: 1, backgroundColor: '#F8FAFC' }}>
          {successResult ? (
            /* SUCCESS VIEW */
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                }}
              >
                <CheckCircle2 size={42} />
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: theme.colors.primaryNavy, margin: '0 0 10px' }}>
                Partner Plan Successfully Activated!
              </h3>
              <p style={{ fontSize: '0.98rem', color: theme.colors.textSecondary, margin: '0 0 24px', lineHeight: 1.5 }}>
                {successResult.message}
              </p>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${theme.colors.borderLight}`,
                  borderRadius: '18px',
                  padding: '20px',
                  maxWidth: '460px',
                  margin: '0 auto 28px',
                  textAlign: 'left',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: theme.colors.textMuted }}>Activated Plan</span>
                  <span style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{successResult.plan_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: theme.colors.textMuted }}>UPI Transaction Ref (UTR)</span>
                  <span style={{ fontWeight: 800, color: '#0284C7', fontFamily: 'monospace' }}>{successResult.utr_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: theme.colors.textMuted }}>Subscription Status</span>
                  <span style={{ fontWeight: 800, color: '#16A34A' }}>Active & Verified</span>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1E36 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: theme.radii.md,
                  padding: '13px 36px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 30, 54, 0.2)',
                }}
              >
                Go to Merchant Studio
              </button>
            </div>
          ) : (
            <div>
              {error && (
                <div
                  style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#991B1B',
                    padding: '12px 18px',
                    borderRadius: theme.radii.md,
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: INTERACTIVE GLASS-TYPE CARDS (Base, Plus, Premium + 14-Day Free Trial) */}
              <div style={{ marginBottom: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.92rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                    1. Choose Your Tier & Unlocked Features
                  </label>
                  <span style={{ fontSize: '0.78rem', color: theme.colors.textMuted }}>
                    Instant switch anytime • 0% Commission
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: '14px',
                  }}
                >
                  {TIERS.map((tier) => {
                    const isSelected = selectedPlanId === tier.id;

                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedPlanId(tier.id)}
                        style={{
                          background: isSelected
                            ? tier.gradient
                            : 'rgba(255, 255, 255, 0.85)',
                          backdropFilter: 'blur(12px)',
                          borderRadius: '20px',
                          border: isSelected
                            ? `2.5px solid ${tier.borderGlow}`
                            : '1.5px solid rgba(226, 232, 240, 0.8)',
                          boxShadow: isSelected
                            ? `0 12px 28px -4px ${tier.id === 'plus' ? 'rgba(255, 122, 0, 0.25)' : 'rgba(15, 30, 54, 0.15)'}`
                            : '0 4px 14px rgba(0, 0, 0, 0.03)',
                          padding: '18px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        }}
                      >
                        {/* Top Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span
                            style={{
                              backgroundColor: isSelected ? tier.badgeColor : '#E2E8F0',
                              color: isSelected ? '#FFFFFF' : '#475569',
                              fontSize: '0.64rem',
                              fontWeight: 900,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {tier.badge}
                          </span>
                          {tier.icon}
                        </div>

                        {/* Plan Title & Tagline */}
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ margin: '0 0 2px', fontSize: '1.08rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                            {tier.name}
                          </h4>
                          <span style={{ fontSize: '0.74rem', color: theme.colors.textMuted }}>
                            {tier.tagline}
                          </span>
                        </div>

                        {/* Price */}
                        <div style={{ marginBottom: '14px', borderBottom: '1px solid rgba(226, 232, 240, 0.6)', paddingBottom: '12px' }}>
                          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: theme.colors.primaryNavy, lineHeight: 1 }}>
                            {tier.priceDisplay}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: theme.colors.textMuted, marginTop: '3px' }}>
                            {tier.periodText}
                          </div>
                        </div>

                        {/* Unlocked Features List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
                          {tier.features.map((feat, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: feat.unlocked ? theme.colors.primaryNavy : '#94A3B8',
                                fontWeight: feat.unlocked ? 600 : 400,
                              }}
                            >
                              {feat.unlocked ? (
                                <Unlock size={12} color="#16A34A" style={{ flexShrink: 0 }} />
                              ) : (
                                <Lock size={12} color="#CBD5E1" style={{ flexShrink: 0 }} />
                              )}
                              <span style={{ textDecoration: feat.unlocked ? 'none' : 'line-through', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {feat.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Selected Indicator Pill */}
                        <div style={{ marginTop: '14px', paddingTop: '10px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: isSelected ? tier.badgeColor : theme.colors.textMuted,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isSelected ? '✓ Selected Plan' : 'Click to Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: DYNAMIC UPI QR SCAN & AUTO-LINKING */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '22px',
                  border: `1.5px solid ${theme.colors.borderLight}`,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  padding: '22px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '24px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {/* Left: Dynamic QR Container */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '220px', flex: '0 0 auto' }}>
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: '12px',
                      borderRadius: '16px',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #E2E8F0',
                      marginBottom: '10px',
                    }}
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Bokivo Dynamic UPI QR"
                      style={{ width: '180px', height: '180px', display: 'block', borderRadius: '8px' }}
                    />
                  </div>

                  <span style={{ fontSize: '0.72rem', color: theme.colors.textMuted }}>
                    Scan with GPay, PhonePe, Paytm, BHIM
                  </span>
                </div>

                {/* Right: Payment Instructions & Deep Link */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '4px 12px', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 800, marginBottom: '10px' }}>
                    <Sparkles size={13} color="#2563EB" /> Selected: {activeTier.name}
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.84rem', color: theme.colors.textMuted }}>Payable via Direct UPI: </span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                      ₹{currentPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Copy VPA */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: theme.radii.md,
                      padding: '8px 14px',
                      marginBottom: '14px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <span style={{ color: theme.colors.primaryNavy }}>
                      UPI ID: <strong>{upiId}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVpa}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedVpa ? '#16A34A' : theme.colors.sunsetOrange,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {copiedVpa ? <Check size={14} /> : <Copy size={14} />}
                      {copiedVpa ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Open in Mobile UPI App link */}
                  <a
                    href={upiUri}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#F0FDFA',
                      border: '1px solid #CCFBF1',
                      color: '#0D9488',
                      padding: '9px 16px',
                      borderRadius: theme.radii.md,
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                    }}
                  >
                    <Smartphone size={15} /> Pay via Installed UPI App (GPay / PhonePe)
                  </a>
                </div>
              </div>

              {/* STEP 3: UTR SUBMISSION & AUTO-PAY LINKING */}
              <form onSubmit={handleSubmitUTR} style={{ backgroundColor: '#FFFFFF', padding: '22px', borderRadius: '22px', border: `1.5px solid ${theme.colors.borderLight}` }}>
                {selectedPlanId === 'trial' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                      Merchant UPI ID (For AutoPay & Mandate Verification)
                    </label>
                    <input
                      type="text"
                      value={merchantUpiId}
                      onChange={(e) => setMerchantUpiId(e.target.value)}
                      placeholder="e.g. yourshop@okhdfcbank or merchant@paytm"
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: theme.radii.md,
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.94rem',
                        fontWeight: 700,
                        color: theme.colors.primaryNavy,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <span style={{ display: 'block', fontSize: '0.75rem', color: theme.colors.textMuted, marginTop: '4px' }}>
                      Token charge of ₹2 verifies your UPI account. 14-day free access starts immediately!
                    </span>
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    12-Digit UPI Reference Number (UTR / Transaction ID)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. 431289104821"
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: theme.radii.md,
                      border: '1.5px solid #CBD5E1',
                      fontSize: '1.18rem',
                      fontWeight: 900,
                      letterSpacing: '3px',
                      textAlign: 'center',
                      outline: 'none',
                      color: theme.colors.primaryNavy,
                      boxSizing: 'border-box',
                    }}
                  />
                  <span style={{ display: 'block', fontSize: '0.75rem', color: theme.colors.textMuted, marginTop: '5px' }}>
                    💡 Check the successful payment receipt in GPay / PhonePe / Paytm for the 12-digit UTR/Ref.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: theme.radii.md,
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.96rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: theme.shadows.orangeGlow,
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {submitting
                    ? 'Verifying Payment Reference...'
                    : `Confirm UTR & Unlock ${activeTier.name}`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
