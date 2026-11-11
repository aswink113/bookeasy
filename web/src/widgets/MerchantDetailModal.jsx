import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  UserCheck
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

/**
 * MerchantDetailModal
 * Shows:
 * 1. High-res photo gallery with thumbnail switcher
 * 2. Merchant overview (rating, address, distance, status)
 * 3. Sub-categories / detailed services list with custom photos, names, durations, and exact prices
 * 4. Verified Customer Reviews & Ratings sub-section (5-star ratings, timestamps, and customer comments)
 * 5. Direct Book Now trigger selecting any specific sub-service
 */
export default function MerchantDetailModal({ merchant, isOpen, onClose, onBookSubService }) {
  if (!isOpen || !merchant) return null;

  const gallery = (merchant.gallery_photos && merchant.gallery_photos.length > 0)
    ? merchant.gallery_photos
    : [merchant.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85'];

  const [activePhoto, setActivePhoto] = useState(gallery[0]);
  const [selectedSubService, setSelectedSubService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (merchant?.id) {
      loadReviews();
    }
  }, [merchant?.id]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await apiService.getMerchantReviews(merchant.id);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

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
                <span>{merchant.rating ? merchant.rating.toFixed(1) : '5.0'}</span>
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
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '14px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}
            >
              {gallery.map((photoUrl, idx) => {
                const isActive = activePhoto === photoUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(photoUrl)}
                    style={{
                      width: '72px',
                      height: '52px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: isActive ? `2.5px solid ${theme.colors.sunsetOrange}` : '2px solid transparent',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: isActive ? '0 4px 10px rgba(255, 122, 0, 0.3)' : 'none',
                      opacity: isActive ? 1 : 0.65,
                      transition: 'all 0.15s ease',
                      backgroundColor: '#F1F5F9',
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Location & Quick Meta Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '20px 0 24px',
              padding: '14px 18px',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color={theme.colors.sunsetOrange} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.colors.primaryNavy }}>
                {merchant.address || 'Location on file'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: theme.colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>
                Price Range:
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: theme.colors.sunsetOrange }}>
                {priceRangeLabel}
              </span>
            </div>
          </div>

          {/* Sub-Categories & Services Breakdown */}
          <div style={{ marginBottom: '28px' }}>
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
                            <span style={{ fontSize: '0.76rem', color: theme.colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
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

          {/* =========================================================================
              REVIEWS & RATINGS SUB-SECTION
          ========================================================================== */}
          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color={theme.colors.sunsetOrange} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                  Customer Reviews & Ratings
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FEF3C7', padding: '4px 10px', borderRadius: '12px' }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400E' }}>
                    {merchant.rating ? merchant.rating.toFixed(1) : '5.0'}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            {loadingReviews ? (
              <div style={{ textAlign: 'center', padding: '24px', color: theme.colors.textMuted, fontSize: '0.85rem' }}>
                Loading verified reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  border: '1px dashed #CBD5E1',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={18} fill="#E2E8F0" color="#CBD5E1" />
                  ))}
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  No customer reviews yet
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: theme.colors.textMuted }}>
                  Be the first to experience services at {merchant.shop_name} and leave a verified rating!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map((rev) => {
                  const revDate = rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }) : 'Recently';

                  return (
                    <div
                      key={rev.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '16px',
                        boxShadow: '0 1px 4px rgba(15, 30, 54, 0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #DBEAFE',
                            }}
                          >
                            {(rev.customer_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                                {rev.customer_name}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  backgroundColor: '#DCFCE7',
                                  color: '#166534',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Check size={10} /> Verified Booking
                              </span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: theme.colors.textMuted }}>
                              {revDate}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              fill={star <= Math.round(rev.rating) ? '#F59E0B' : '#E2E8F0'}
                              color={star <= Math.round(rev.rating) ? '#F59E0B' : '#CBD5E1'}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.comment && (
                        <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: theme.colors.primaryNavy, lineHeight: '1.45' }}>
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
