import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bell,
  Search,
  SlidersHorizontal,
  Star,
  Store,
  LogOut,
  CheckCircle2,
  ChevronDown,
  Navigation,
  Compass,
  Calendar,
  User,
  Heart,
  Clock,
  Sparkles,
  ShieldCheck,
  Filter
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
  'All',
  'Salon',
  'Spa & Massage',
  'Dental Clinic',
  'Car Detailing',
  'Fitness & Yoga',
];

export default function CustomerHome({ onNavigate }) {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
      setBookingSuccess(`Booking confirmed with ${merchant.shop_name}! View details in "My Bookings".`);
      setTimeout(() => setBookingSuccess(''), 5000);
    } catch (err) {
      alert(`Booking request: ${err.message}`);
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
        selectedCategory === 'All' ||
        m.service_type?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${theme.colors.borderLight}`,
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
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
                gap: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedCategory('All')}
            >
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
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: theme.colors.primaryNavy, letterSpacing: '-0.5px' }}>
                Bokivo
              </span>
            </div>

            {/* Dynamic Location Picker */}
            <div
              onClick={() => setShowLocationModal(true)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 12px',
                borderRadius: theme.radii.lg,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#F8FAFC',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.colors.accentBlue)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.colors.borderLight)}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: location.isDetected ? '#DCFCE7' : 'rgba(56, 182, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={16} color={location.isDetected ? '#16A34A' : theme.colors.accentBlue} />
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: theme.colors.textMuted, fontWeight: 700, letterSpacing: '0.5px' }}>
                  {location.isDetected ? 'GPS Auto-Detected' : 'Selected Location'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: theme.colors.primaryNavy, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {location.name}
                  </span>
                  <ChevronDown size={14} color={theme.colors.textSecondary} />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Action Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* My Bookings Button */}
            <button
              onClick={() => setShowBookingsModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: theme.radii.lg,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.primaryNavy,
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = theme.colors.accentBlue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = theme.colors.borderLight;
              }}
            >
              <Calendar size={17} color={theme.colors.accentBlue} />
              <span>My Bookings</span>
            </button>

            {/* Customer Profile & Settings Drawer */}
            <button
              onClick={() => setShowProfileDrawer(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: theme.radii.lg,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.colors.accentBlue)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = theme.colors.borderLight)}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.accentBlue,
                  color: theme.colors.primaryNavy,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                {(user.name || 'C').charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.colors.primaryNavy }}>
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
                borderRadius: theme.radii.lg,
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

      {/* Main Content Area */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Booking Notification Toast */}
        {bookingSuccess && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: `1px solid ${theme.colors.successGreen}`,
              color: '#065F46',
              padding: '14px 20px',
              borderRadius: theme.radii.lg,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color={theme.colors.successGreen} />
              <span>{bookingSuccess}</span>
            </div>
            <button
              onClick={() => setShowBookingsModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontWeight: 800,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.88rem',
              }}
            >
              View in My Bookings →
            </button>
          </div>
        )}

        {/* Global Search & Location Banner */}
        <div
          style={{
            position: 'relative',
            marginBottom: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            borderRadius: theme.radii.lg,
            backgroundColor: '#FFFFFF',
          }}
        >
          <Search
            size={20}
            color={theme.colors.textMuted}
            style={{ position: 'absolute', left: '16px', top: '16px' }}
          />
          <input
            type="text"
            placeholder="Search services, salons, spas, dentists, car care..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 140px 16px 48px',
              borderRadius: theme.radii.lg,
              border: `1px solid ${theme.colors.borderLight}`,
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => setShowLocationModal(true)}
            style={{
              position: 'absolute',
              right: '8px',
              top: '8px',
              backgroundColor: theme.colors.primaryNavy,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.radii.md,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Compass size={16} /> Change City
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
            marginBottom: '24px',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: theme.radii.full,
                  border: isSelected ? 'none' : `1px solid ${theme.colors.borderLight}`,
                  backgroundColor: isSelected ? theme.colors.primaryNavy : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? theme.shadows.primaryNavy : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Discovery Hero Card */}
        <div
          style={{
            minHeight: '180px',
            borderRadius: theme.radii.xl,
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${theme.colors.borderLight}`,
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 182, 255, 0.2)',
              border: '2px solid #38B6FF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
            }}
          >
            <MapPin size={24} color={theme.colors.accentBlue} />
          </div>

          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            Verified Services in {location.shortName || location.name}
          </h3>
          <p style={{ margin: '6px 0 14px 0', color: theme.colors.textMuted, fontSize: '0.85rem', maxWidth: '520px' }}>
            Coordinates: {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E • Real-time distance and instant appointments
          </p>

          <button
            onClick={() => setShowLocationModal(true)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              borderRadius: theme.radii.full,
              padding: '7px 18px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Navigation size={13} /> Change City or Auto-Detect GPS
          </button>
        </div>

        {/* Services Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.colors.primaryNavy, margin: 0 }}>
                {selectedCategory === 'All' ? 'Nearby Verified Services' : `${selectedCategory}s`}
              </h2>
              <span style={{ fontSize: '0.85rem', color: theme.colors.textSecondary }}>
                Sorted by closest distance to {location.shortName || location.name}
              </span>
            </div>
            <span style={{ fontSize: '0.88rem', color: theme.colors.textSecondary, fontWeight: 700 }}>
              {filtered.length} available
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textSecondary }}>
              Loading services...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textSecondary }}>
              No services found matching your criteria in {location.name}.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filtered.map((merchant) => (
                <div
                  key={merchant.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: theme.radii.xl,
                    padding: '20px',
                    border: `1px solid ${theme.colors.borderLight}`,
                    boxShadow: theme.shadows.card,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: theme.radii.lg,
                        backgroundColor: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Store size={26} color={theme.colors.primaryNavy} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: theme.colors.primaryNavy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {merchant.shop_name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <Star size={14} fill="#F59E0B" color="#F59E0B" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.colors.textPrimary }}>
                            {merchant.rating || '4.8'}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: theme.colors.textSecondary, marginTop: '2px', fontWeight: 600 }}>
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
                        <div style={{ fontSize: '0.75rem', color: theme.colors.accentBlue, fontWeight: 700, marginTop: '4px' }}>
                          📍 {merchant.distanceKm} km away
                        </div>
                      )}
                    </div>
                  </div>

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
                      <div style={{ fontSize: '0.72rem', color: theme.colors.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>Starting from</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                        ₹{merchant.base_price || 299}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBookingModal(merchant)}
                      style={{
                        backgroundColor: theme.colors.primaryNavy,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: theme.radii.md,
                        padding: '10px 22px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)',
                      }}
                    >
                      Book Now
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

      {/* Book Appointment Modal */}
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
