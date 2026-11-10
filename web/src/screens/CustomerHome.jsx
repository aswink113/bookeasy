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
import EditProfileModal from '../widgets/EditProfileModal';

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

// Category-specific cover image gradients & photos for luxury card visuals
const SERVICE_COVERS = {
  salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
  'spa & massage': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
  'dental clinic': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
  'car detailing': 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80',
  'fitness & yoga': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
};

function getServiceCover(serviceType) {
  const key = (serviceType || '').toLowerCase();
  for (const [k, url] of Object.entries(SERVICE_COVERS)) {
    if (key.includes(k)) return url;
  }
  return SERVICE_COVERS.default;
}

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
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
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
            marginBottom: '32px',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '26px' }}>
              {filtered.map((merchant) => {
                const coverImg = getServiceCover(merchant.service_type);

                return (
                  <div
                    key={merchant.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '20px',
                      border: `1px solid ${theme.colors.borderLight}`,
                      boxShadow: '0 4px 20px -2px rgba(15, 30, 54, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 20px 35px -5px rgba(15, 30, 54, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255, 122, 0, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px -2px rgba(15, 30, 54, 0.06)';
                      e.currentTarget.style.borderColor = theme.colors.borderLight;
                    }}
                  >
                    {/* Visual Cover Header */}
                    <div style={{ position: 'relative', height: '140px', width: '100%', overflow: 'hidden' }}>
                      <img
                        src={coverImg}
                        alt={merchant.shop_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.7) 100%)',
                        }}
                      />

                      {/* Distance & Category Badges over image */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                        <span
                          style={{
                            backgroundColor: 'rgba(15, 30, 54, 0.75)',
                            backdropFilter: 'blur(4px)',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sparkles size={11} color={theme.colors.sunsetOrange} /> {merchant.service_type || 'Service'}
                        </span>
                      </div>

                      {merchant.distanceKm !== null && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(4px)',
                            color: theme.colors.primaryNavy,
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          }}
                        >
                          📍 {merchant.distanceKm} km away
                        </div>
                      )}

                      {/* Rating chip pinned bottom right of image */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '12px',
                          backgroundColor: '#FFFFFF',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        <Star size={13} fill="#F59E0B" color="#F59E0B" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0F172A' }}>
                          {merchant.rating || '4.8'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <h4
                          style={{
                            margin: '0 0 6px',
                            fontSize: '1.2rem',
                            fontWeight: 900,
                            color: theme.colors.primaryNavy,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {merchant.shop_name}
                        </h4>

                        {merchant.address && (
                          <div
                            style={{
                              fontSize: '0.82rem',
                              color: theme.colors.textMuted,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px',
                              lineHeight: 1.4,
                              minHeight: '36px',
                            }}
                          >
                            <MapPin size={14} color={theme.colors.sunsetOrange} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {merchant.address}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pricing and Book Now CTA in Logo Orange */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: `1px solid ${theme.colors.borderLight}`,
                          paddingTop: '16px',
                          marginTop: '16px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.68rem', color: theme.colors.textMuted, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
                            Starting Price
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
                            padding: '11px 22px',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: theme.shadows.orangeGlow,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <span>Book Now</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
        onOpenEditProfile={() => setShowEditProfileModal(true)}
        onLogout={() => {
          apiService.logout();
          onNavigate('login');
        }}
      />

      {/* Edit Profile Modal (Name & Email Change with OTP) */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onProfileUpdated={(updatedUser) => {
          setBookingSuccess(`Profile updated! Welcome, ${updatedUser.name}`);
          setTimeout(() => setBookingSuccess(''), 4000);
        }}
      />
    </div>
  );
}
