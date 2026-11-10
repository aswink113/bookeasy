import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, X, Check, Globe } from 'lucide-react';
import { theme } from '../theme/appTheme';

const POPULAR_CITIES = [
  { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai, India', lat: 18.9067, lng: 72.8147 },
  { name: 'Delhi NCR, India', lat: 28.6315, lng: 77.2167 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
];

export default function LocationModal({ isOpen, onClose, currentLocation, onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live worldwide search using OpenStreetMap Nominatim
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setErrorMsg('');
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query.trim()
          )}&limit=6&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(
            data.map((item) => ({
              name: item.display_name,
              shortName: item.name || item.display_name.split(',')[0],
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }))
          );
        }
      } catch (e) {
        setErrorMsg('Failed to fetch worldwide locations.');
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // BookMyShow-style "Detect My Current Location" via Browser Geolocation API
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get city name
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const cityName =
              address.city ||
              address.town ||
              address.village ||
              address.suburb ||
              data.name ||
              'Current Location';
            const country = address.country ? `, ${address.country}` : '';
            
            onSelectLocation({
              name: `${cityName}${country}`,
              shortName: cityName,
              lat: latitude,
              lng: longitude,
              isDetected: true,
            });
            onClose();
          } else {
            onSelectLocation({
              name: 'My Current Location',
              shortName: 'My Location',
              lat: latitude,
              lng: longitude,
              isDetected: true,
            });
            onClose();
          }
        } catch {
          onSelectLocation({
            name: 'My Current Location',
            shortName: 'My Location',
            lat: latitude,
            lng: longitude,
            isDetected: true,
          });
          onClose();
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        setErrorMsg(
          err.code === 1
            ? 'Location permission denied. Please allow location access or choose a city.'
            : 'Unable to retrieve location.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: theme.radii.xl,
          maxWidth: '580px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: theme.shadows.modal,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${theme.colors.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
              Select Location
            </h3>
            <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>
              Search any city worldwide or auto-detect
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: theme.colors.textSecondary,
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar Input */}
        <div style={{ padding: '20px 24px 12px 24px' }}>
          <div
            style={{
              position: 'relative',
              backgroundColor: '#F8FAFC',
              borderRadius: theme.radii.lg,
              border: `1px solid ${theme.colors.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              padding: '4px 12px',
            }}
          >
            <Search size={18} color={theme.colors.textMuted} style={{ marginLeft: '4px' }} />
            <input
              type="text"
              placeholder="Search for city, region, or address worldwide..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '12px',
                fontSize: '0.95rem',
                backgroundColor: 'transparent',
                color: theme.colors.textPrimary,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* BookMyShow-style "Detect My Location" Button */}
        <div style={{ padding: '0 24px 16px 24px' }}>
          <button
            onClick={handleDetectCurrentLocation}
            disabled={detecting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              backgroundColor: 'rgba(56, 182, 255, 0.08)',
              border: `1.5px dashed ${theme.colors.accentBlue}`,
              borderRadius: theme.radii.lg,
              color: theme.colors.primaryNavy,
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: detecting ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: theme.colors.accentBlue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Navigation size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div>{detecting ? 'Detecting your GPS location...' : 'Auto-detect My Location'}</div>
              <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, fontWeight: 500 }}>
                Using device GPS / Browser Geolocation
              </div>
            </div>
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '0 24px 16px 24px', padding: '10px 14px', backgroundColor: '#FEE2E2', color: theme.colors.errorRed, fontSize: '0.85rem', borderRadius: theme.radii.md }}>
            {errorMsg}
          </div>
        )}

        {/* Search Results List or Popular Cities */}
        <div style={{ padding: '0 24px 24px 24px', overflowY: 'auto', flex: 1 }}>
          {query.trim().length >= 2 ? (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: theme.colors.textMuted, marginBottom: '10px' }}>
                {searching ? 'Searching Worldwide...' : `Matching Places (${results.length})`}
              </div>
              {results.length === 0 && !searching ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: theme.colors.textSecondary }}>
                  No locations found matching "{query}".
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {results.map((place, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectLocation(place);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: theme.radii.md,
                        border: `1px solid ${theme.colors.borderLight}`,
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    >
                      <MapPin size={18} color={theme.colors.accentBlue} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: theme.colors.primaryNavy }}>
                          {place.shortName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: theme.colors.textSecondary, marginTop: '2px' }}>
                          {place.name}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: theme.colors.textMuted, marginBottom: '12px' }}>
                Popular Cities
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {POPULAR_CITIES.map((city, idx) => {
                  const isSelected = currentLocation?.name?.toLowerCase().includes(city.name.split(',')[0].toLowerCase());
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectLocation(city);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: theme.radii.md,
                        border: `1px solid ${isSelected ? theme.colors.accentBlue : theme.colors.borderLight}`,
                        backgroundColor: isSelected ? 'rgba(56, 182, 255, 0.08)' : '#FFFFFF',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: isSelected ? theme.colors.primaryNavy : theme.colors.textPrimary,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{city.name}</span>
                      {isSelected && <Check size={16} color={theme.colors.accentBlue} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

