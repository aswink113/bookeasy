import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Star,
  Store,
  LogOut,
  CheckCircle2,
  ChevronDown,
  Navigation,
  Compass,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';
import LocationModal from '../widgets/LocationModal';
import BookingModal from '../widgets/BookingModal';
import CustomerBookingsModal from '../widgets/CustomerBookingsModal';
import CustomerProfileDrawer from '../widgets/CustomerProfileDrawer';

// Helper: Haversine distance in KM
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const CATEGORIES = [
  { label: 'All Services', icon: '✨' },
  { label: 'Salon', icon: '✂️' },
  { label: 'Spa & Massage', icon: '💆' },
  { label: 'Dental Clinic', icon: '🦷' },
  { label: 'Car Detailing', icon: '🚗' },
  { label: 'Fitness & Yoga', icon: '🧘' },
];

export default function CustomerHome({ onNavigate }) {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [bookingSuccess, setBookingSuccess] = useState('');
  
  // Modals state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [selectedMerchantForBooking, setSelectedMerchantForBooking] = useState(null);

  // Dynamic user location state
  const [location, setLocation] = useState({
    name: 'Bangalore, India',
    shortName: 'Bangalore',
    lat: 12.9716,
    lng: 77.5946,
    isDetected: false,
  });

  const user = apiService.getUser();

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const data = await apiService.getMerchants();
      if (Array.isArray(data) && data.length > 0) {
        setMerchants(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingModal = (merchant) => {
    setSelectedMerchantForBooking(merchant);
  };

  const handleConfirmBooking = async (merchant, bookingDate, notes) => {
    try {
      await apiService.createBooking(merchant.id, bookingDate);
      setSelectedMerchantForBooking(null);
      setBookingSuccess(`Booking confirmed with ${merchant.shop_name}! View receipt in "My Bookings" & check your email.`);
      setTimeout(() => setBookingSuccess(''), 6000);
    } catch (err) {
      if (err.message && (err.message.includes('expired') || err.message.includes('log in') || err.message.includes('token'))) {
        alert(`${err.message} Redirecting to login...`);
        onNavigate('login');
      } else {
        alert(`Booking request: ${err.message}`);
      }
    }
  };

  // Filter merchants based on query, category and calculate distances
  const filtered = merchants
    .map((m) => {
      const dist = getDistanceKm(location.lat, location.lng, m.latitude, m.longitude);
      return { ...m, distanceKm: dist };
    })
    .filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.shop_name?.toLowerCase().includes(q) ||
        m.service_type?.toLowerCase().includes(q) ||
        m.address?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === 'All Services' ||
        m.service_type?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: theme.colors.textPrimary }}>
      {/* Top Premium Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${theme.colors.borderLight}`,
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 4px 20px -2px rgba(15, 30, 54, 0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1260px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Logo & Location Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedCategory('All Services')}
            >
              <img
                src="/logo.png"
                alt="Bokivo Logo"
                style={{
                  width: '44px',
                  height: '44px',
                  objectFit: 'contain',
                }}
              />
              <div>
                <span
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    letterSpacing: '-0.5px',
                    color: theme.colors.brandNavy,
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  Bokivo
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: theme.colors.sunsetOrange, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Smart Bookings
                </span>
              </div>
            </div>

            {/* Dynamic Location Picker with Orange Accent Glow */}
            <div
              onClick={() => setShowLocationModal(true)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 14px',
                borderRadius: theme.radii.full,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(15, 30, 54, 0.04)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.sunsetOrange;
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 122, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.colors.borderLight;
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 30, 54, 0.04)';
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: location.isDetected ? '#DCFCE7' : theme.colors.sunsetOrangeLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={15} color={location.isDetected ? '#16A34A' : theme.colors.sunsetOrange} />
              </div>

              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: theme.colors.textMuted, fontWeight: 800, letterSpacing: '0.5px' }}>
                  {location.isDetected ? 'GPS Detected' : 'Location'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: theme.colors.primaryNavy, maxWidth: '190px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {location.name}
                  </span>
                  <ChevronDown size={14} color={theme.colors.sunsetOrange} />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Action Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* My Bookings Button */}
            <button
              onClick={() => setShowBookingsModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: theme.radii.full,
                border: `1.5px solid ${theme.colors.tealAccent}`,
                backgroundColor: theme.colors.tealLight,
                color: theme.colors.tealAccent,
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.tealAccent;
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.tealLight;
                e.currentTarget.style.color = theme.colors.tealAccent;
              }}
            >
              <Calendar size={16} />
              <span>My Bookings</span>
            </button>

            {/* Customer Profile & Settings Drawer */}
            <button
              onClick={() => setShowProfileDrawer(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px 6px 8px',
                borderRadius: theme.radii.full,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.colors.sunsetOrange)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.colors.borderLight)}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF7A00 0%, #FF9E42 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  boxShadow: '0 2px 6px rgba(255, 122, 0, 0.3)',
                }}
              >
                {(user.name || 'C').charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                {user.name || 'Customer'}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                apiService.logout();
                onNavigate('login');
              }}
              title="Logout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: theme.radii.full,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.errorRed,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1260px', margin: '0 auto', padding: '28px 16px' }}>
        {/* Booking Notification Toast */}
        {bookingSuccess && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: `1.5px solid ${theme.colors.successGreen}`,
              color: '#065F46',
              padding: '14px 22px',
              borderRadius: theme.radii.xl,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={22} color={theme.colors.successGreen} />
              <span>{bookingSuccess}</span>
            </div>
            <button
              onClick={() => setShowBookingsModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontWeight: 900,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              View in My Bookings →
            </button>
          </div>
        )}

        {/* Global Search Bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: '22px',
            boxShadow: '0 8px 24px -4px rgba(15, 30, 54, 0.08)',
            borderRadius: theme.radii.full,
            backgroundColor: '#FFFFFF',
            border: `1px solid ${theme.colors.borderLight}`,
            transition: 'border-color 0.2s',
          }}
        >
          <Search
            size={22}
            color={theme.colors.tealAccent}
            style={{ position: 'absolute', left: '20px', top: '16px' }}
          />
          <input
            type="text"
            placeholder="Search salons, dental clinics, luxury spas, car care..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '17px 150px 17px 54px',
              borderRadius: theme.radii.full,
              border: 'none',
              fontSize: '1rem',
              outline: 'none',
              backgroundColor: 'transparent',
              color: theme.colors.primaryNavy,
              fontWeight: 600,
            }}
          />
          <button
            onClick={() => setShowLocationModal(true)}
            style={{
              position: 'absolute',
              right: '8px',
              top: '7px',
              background: 'linear-gradient(135deg, #1E3A5F 0%, #0F1E36 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.radii.full,
              padding: '11px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 30, 54, 0.2)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Compass size={16} color={theme.colors.sunsetOrange} /> Change City
          </button>
        </div>

        {/* Categories Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '28px',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                style={{
                  padding: '9px 20px',
                  borderRadius: theme.radii.full,
                  border: isSelected ? 'none' : `1.5px solid ${theme.colors.borderLight}`,
                  background: isSelected
                    ? 'linear-gradient(135deg, #FF7A00 0%, #FF9E42 100%)'
                    : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : theme.colors.textSecondary,
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? theme.shadows.orangeGlow : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Discovery Hero Banner with Brand Color Geometry */}
        <div
          style={{
            borderRadius: theme.radii.xl,
            marginBottom: '36px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, #0F1E36 0%, #1E3A5F 55%, #134E5E 100%)',
            color: '#FFFFFF',
            padding: '36px 28px',
            boxShadow: '0 15px 35px -5px rgba(15, 30, 54, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          {/* Subtle Orange Glow Sphere in Hero */}
          <div
            style={{
              position: 'absolute',
              right: '-60px',
              top: '-60px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 122, 0, 0.25) 0%, rgba(255, 122, 0, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 122, 0, 0.2)',
                border: '1px solid rgba(255, 122, 0, 0.4)',
                color: '#FFB066',
                padding: '4px 12px',
                borderRadius: theme.radii.full,
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '12px',
              }}
            >
              <Sparkles size={12} /> Instant Appointments Confirmed
            </div>

            <h3 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.5px', color: '#FFFFFF' }}>
              Service Discovery in {location.shortName || location.name}
            </h3>
            <p style={{ margin: '8px 0 0', color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Coordinates: {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E • Pinpointing certified salons, wellness spas & clinics closest to you.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <button
              onClick={() => setShowLocationModal(true)}
              style={{
                background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: theme.radii.full,
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: theme.shadows.orangeGlow,
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Navigation size={15} />
              <span>Change City / Auto-Detect</span>
            </button>
          </div>
        </div>

        {/* Services Section Header */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: theme.colors.primaryNavy, margin: 0 }}>
                {selectedCategory === 'All Services' ? 'Nearby Verified Partners' : `${selectedCategory}s`}
              </h2>
              <span style={{ fontSize: '0.86rem', color: theme.colors.textSecondary }}>
                Sorted by closest proximity to {location.shortName || location.name}
              </span>
            </div>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: `1px solid ${theme.colors.borderLight}`,
                padding: '6px 14px',
                borderRadius: theme.radii.full,
                fontSize: '0.85rem',
                fontWeight: 800,
                color: theme.colors.brandNavy,
              }}
            >
              {filtered.length} partners available
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: theme.colors.textSecondary }}>
              Loading nearby partners...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}` }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: theme.colors.primaryNavy }}>No services found in this category</h3>
              <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: '0.9rem' }}>Try choosing another category or click "Change City" to search globally.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {filtered.map((merchant) => (
                <div
                  key={merchant.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: theme.radii.xl,
                    padding: '24px',
                    border: `1px solid ${theme.colors.borderLight}`,
                    boxShadow: theme.shadows.card,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '18px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = theme.shadows.cardHover;
                    e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.shadows.card;
                    e.currentTarget.style.borderColor = theme.colors.borderLight;
                  }}
                >
                  {/* Top card info */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: theme.radii.lg,
                        backgroundColor: '#F0FDFA',
                        border: '1.5px solid #CCFBF1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Store size={28} color={theme.colors.tealAccent} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 900, color: theme.colors.primaryNavy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {merchant.shop_name}
                        </h4>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            padding: '2px 8px',
                            borderRadius: theme.radii.full,
                            flexShrink: 0,
                          }}
                        >
                          <Star size={13} fill="#F59E0B" color="#F59E0B" />
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E' }}>
                            {merchant.rating || '4.8'}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: theme.colors.tealAccent, marginTop: '3px', fontWeight: 700 }}>
                        {merchant.service_type}
                      </div>

                      {merchant.address && (
                        <div style={{ fontSize: '0.78rem', color: theme.colors.textMuted, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} flexShrink={0} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {merchant.address}
                          </span>
                        </div>
                      )}

                      {merchant.distanceKm !== null && (
                        <div style={{ display: 'inline-block', backgroundColor: '#F1F5F9', color: theme.colors.brandNavy, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', marginTop: '6px' }}>
                          📍 {merchant.distanceKm} km away
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Book Now CTA in Logo Orange */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: `1px solid ${theme.colors.borderLight}`,
                      paddingTop: '16px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: theme.colors.textMuted, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                        Starting from
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 900, color: theme.colors.primaryNavy, lineHeight: 1.1 }}>
                        ₹{merchant.base_price || 299}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBookingModal(merchant)}
                      style={{
                        background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: theme.radii.full,
                        padding: '11px 24px',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: theme.shadows.orangeGlow,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <span>Book Now</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Worldwide Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={location}
        onSelectLocation={(loc) => setLocation(loc)}
      />

      {/* Two-step Appointment Booking Modal */}
      {selectedMerchantForBooking && (
        <BookingModal
          merchant={selectedMerchantForBooking}
          onClose={() => setSelectedMerchantForBooking(null)}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* Customer Bookings Modal */}
      {showBookingsModal && (
        <CustomerBookingsModal onClose={() => setShowBookingsModal(false)} />
      )}

      {/* Customer Profile & Settings Drawer */}
      <CustomerProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        onOpenBookings={() => setShowBookingsModal(true)}
        onLogout={() => {
          apiService.logout();
          onNavigate('login');
        }}
      />
    </div>
  );
}
