import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Bell, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  XCircle, 
  User, 
  Zap, 
  ShieldCheck, 
  Camera, 
  Crop,
  Layers,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Star,
  MapPin,
  Phone,
  Info,
  Sliders,
  CheckCircle2,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';
import EditProfileModal from '../widgets/EditProfileModal';
import MerchantSubscriptionModal from '../widgets/MerchantSubscriptionModal';
import ImageCropModal from '../widgets/ImageCropModal';
import LocationAutocomplete from '../widgets/LocationAutocomplete';

export default function MerchantDashboard({ onNavigate }) {
  // Navigation tabs: 'bookings' | 'services' | 'storefront' | 'reviews' | 'earnings'
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Dashboard & Profile states
  const [requests, setRequests] = useState([]);
  const [subscription, setSubscription] = useState({ is_subscribed: false, subscription_end: null });
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempCoverSrc, setTempCoverSrc] = useState(null);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const photoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Sub-services modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: 350,
    duration: '30 mins',
    photo: '',
    description: '',
  });

  // Storefront settings form state
  const [storeForm, setStoreForm] = useState({
    shop_name: '',
    service_type: '',
    address: '',
    phone: '',
    about: '',
    base_price: 299,
    opening_time: '09:00',
    closing_time: '20:00',
    is_open_now: true,
  });
  const [savingStore, setSavingStore] = useState(false);

  // New gallery photo URL input
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const user = apiService.getUser();

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsData, subData, profileData] = await Promise.all([
        apiService.getMerchantBookings().catch(() => []),
        apiService.getSubscriptionStatus().catch(() => ({ is_subscribed: false })),
        apiService.getMyMerchantProfile().catch(() => null),
      ]);
      setRequests(bookingsData);
      setSubscription(subData);
      if (profileData) {
        setProfile(profileData);
        setStoreForm({
          shop_name: profileData.shop_name || '',
          service_type: profileData.service_type || '',
          address: profileData.address || '',
          phone: profileData.phone || '',
          about: profileData.about || '',
          base_price: profileData.base_price || 299,
          opening_time: profileData.opening_time || '09:00',
          closing_time: profileData.closing_time || '20:00',
          is_open_now: profileData.is_open_now ?? true,
        });

        // Load reviews for this merchant
        if (profileData.id) {
          apiService.getMerchantReviews(profileData.id)
            .then((res) => setReviews(Array.isArray(res) ? res : []))
            .catch(() => setReviews([]));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // --- Booking Actions ---
  const handleAction = async (bookingId, newStatus) => {
    if (newStatus === 'declined' || newStatus === 'cancelled') {
      const confirmed = window.confirm(
        'Are you sure you want to cancel / decline this appointment? The customer will receive an immediate cancellation notification email.'
      );
      if (!confirmed) return;
    }

    setActionLoading(bookingId);
    try {
      await apiService.updateBookingStatus(bookingId, newStatus);
      showToast(
        newStatus === 'accepted'
          ? 'Booking accepted successfully!'
          : newStatus === 'completed'
          ? 'Appointment marked as completed!'
          : 'Appointment cancelled/declined. Notification sent to customer.'
      );
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  // --- Storefront Settings Save ---
  const handleSaveStorefront = async (e) => {
    e.preventDefault();
    setSavingStore(true);
    try {
      await apiService.updateMerchantProfile({
        ...storeForm,
        base_price: Number(storeForm.base_price),
      });
      showToast('Storefront profile & operating hours updated successfully!');
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update storefront');
    } finally {
      setSavingStore(false);
    }
  };

  // --- Sub-Services Menu Management ---
  const handleOpenAddService = () => {
    setEditingServiceIndex(null);
    setServiceForm({
      name: '',
      price: 350,
      duration: '30 mins',
      photo: profile?.image_url || '',
      description: '',
    });
    setShowServiceModal(true);
  };

  const handleOpenEditService = (index) => {
    const s = profile.sub_services[index];
    setEditingServiceIndex(index);
    setServiceForm({
      name: s.name || '',
      price: s.price || 350,
      duration: s.duration || '30 mins',
      photo: s.photo || '',
      description: s.description || '',
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) return;

    const currentServices = Array.isArray(profile?.sub_services) ? [...profile.sub_services] : [];
    const itemToSave = {
      id: editingServiceIndex !== null ? currentServices[editingServiceIndex].id : undefined,
      name: serviceForm.name.trim(),
      price: Number(serviceForm.price),
      duration: serviceForm.duration.trim() || '30 mins',
      photo: serviceForm.photo.trim() || profile?.image_url || '',
      description: serviceForm.description.trim(),
    };

    if (editingServiceIndex !== null) {
      currentServices[editingServiceIndex] = itemToSave;
    } else {
      currentServices.push(itemToSave);
    }

    try {
      await apiService.updateMerchantSubServices(currentServices);
      showToast(editingServiceIndex !== null ? 'Service item updated!' : 'New sub-service added to your menu!');
      setShowServiceModal(false);
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to save sub-service');
    }
  };

  const handleDeleteService = async (index) => {
    if (!window.confirm('Delete this service from your public menu?')) return;
    const currentServices = [...profile.sub_services];
    currentServices.splice(index, 1);

    try {
      await apiService.updateMerchantSubServices(currentServices);
      showToast('Service removed from menu.');
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete service');
    }
  };

  // --- Gallery Photos Management ---
  const handleAddGalleryPhoto = async () => {
    if (!newGalleryUrl.trim()) return;
    const currentGallery = Array.isArray(profile?.gallery_photos) ? [...profile.gallery_photos] : [];
    currentGallery.push(newGalleryUrl.trim());

    try {
      await apiService.updateMerchantGallery(currentGallery);
      setNewGalleryUrl('');
      showToast('Photo added to shop gallery!');
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update gallery');
    }
  };

  const handleDeleteGalleryPhoto = async (index) => {
    if (!window.confirm('Remove this photo from your venue gallery?')) return;
    const currentGallery = [...profile.gallery_photos];
    currentGallery.splice(index, 1);

    try {
      await apiService.updateMerchantGallery(currentGallery);
      showToast('Gallery photo deleted.');
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update gallery');
    }
  };

  // KPIs
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted' || r.status === 'confirmed').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;
  const totalRevenue = requests
    .filter((r) => r.status === 'accepted' || r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + (Number(r.base_price) || 0), 0);

  // Calculate Profile Completion Percentage
  const calculateProfileCompletion = () => {
    let score = 0;
    const checklist = [
      { key: 'basic', label: 'Store Name & Category', done: Boolean(profile?.shop_name && profile?.service_type), points: 20 },
      { key: 'address', label: 'Store Address & Location', done: Boolean(profile?.address), points: 15 },
      { key: 'hours', label: 'Operating Hours & Phone', done: Boolean(profile?.opening_time && profile?.closing_time && profile?.phone), points: 15 },
      { key: 'cover', label: '16:9 Shop Cover Photo', done: Boolean(profile?.image_url), points: 15 },
      { key: 'services', label: 'At least 1 Sub-Service with Pricing', done: Boolean(profile?.sub_services && profile?.sub_services.length >= 1), points: 15 },
      { key: 'gallery', label: 'Minimum 3 Gallery Photos', done: Boolean(profile?.gallery_photos && profile?.gallery_photos.length >= 3), points: 20 },
    ];

    checklist.forEach((item) => {
      if (item.done) score += item.points;
    });

    return { percentage: Math.min(score, 100), checklist };
  };

  const { percentage: profilePercentage, checklist: profileChecklist } = calculateProfileCompletion();

  const formatBookingDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: theme.colors.primaryNavy }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${theme.colors.borderLight}`,
          padding: '14px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo.png"
              alt="Bokivo Logo"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
                  {profile?.shop_name || 'Merchant Studio'}
                </h2>
                <span
                  style={{
                    backgroundColor: profile?.is_open_now ? '#DCFCE7' : '#FEE2E2',
                    color: profile?.is_open_now ? '#166534' : '#991B1B',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {profile?.is_open_now ? '● Accepting Bookings' : '○ Closed / Paused'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
                {profile?.service_type || 'Verified Partner'} • Bokivo Partner Hub
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Cover Photo Upload */}
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setTempCoverSrc(reader.result);
                    setShowCropModal(true);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={updatingPhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.primaryNavy,
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: updatingPhoto ? 'not-allowed' : 'pointer',
              }}
            >
              <Camera size={14} color={theme.colors.sunsetOrange} />
              <span>{updatingPhoto ? 'Saving...' : 'Cover (16:9)'}</span>
            </button>

            {/* Subscription Pill */}
            {subscription.is_subscribed ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  padding: '6px 12px',
                  borderRadius: theme.radii.full,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  border: '1px solid #BBF7D0',
                }}
              >
                <ShieldCheck size={14} color="#166534" />
                <span>Partner Pro Active</span>
              </div>
            ) : (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: theme.radii.md,
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.3)',
                }}
              >
                <Zap size={14} />
                <span>Upgrade to Pro</span>
              </button>
            )}

            {/* Profile Button */}
            <button
              onClick={() => setShowEditProfile(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.primaryNavy,
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <User size={14} color={theme.colors.sunsetOrange} />
              <span>Profile</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                apiService.logout();
                onNavigate('login');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.errorRed,
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Feedback Alert Toast */}
        {successMsg && (
          <div
            style={{
              backgroundColor: '#DCFCE7',
              color: '#166534',
              padding: '12px 18px',
              borderRadius: theme.radii.lg,
              marginBottom: '20px',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: '1px solid #BBF7D0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '12px 18px',
              borderRadius: theme.radii.lg,
              marginBottom: '20px',
              fontWeight: 600,
              fontSize: '0.88rem',
              border: '1px solid #FECACA',
            }}
          >
            {error}
          </div>
        )}

        {/* Profile Completion Circle & Checklist Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: theme.radii.xl,
            border: `1px solid ${theme.colors.borderLight}`,
            padding: '20px 24px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* SVG Circular Progress Meter */}
            <div style={{ position: 'relative', width: '74px', height: '74px', flexShrink: 0 }}>
              <svg width="74" height="74" viewBox="0 0 74 74" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track */}
                <circle
                  cx="37"
                  cy="37"
                  r="30"
                  stroke="#F1F5F9"
                  strokeWidth="7"
                  fill="transparent"
                />
                {/* Active Progress */}
                <circle
                  cx="37"
                  cy="37"
                  r="30"
                  stroke={profilePercentage === 100 ? '#10B981' : '#FF7A00'}
                  strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={(2 * Math.PI * 30) * (1 - profilePercentage / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  color: profilePercentage === 100 ? '#059669' : '#C2410C',
                }}
              >
                {profilePercentage}%
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  {profilePercentage === 100 ? 'Store Profile 100% Completed! 🎉' : 'Complete Your Storefront Profile'}
                </h3>
                <span
                  style={{
                    backgroundColor: profilePercentage === 100 ? '#DCFCE7' : '#FEF3C7',
                    color: profilePercentage === 100 ? '#166534' : '#92400E',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}
                >
                  {profilePercentage === 100 ? 'Ready for Customers' : 'Action Required'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: theme.colors.textMuted }}>
                Add your sub-service pricing and at least 3 high-quality store photos to maximize client bookings.
              </p>
            </div>
          </div>

          {/* Quick Checklist Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '580px' }}>
            {profileChecklist.map((item) => (
              <div
                key={item.key}
                onClick={() => {
                  if (item.key === 'services') setActiveTab('services');
                  else if (item.key === 'gallery') setActiveTab('gallery');
                  else if (item.key === 'cover') photoInputRef.current?.click();
                  else setActiveTab('storefront');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: item.done ? '#F0FDF4' : '#FFF7ED',
                  color: item.done ? '#166534' : '#C2410C',
                  border: `1px solid ${item.done ? '#BBF7D0' : '#FFEDD5'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={item.done ? 'Completed' : 'Click to complete'}
              >
                {item.done ? <Check size={12} color="#166534" /> : <Clock size={12} color="#C2410C" />}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Quick Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, padding: '20px', border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Pending Appointments</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.colors.sunsetOrange, marginTop: '6px' }}>
              {pendingCount}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, padding: '20px', border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Confirmed Bookings</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.colors.successGreen, marginTop: '6px' }}>
              {acceptedCount}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, padding: '20px', border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Gross Booking Revenue</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: theme.colors.primaryNavy, marginTop: '6px' }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, padding: '20px', border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Partner Rating</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D97706', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ★ {profile?.rating ? profile.rating.toFixed(1) : '5.0'}
              <span style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 600 }}>({reviews.length} reviews)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: `1px solid ${theme.colors.borderLight}`,
            marginBottom: '24px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {[
            { id: 'bookings', label: 'Bookings Queue', icon: Calendar, badge: pendingCount > 0 ? pendingCount : null },
            { id: 'services', label: 'Services Menu & Pricing', icon: Layers, badge: profile?.sub_services?.length || 0 },
            { id: 'storefront', label: 'Storefront & Hours', icon: Store },
            { id: 'gallery', label: 'Photo Gallery', icon: ImageIcon, badge: profile?.gallery_photos?.length || 0 },
            { id: 'reviews', label: 'Customer Reviews', icon: Star, badge: reviews.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px 12px 0 0',
                  border: 'none',
                  borderBottom: active ? `3px solid ${theme.colors.sunsetOrange}` : '3px solid transparent',
                  backgroundColor: active ? '#FFFFFF' : 'transparent',
                  color: active ? theme.colors.sunsetOrange : theme.colors.textSecondary,
                  fontWeight: active ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} color={active ? theme.colors.sunsetOrange : theme.colors.textSecondary} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span
                    style={{
                      backgroundColor: active ? theme.colors.sunsetOrange : '#E2E8F0',
                      color: active ? '#FFFFFF' : theme.colors.primaryNavy,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '999px',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            TAB 1: BOOKING REQUESTS QUEUE
        ========================================================================== */}
        {activeTab === 'bookings' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              padding: '24px',
              border: `1px solid ${theme.colors.borderLight}`,
              boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  Appointment Requests
                </h3>
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>Manage incoming client bookings and confirm time slots</span>
              </div>
              <button
                onClick={loadDashboardData}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: theme.radii.md,
                  border: `1px solid ${theme.colors.borderLight}`,
                  backgroundColor: '#F8FAFC',
                  color: theme.colors.primaryNavy,
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textMuted }}>
                Loading appointment queue...
              </div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textMuted }}>
                No bookings received yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {requests.map((item) => {
                  const s = (item.status || '').toLowerCase();
                  const isActioning = actionLoading === item.id;

                  return (
                    <div
                      key={item.id}
                      style={{
                        border: `1px solid ${theme.colors.borderLight}`,
                        borderRadius: theme.radii.lg,
                        padding: '18px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        backgroundColor: s !== 'pending' ? '#F8FAFC' : '#FFFFFF',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                            {item.customer_name || 'Customer Appointment'}
                          </h4>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: theme.radii.full,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#EFF6FF',
                              color: theme.colors.accentBlue,
                            }}
                          >
                            {item.service_type || 'Service'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: theme.colors.textMuted }}>
                            ID: #{String(item.id).slice(0, 8).toUpperCase()}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.82rem', color: theme.colors.textSecondary }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {formatBookingDate(item.booking_date)}
                          </span>
                          {item.base_price && (
                            <span style={{ fontWeight: 800, color: theme.colors.sunsetOrange }}>₹{item.base_price}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        {s === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              disabled={isActioning}
                              onClick={() => handleAction(item.id, 'accepted')}
                              style={{
                                backgroundColor: theme.colors.successGreen,
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: theme.radii.md,
                                padding: '8px 16px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: isActioning ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              disabled={isActioning}
                              onClick={() => handleAction(item.id, 'declined')}
                              style={{
                                backgroundColor: 'transparent',
                                color: theme.colors.errorRed,
                                border: `1px solid ${theme.colors.errorRed}`,
                                borderRadius: theme.radii.md,
                                padding: '8px 14px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: isActioning ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <X size={14} /> Decline
                            </button>
                          </div>
                        ) : s === 'accepted' || s === 'confirmed' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              disabled={isActioning}
                              onClick={() => handleAction(item.id, 'completed')}
                              style={{
                                backgroundColor: '#10B981',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: theme.radii.md,
                                padding: '7px 14px',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                cursor: isActioning ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle2 size={13} /> Mark Completed
                            </button>
                            <button
                              disabled={isActioning}
                              onClick={() => handleAction(item.id, 'cancelled')}
                              style={{
                                backgroundColor: '#FEE2E2',
                                color: '#991B1B',
                                border: 'none',
                                borderRadius: theme.radii.md,
                                padding: '7px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: isActioning ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <XCircle size={13} /> Cancel
                            </button>
                          </div>
                        ) : s === 'completed' ? (
                          <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.85rem' }}>
                            ✓ Service Completed
                          </span>
                        ) : (
                          <span style={{ color: theme.colors.errorRed, fontWeight: 700, fontSize: '0.85rem' }}>
                            ✕ {s === 'cancelled' ? 'Appointment Cancelled' : 'Booking Declined'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: SERVICES MENU & PRICING
        ========================================================================== */}
        {activeTab === 'services' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              padding: '24px',
              border: `1px solid ${theme.colors.borderLight}`,
              boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  Sub-Services Catalog & Pricing
                </h3>
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
                  Customers can pick specific treatments, view accurate pricing, and book directly.
                </span>
              </div>
              <button
                onClick={handleOpenAddService}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: theme.colors.sunsetOrange,
                  color: '#FFFFFF',
                  padding: '9px 18px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.3)',
                }}
              >
                <Plus size={16} /> Add Sub-Service
              </button>
            </div>

            {(!profile?.sub_services || profile.sub_services.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textMuted }}>
                No customized sub-services added yet. Click "Add Sub-Service" to showcase specific offerings!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {profile.sub_services.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    style={{
                      border: `1px solid ${theme.colors.borderLight}`,
                      borderRadius: '16px',
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      gap: '14px',
                      boxShadow: '0 1px 4px rgba(15, 30, 54, 0.03)',
                    }}
                  >
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#F1F5F9',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={sub.photo || profile.image_url || '/logo.png'}
                        alt={sub.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                          {sub.name}
                        </h4>
                        <span style={{ fontSize: '1.05rem', fontWeight: 900, color: theme.colors.sunsetOrange }}>
                          ₹{sub.price}
                        </span>
                      </div>

                      {sub.description && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: theme.colors.textMuted, lineHeight: '1.3' }}>
                          {sub.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {sub.duration || '30 mins'}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditService(idx)}
                            style={{
                              background: '#F1F5F9',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              color: theme.colors.primaryNavy,
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteService(idx)}
                            style={{
                              background: '#FEE2E2',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              color: '#DC2626',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: STOREFRONT & HOURS CONFIGURATION
        ========================================================================== */}
        {activeTab === 'storefront' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              padding: '28px',
              border: `1px solid ${theme.colors.borderLight}`,
              boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)',
              maxWidth: '800px',
            }}
          >
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                Business Profile & Operating Hours
              </h3>
              <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
                Keep your venue's details accurate for customer discovery and slot calculation.
              </span>
            </div>

            <form onSubmit={handleSaveStorefront}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Shop / Salon Name
                  </label>
                  <input
                    type="text"
                    required
                    value={storeForm.shop_name}
                    onChange={(e) => setStoreForm({ ...storeForm, shop_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Primary Category
                  </label>
                  <input
                    type="text"
                    required
                    value={storeForm.service_type}
                    onChange={(e) => setStoreForm({ ...storeForm, service_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  Street Address & Location (Select from Verified Map)
                </label>
                <LocationAutocomplete
                  value={storeForm.address}
                  onChange={(val) => setStoreForm({ ...storeForm, address: val })}
                  onLocationSelect={(place) => {
                    setStoreForm({
                      ...storeForm,
                      address: place.name,
                      latitude: place.lat,
                      longitude: place.lng,
                    });
                  }}
                  required={true}
                  placeholder="Type city, street, or landmark (e.g. Kannur, Kerala)..."
                  showMapPreview={true}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={storeForm.phone}
                    onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Base Session Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={storeForm.base_price}
                    onChange={(e) => setStoreForm({ ...storeForm, base_price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={storeForm.opening_time}
                    onChange={(e) => setStoreForm({ ...storeForm, opening_time: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={storeForm.closing_time}
                    onChange={(e) => setStoreForm({ ...storeForm, closing_time: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Accepting Bookings?
                  </label>
                  <select
                    value={storeForm.is_open_now ? 'true' : 'false'}
                    onChange={(e) => setStoreForm({ ...storeForm, is_open_now: e.target.value === 'true' })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="true">Yes, Open Now</option>
                    <option value="false">Paused / Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  About Your Business
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short intro about your staff, expertise, and sanitation standards..."
                  value={storeForm.about}
                  onChange={(e) => setStoreForm({ ...storeForm, about: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.9rem',
                    resize: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={savingStore}
                style={{
                  backgroundColor: theme.colors.sunsetOrange,
                  color: '#FFFFFF',
                  padding: '12px 28px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: savingStore ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.3)',
                }}
              >
                {savingStore ? 'Saving Changes...' : 'Save Storefront Settings'}
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 4: PHOTO GALLERY
        ========================================================================== */}
        {activeTab === 'gallery' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              padding: '24px',
              border: `1px solid ${theme.colors.borderLight}`,
              boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  Venue Photo Gallery
                </h3>
                <span
                  style={{
                    backgroundColor: (profile?.gallery_photos?.length || 0) >= 3 ? '#DCFCE7' : '#FEF3C7',
                    color: (profile?.gallery_photos?.length || 0) >= 3 ? '#166534' : '#92400E',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '999px',
                  }}
                >
                  {(profile?.gallery_photos?.length || 0) >= 3 ? `✓ ${profile?.gallery_photos?.length} Photos (Minimum Met)` : `⚠️ ${profile?.gallery_photos?.length || 0} / 3 Photos (Need Minimum 3)`}
                </span>
              </div>
              <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
                Add at least 3 high-resolution pictures of your store, styling stations, equipment, and customer reception.
              </span>
            </div>

            {/* Add photo bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', maxWidth: '600px' }}>
              <input
                type="file"
                ref={galleryInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const currentGallery = Array.isArray(profile?.gallery_photos) ? [...profile.gallery_photos] : [];
                      currentGallery.push(reader.result);
                      try {
                        await apiService.updateMerchantGallery(currentGallery);
                        showToast('Photo uploaded to gallery!');
                        await loadDashboardData();
                      } catch (err) {
                        alert(err.message || 'Failed to upload photo');
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                style={{
                  backgroundColor: '#0F1E36',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Camera size={15} /> Upload from Device
              </button>

              <input
                type="url"
                placeholder="Or paste image URL (https://...)"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: theme.radii.md,
                  border: `1px solid ${theme.colors.borderLight}`,
                  fontSize: '0.88rem',
                }}
              />
              <button
                onClick={handleAddGalleryPhoto}
                style={{
                  backgroundColor: theme.colors.sunsetOrange,
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={15} /> Add URL
              </button>
            </div>

            {/* Gallery Grid */}
            {(!profile?.gallery_photos || profile.gallery_photos.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textMuted }}>
                No gallery pictures added yet. Paste image links above to enrich your venue profile!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {profile.gallery_photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      aspectRatio: '16 / 9',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: `1px solid ${theme.colors.borderLight}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt={`Gallery item ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => handleDeleteGalleryPhoto(idx)}
                      title="Delete photo"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: CUSTOMER REVIEWS
        ========================================================================== */}
        {activeTab === 'reviews' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              padding: '24px',
              border: `1px solid ${theme.colors.borderLight}`,
              boxShadow: '0 2px 8px rgba(15, 30, 54, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  Customer Feedback & Ratings
                </h3>
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
                  Reviews left by verified customers after completing appointments.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FEF3C7', padding: '6px 14px', borderRadius: '12px' }}>
                <Star size={16} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontSize: '1rem', fontWeight: 900, color: '#92400E' }}>
                  {profile?.rating ? profile.rating.toFixed(1) : '5.0'}
                </span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: theme.colors.textMuted }}>
                No customer reviews logged yet. They will appear here once customers complete their appointments!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      border: `1px solid ${theme.colors.borderLight}`,
                      borderRadius: theme.radii.lg,
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
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
                          }}
                        >
                          {(rev.customer_name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: theme.colors.primaryNavy, fontSize: '0.9rem' }}>
                            {rev.customer_name}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: theme.colors.textMuted }}>
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>

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
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: theme.colors.primaryNavy, lineHeight: '1.4' }}>
                        "{rev.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sub-Service Add / Edit Modal */}
      {showServiceModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowServiceModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.xl,
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                {editingServiceIndex !== null ? 'Edit Sub-Service' : 'Add New Sub-Service'}
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveService}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keratin Hair Spa, Deep Tissue Massage"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 45 mins, 1 hour"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  Service Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={serviceForm.photo}
                  onChange={(e) => setServiceForm({ ...serviceForm, photo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of what's included in this service..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.9rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    backgroundColor: '#FFFFFF',
                    color: theme.colors.textSecondary,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: theme.radii.md,
                    border: 'none',
                    backgroundColor: theme.colors.sunsetOrange,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {editingServiceIndex !== null ? 'Update Service' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onProfileUpdated={(updated) => {
          showToast(`Profile updated! Welcome, ${updated.name}`);
        }}
      />

      {/* Subscription Modal */}
      <MerchantSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribed={(res) => {
          showToast('🎉 Partner Pro Subscription Activated Successfully!');
          loadDashboardData();
        }}
      />

      {/* 16:9 Cover Cropping Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        imageSrc={tempCoverSrc}
        onClose={() => setShowCropModal(false)}
        onCropComplete={async (croppedData) => {
          setUpdatingPhoto(true);
          try {
            await apiService.updateMerchantPhoto(croppedData);
            showToast('Shop cover photo updated with 16:9 widescreen crop!');
            await loadDashboardData();
          } catch (err) {
            alert(err.message || 'Failed to update cover photo');
          } finally {
            setUpdatingPhoto(false);
          }
        }}
        aspectRatio={16 / 9}
      />
    </div>
  );
}
