import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Check, Navigation, AlertCircle, Building2, Sparkles } from 'lucide-react';
import { theme } from '../theme/appTheme';

/**
 * Common business & address stop words for NLP query relaxation
 */
const NLP_STOP_WORDS = new Set([
  'thread', 'threads', 'house', 'pvt', 'ltd', 'limited', 'center', 'centre',
  'shop', 'store', 'saloon', 'salon', 'clinic', 'hospital', 'spa', 'studio',
  'enterprise', 'enterprises', 'agency', 'traders', 'near', 'opp', 'opposite',
  'beside', 'behind', 'road', 'street', 'point', 'complex', 'building', 'plaza'
]);

/**
 * Natural Language Processing helper to generate smart search variations:
 * 1. Exact query: "indeevaram thread"
 * 2. Cleaned query without business stop words: "indeevaram"
 * 3. Individual prominent keywords
 */
function generateNLPQueries(rawQuery) {
  const clean = rawQuery.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  const tokens = clean.split(/\s+/).filter(Boolean);
  const meaningfulTokens = tokens.filter((t) => !NLP_STOP_WORDS.has(t));

  const queries = [rawQuery.trim()];

  if (meaningfulTokens.length > 0) {
    const relaxed = meaningfulTokens.join(' ');
    if (relaxed.toLowerCase() !== rawQuery.trim().toLowerCase()) {
      queries.push(relaxed);
    }
  }

  // Also include any standalone distinctive token of length >= 4
  for (const token of meaningfulTokens) {
    if (token.length >= 4 && !queries.includes(token)) {
      queries.push(token);
    }
  }

  return queries;
}

/**
 * LocationAutocomplete
 * Live verified location search powered by OpenStreetMap Nominatim and Photon Geocoder with interactive map preview.
 * Supports searching both geographic places (cities, streets, areas) and registered business/POI names (e.g., "Kalyan Silks Kannur", "LuLu Mall Kochi").
 * Strictly requires selecting a verified location so coordinates (lat, lng) are always exact.
 */
export default function LocationAutocomplete({
  value = '',
  onChange,
  onLocationSelect,
  placeholder = 'Type business name, street, or city (e.g. Kalyan Silks Kannur)...',
  required = false,
  showMapPreview = true,
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isVerified, setIsVerified] = useState(Boolean(value));
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search via OpenStreetMap Nominatim
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    // If user is editing text after having selected a place, reset verification
    if (selectedPlace && query !== selectedPlace.name) {
      setIsVerified(false);
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const candidateQueries = generateNLPQueries(query);
        const seenNames = new Set();
        const seenCoords = new Set();
        const uniqueResults = [];

        // Waterfall search across NLP variations until we collect high-confidence candidates
        for (const qTerm of candidateQueries) {
          const [nomRes, photRes] = await Promise.allSettled([
            fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                qTerm
              )}&limit=8&addressdetails=1`
            ).then((r) => (r.ok ? r.json() : [])),
            fetch(
              `https://photon.komoot.io/api/?q=${encodeURIComponent(qTerm)}&limit=8`
            ).then((r) => (r.ok ? r.json() : null)),
          ]);

          const nomData = nomRes.status === 'fulfilled' && Array.isArray(nomRes.value) ? nomRes.value : [];
          const photData =
            photRes.status === 'fulfilled' && photRes.value?.features ? photRes.value.features : [];

          // 1. Process Nominatim results
          for (const item of nomData) {
            const cleanDisplayName = (item.display_name || '').trim();
            const lowerName = cleanDisplayName.toLowerCase();
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const coordKey = `${Math.round(lat * 200)}_${Math.round(lng * 200)}`;

            if (!seenNames.has(lowerName) && !seenCoords.has(coordKey)) {
              seenNames.add(lowerName);
              seenCoords.add(coordKey);

              const isBusiness =
                item.class === 'shop' ||
                item.class === 'amenity' ||
                item.class === 'tourism' ||
                item.class === 'leisure' ||
                item.class === 'craft';

              const placeType = isBusiness
                ? 'Business / Store'
                : item.type === 'administrative'
                ? 'District / Region'
                : item.type
                ? item.type.charAt(0).toUpperCase() + item.type.slice(1)
                : 'Location';

              uniqueResults.push({
                name: cleanDisplayName,
                shortName: item.name || cleanDisplayName.split(',')[0],
                typeLabel: placeType,
                isBusiness,
                matchedKeyword: qTerm !== query.trim() ? qTerm : null,
                city:
                  item.address?.city ||
                  item.address?.town ||
                  item.address?.state_district ||
                  item.address?.state ||
                  cleanDisplayName.split(',')[0],
                state: item.address?.state || '',
                country: item.address?.country || '',
                lat,
                lng,
              });
            }
          }

          // 2. Process Photon POI results
          for (const feat of photData) {
            const p = feat.properties;
            const parts = [p.name, p.street, p.city || p.district, p.state, p.country].filter(Boolean);
            const fullName = parts.join(', ');
            const lowerName = fullName.toLowerCase();
            const lat = feat.geometry?.coordinates?.[1];
            const lng = feat.geometry?.coordinates?.[0];
            const coordKey = `${Math.round(lat * 200)}_${Math.round(lng * 200)}`;

            if (fullName && !seenNames.has(lowerName) && !seenCoords.has(coordKey)) {
              seenNames.add(lowerName);
              seenCoords.add(coordKey);

              const isBusiness =
                p.osm_key === 'shop' ||
                p.osm_key === 'amenity' ||
                p.osm_key === 'tourism' ||
                p.osm_key === 'leisure' ||
                p.osm_key === 'craft';

              const placeType = isBusiness
                ? 'Business / Store'
                : p.osm_value
                ? p.osm_value.charAt(0).toUpperCase() + p.osm_value.slice(1)
                : 'Place';

              uniqueResults.push({
                name: fullName,
                shortName: p.name || parts[0],
                typeLabel: placeType,
                isBusiness,
                matchedKeyword: qTerm !== query.trim() ? qTerm : null,
                city: p.city || p.district || p.state || parts[0],
                state: p.state || '',
                country: p.country || '',
                lat: parseFloat(lat),
                lng: parseFloat(lng),
              });
            }
          }

          // If we found solid results on this NLP query stage, stop to avoid clutter
          if (uniqueResults.length >= 3) {
            break;
          }
        }

        setResults(uniqueResults.slice(0, 8));
        setIsOpen(true);
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.name);
    setSelectedPlace(place);
    setIsVerified(true);
    setIsOpen(false);

    if (onChange) {
      onChange(place.name);
    }
    if (onLocationSelect) {
      onLocationSelect(place);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <MapPin
          size={18}
          color={isVerified ? '#10B981' : theme.colors.textMuted}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            transition: 'color 0.2s',
          }}
        />

        <input
          type="text"
          required={required}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '11px 40px 11px 42px',
            borderRadius: theme.radii.md,
            border: isVerified ? '1.5px solid #10B981' : `1px solid ${theme.colors.borderLight}`,
            fontSize: '0.95rem',
            outline: 'none',
            backgroundColor: '#FFFFFF',
            transition: 'border-color 0.2s',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {loading && <Loader2 size={16} className="animate-spin" color={theme.colors.sunsetOrange} />}
          {isVerified && !loading && (
            <span
              title="Verified Map Location"
              style={{
                backgroundColor: '#DCFCE7',
                color: '#166534',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Check size={11} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Mandatory Selection Notice if typed without clicking dropdown */}
      {query.trim().length >= 3 && !isVerified && !loading && !isOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#D97706', marginTop: '4px' }}>
          <AlertCircle size={13} />
          <span>Please click one of the verified suggestions from the map list below.</span>
        </div>
      )}

      {/* Dropdown Results List */}
      {isOpen && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: theme.radii.lg,
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 30px -10px rgba(15, 30, 54, 0.18)',
            zIndex: 9999,
            overflow: 'hidden',
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '8px 14px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between' }}>
            <span>Select Business / Geographic Location</span>
            <span style={{ fontWeight: 500, textTransform: 'none', color: '#64748B' }}>OSM & Photon Verified</span>
          </div>

          {results.map((place, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(place)}
              style={{
                padding: '11px 14px',
                borderBottom: idx < results.length - 1 ? '1px solid #F1F5F9' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFF7ED')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: place.isBusiness ? '#EEF2FF' : '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {place.isBusiness ? (
                  <Building2 size={15} color="#4F46E5" />
                ) : (
                  <MapPin size={15} color={theme.colors.sunsetOrange} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                    {place.shortName}
                  </span>
                  {place.typeLabel && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: place.isBusiness ? '#4338CA' : '#475569',
                        backgroundColor: place.isBusiness ? '#EEF2FF' : '#F1F5F9',
                        border: place.isBusiness ? '1px solid #C7D2FE' : '1px solid transparent',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {place.typeLabel}
                    </span>
                  )}
                  {place.matchedKeyword && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#B45309',
                        backgroundColor: '#FEF3C7',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      <Sparkles size={9} /> NLP Match
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: theme.colors.textMuted,
                    marginTop: '3px',
                    lineHeight: '1.3',
                    wordBreak: 'break-word',
                  }}
                  title={place.name}
                >
                  {place.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded OpenStreetMap Preview when location is selected */}
      {showMapPreview && selectedPlace && isVerified && (
        <div
          style={{
            marginTop: '10px',
            borderRadius: theme.radii.md,
            overflow: 'hidden',
            border: '1px solid #CBD5E1',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            position: 'relative',
          }}
        >
          <iframe
            title="Location Map"
            width="100%"
            height="140"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedPlace.lng - 0.015}%2C${selectedPlace.lat - 0.01}%2C${selectedPlace.lng + 0.015}%2C${selectedPlace.lat + 0.01}&layer=mapnik&marker=${selectedPlace.lat}%2C${selectedPlace.lng}`}
            style={{ display: 'block', border: 'none' }}
          />
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              fontSize: '0.75rem',
              color: theme.colors.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 700, color: theme.colors.primaryNavy }}>
              📍 Coordinates: {selectedPlace.lat.toFixed(4)}, {selectedPlace.lng.toFixed(4)}
            </span>
            <span style={{ color: '#059669', fontWeight: 800 }}>✓ Locked for Customer Proximity</span>
          </div>
        </div>
      )}
    </div>
  );
}

