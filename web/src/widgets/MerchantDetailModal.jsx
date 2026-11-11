import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Camera, 
  DollarSign, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { theme } from '../theme/appTheme';

/**
 * MerchantDetailModal
 * Shows:
 * 1. High-res photo gallery with thumbnail switcher
 * 2. Merchant overview (rating, address, distance, status)
 * 3. Sub-categories / detailed services list with custom photos, names, durations, and exact prices
 * 4. Direct Book Now trigger selecting any specific sub-service
 */
export default function MerchantDetailModal({ merchant, isOpen, onClose, onBookSubService }) {
  if (!isOpen || !merchant) return null;

  const gallery = (merchant.gallery_photos && merchant.gallery_photos.length > 0)
    ? merchant.gallery_photos
    : [merchant.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85'];

  const [activePhoto, setActivePhoto] = useState(gallery[0]);
  const [selectedSubService, setSelectedSubService] = useState(null);

  const subServices = Array.isArray(merchant.sub_services) && merchant.sub_services.length > 0
    ? merchant.sub_services
    : [
        {
          id: 'gen-1',
          name: `${merchant.service_type || 'General'} Complete Session`,
          price: merchant.base_price || 350,
          duration: '45 mins',
          photo: merchant.image_url || gallery[0],
          description: `Full professional ${merchant.service_type} experience delivered by verified experts.`,
        }
      ];

  // Calculate lowest and highest prices from sub-services
  const allPrices = subServices.map((s) => Number(s.price)).filter((p) => !isNaN(p) && p > 0);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : Number(merchant.base_price) || 299;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : Number(merchant.base_price) || 299;
  const priceRangeLabel = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

  const handleBookNow = (service) => {
    if (onBookSubService) {
      onBookSubService(merchant, service || selectedSubService || subServices[0]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9998,
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
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(15, 30, 54, 0.25)',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: theme.colors.sunsetOrangeLight,
                  color: theme.colors.sunsetOrange,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                }}
              >
                {merchant.service_type || 'Verified Partner'}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={14} /> Bokivo Verified
              </span>
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
              {merchant.shop_name}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
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
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
          {/* Main Photo Gallery Hero (16:9) */}
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: '18px',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#0F172A',
              boxShadow: '0 8px 24px rgba(15, 30, 54, 0.12)',
            }}
          >
            <img
              src={activePhoto}
              alt={merchant.shop_name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'all 0.3s ease',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 60%, rgba(15, 23, 42, 0.7) 100%)',
              }}
            />

            {/* Rating & Distance Badges over active photo */}
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '10px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  color: theme.colors.primaryNavy,
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Star size={15} fill="#F59E0B" color="#F59E0B" />
                <span>{merchant.rating ? merchant.rating.toFixed(1) : '4.8'}</span>
              </div>

              {merchant.distanceKm !== undefined && (
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <MapPin size={13} color={theme.colors.sunsetOrange} />
                  <span>{merchant.distanceKm} km away</span>
                </div>
              )}
            </div>

            <div
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Camera size={13} /> {gallery.length} Photos
            </div>
          </div>

          {/* Gallery Thumbnails Slider */}
          {gallery.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
              {gallery.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(photo)}
                  style={{
                    width: '84px',
                    height: '54px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: activePhoto === photo ? `2.5px solid ${theme.colors.sunsetOrange}` : '1.5px solid #E2E8F0',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                    opacity: activePhoto === photo ? 1 : 0.65,
                    transform: activePhoto === photo ? 'scale(1.03)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <img src={photo} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Address & Price Range Meta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '18px 0 24px',
              padding: '12px 18px',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: theme.colors.textSecondary }}>
              <MapPin size={16} color={theme.colors.sunsetOrange} style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{merchant.address}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase' }}>
                Price Range:
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: theme.colors.sunsetOrange }}>
                {priceRangeLabel}
              </span>
            </div>
          </div>

          {/* Sub-Categories & Services Breakdown */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color={theme.colors.sunsetOrange} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                  Available Sub-Services & Pricing
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>
                {subServices.length} options available
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {subServices.map((sub) => {
                const isSelected = selectedSubService?.id === sub.id;

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubService(sub)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px',
                      borderRadius: '16px',
                      border: isSelected ? `2px solid ${theme.colors.sunsetOrange}` : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                      boxShadow: isSelected ? '0 4px 16px rgba(255, 122, 0, 0.15)' : '0 2px 8px rgba(15, 30, 54, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      {/* Sub-Service Photo */}
                      <div
                        style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          backgroundColor: '#F1F5F9',
                          flexShrink: 0,
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <img
                          src={sub.photo || gallery[0]}
                          alt={sub.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Details */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                            {sub.name}
                          </h4>
                        </div>
                        {sub.description && (
                          <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: theme.colors.textMuted, lineHeight: '1.3' }}>
                            {sub.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                          {sub.duration && (
                            <span style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                              <Clock size={12} /> {sub.duration}
                            </span>
                          )}
                          <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                            Instant Slot Confirmation
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Book Trigger */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: theme.colors.sunsetOrange }}>
                        ₹{sub.price}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(sub);
                        }}
                        style={{
                          padding: '7px 16px',
                          borderRadius: theme.radii.full,
                          border: 'none',
                          background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                          color: '#FFFFFF',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(255, 122, 0, 0.3)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                      >
                        <span>Book</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Action */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #F1F5F9',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>
              Selected Sub-Service
            </span>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
              {selectedSubService ? `${selectedSubService.name} (₹${selectedSubService.price})` : `Base Service (₹${merchant.base_price || 350})`}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleBookNow(selectedSubService)}
            style={{
              padding: '12px 28px',
              borderRadius: theme.radii.md,
              border: 'none',
              background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
            }}
          >
            <Calendar size={18} />
            <span>Select Date & Time</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

