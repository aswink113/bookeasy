import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  CalendarCheck,
  TrendingUp,
  Search,
  Star,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ArrowLeft,
  Database,
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
  RefreshCw,
  FolderTree,
  DollarSign,
  Tag,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { theme } from '../theme/appTheme';
import { apiService } from '../services/apiService';

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'master-data' | 'merchants' | 'users' | 'bookings' | 'revenue'
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  // Overview stats & records
  const [stats, setStats] = useState({ users: 0, merchants: 0, bookings: 0, revenue: 0 });
  const [topMerchants, setTopMerchants] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  // Full datasets
  const [merchantsList, setMerchantsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  
  // Master Data state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Category Modal state (Add / Edit)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '✨',
    description: '',
    display_order: 0,
    is_active: true
  });

  // Sub-Category Modal state (Add / Edit)
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [subCategoryForm, setSubCategoryForm] = useState({
    category_id: '',
    name: '',
    default_price: 299,
    duration_mins: 30,
    is_active: true
  });

  useEffect(() => {
    loadTabContent();
  }, [activeTab]);

  const showToast = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const loadTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await apiService.getAdminOverview();
        if (data.stats) setStats(data.stats);
        if (data.top_merchants) setTopMerchants(data.top_merchants);
        if (data.recent_bookings) setRecentBookings(data.recent_bookings);
      } else if (activeTab === 'master-data') {
        const cats = await apiService.getMasterCategories();
        setCategories(cats);
        if (cats.length > 0 && !selectedCategory) {
          setSelectedCategory(cats[0]);
        } else if (selectedCategory) {
          const updated = cats.find((c) => c.id === selectedCategory.id);
          setSelectedCategory(updated || cats[0]);
        }
      } else if (activeTab === 'merchants' || activeTab === 'revenue') {
        const data = await apiService.getAdminMerchants();
        setMerchantsList(data);
      } else if (activeTab === 'users') {
        const data = await apiService.getAdminUsers();
        setUsersList(data);
      } else if (activeTab === 'bookings') {
        const data = await apiService.getAdminBookings();
        setBookingsList(data);
      }
    } catch (err) {
      console.error('Error fetching admin tab content:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Category Actions ---
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        name: cat.name,
        icon: cat.icon || '✨',
        description: cat.description || '',
        display_order: cat.display_order || 0,
        is_active: cat.is_active ?? true
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        icon: '✨',
        description: '',
        display_order: (categories.length + 1),
        is_active: true
      });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    try {
      if (editingCategory) {
        await apiService.updateMasterCategory(editingCategory.id, categoryForm);
        showToast(`Category "${categoryForm.name}" updated successfully.`);
      } else {
        await apiService.createMasterCategory(categoryForm);
        showToast(`New Category "${categoryForm.name}" created.`);
      }
      setShowCategoryModal(false);
      const cats = await apiService.getMasterCategories();
      setCategories(cats);
      if (editingCategory) {
        setSelectedCategory(cats.find((c) => c.id === editingCategory.id) || cats[0]);
      } else {
        setSelectedCategory(cats[cats.length - 1] || cats[0]);
      }
    } catch (err) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to permanently delete category "${catName}" and all of its sub-categories?`)) return;
    try {
      await apiService.deleteMasterCategory(catId);
      showToast(`Category "${catName}" deleted.`);
      const cats = await apiService.getMasterCategories();
      setCategories(cats);
      setSelectedCategory(cats[0] || null);
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // --- Sub-Category Actions ---
  const handleOpenSubCategoryModal = (sub = null) => {
    if (!selectedCategory) {
      alert('Please select or create a main category first');
      return;
    }
    if (sub) {
      setEditingSubCategory(sub);
      setSubCategoryForm({
        category_id: selectedCategory.id,
        name: sub.name,
        default_price: sub.default_price || 0,
        duration_mins: sub.duration_mins || 30,
        is_active: sub.is_active ?? true
      });
    } else {
      setEditingSubCategory(null);
      setSubCategoryForm({
        category_id: selectedCategory.id,
        name: '',
        default_price: 299,
        duration_mins: 30,
        is_active: true
      });
    }
    setShowSubCategoryModal(true);
  };

  const handleSaveSubCategory = async (e) => {
    e.preventDefault();
    if (!subCategoryForm.name.trim()) return;
    try {
      if (editingSubCategory) {
        await apiService.updateMasterSubCategory(editingSubCategory.id, {
          name: subCategoryForm.name,
          default_price: Number(subCategoryForm.default_price),
          duration_mins: Number(subCategoryForm.duration_mins),
          is_active: subCategoryForm.is_active
        });
        showToast(`Sub-category "${subCategoryForm.name}" updated.`);
      } else {
        await apiService.createMasterSubCategory({
          category_id: selectedCategory.id,
          name: subCategoryForm.name,
          default_price: Number(subCategoryForm.default_price),
          duration_mins: Number(subCategoryForm.duration_mins),
          is_active: subCategoryForm.is_active
        });
        showToast(`Sub-category "${subCategoryForm.name}" added to ${selectedCategory.name}.`);
      }
      setShowSubCategoryModal(false);
      const cats = await apiService.getMasterCategories();
      setCategories(cats);
      setSelectedCategory(cats.find((c) => c.id === selectedCategory.id) || cats[0]);
    } catch (err) {
      alert(err.message || 'Failed to save sub-category');
    }
  };

  const handleDeleteSubCategory = async (subId, subName) => {
    if (!window.confirm(`Delete sub-category "${subName}"?`)) return;
    try {
      await apiService.deleteMasterSubCategory(subId);
      showToast(`Sub-category "${subName}" deleted.`);
      const cats = await apiService.getMasterCategories();
      setCategories(cats);
      setSelectedCategory(cats.find((c) => c.id === selectedCategory.id) || cats[0]);
    } catch (err) {
      alert(err.message || 'Failed to delete sub-category');
    }
  };

  const handleToggleMerchantSub = async (merchantId, currentStatus) => {
    try {
      const res = await apiService.toggleMerchantSubscription(merchantId);
      setMerchantsList((prev) =>
        prev.map((m) => (m.id === merchantId ? { ...m, is_subscribed: res.is_subscribed } : m))
      );
      showToast(`Subscription status updated to: ${res.is_subscribed ? 'Active' : 'Unpaid'}`);
    } catch (err) {
      alert(err.message || 'Failed to toggle subscription');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: theme.colors.primaryNavy }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${theme.colors.borderLight}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 24px 8px', borderBottom: `1px solid ${theme.colors.borderLight}` }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.35)',
              fontSize: '1.2rem',
            }}
          >
            B
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: theme.colors.primaryNavy }}>Bokivo Intel</h3>
            <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted, fontWeight: 700 }}>Super Admin Console</span>
          </div>
        </div>

        <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
            { id: 'master-data', label: 'Master Data & Services', icon: Database, badge: 'Crucial' },
            { id: 'merchants', label: 'Merchant Fleet', icon: Store },
            { id: 'users', label: 'Customer Base', icon: Users },
            { id: 'bookings', label: 'Booking Ledger', icon: CalendarCheck },
            { id: 'revenue', label: 'Revenue Streams', icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  backgroundColor: active ? theme.colors.sunsetOrangeLight : 'transparent',
                  color: active ? theme.colors.sunsetOrange : theme.colors.textSecondary,
                  fontSize: '0.9rem',
                  fontWeight: active ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={active ? theme.colors.sunsetOrange : theme.colors.textSecondary} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '8px',
                      backgroundColor: active ? theme.colors.sunsetOrange : '#F1F5F9',
                      color: active ? '#FFFFFF' : theme.colors.primaryNavy,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: `1px solid ${theme.colors.borderLight}` }}>
          <button
            onClick={() => onNavigate('customer-home')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px 14px',
              borderRadius: theme.radii.md,
              backgroundColor: '#F1F5F9',
              border: `1px solid ${theme.colors.borderLight}`,
              color: theme.colors.primaryNavy,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
          >
            <ArrowLeft size={16} /> Return to Discovery App
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Action Notice Alert */}
        {actionNotice && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 18px',
              backgroundColor: '#DCFCE7',
              color: '#166534',
              borderRadius: theme.radii.md,
              border: '1px solid #BBF7D0',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Check size={18} />
            {actionNotice}
          </div>
        )}

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
              {activeTab === 'overview' && 'Executive Command Center'}
              {activeTab === 'master-data' && 'Master Data & Category Management'}
              {activeTab === 'merchants' && 'Merchant Partner Fleet'}
              {activeTab === 'users' && 'Customer Directory'}
              {activeTab === 'bookings' && 'Booking Audit Ledger'}
              {activeTab === 'revenue' && 'Platform Revenue Analytics'}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: theme.colors.textMuted, fontSize: '0.9rem' }}>
              Bokivo enterprise administration portal & real-time PostgreSQL synchronization.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={loadTabContent}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderLight}`,
                backgroundColor: '#FFFFFF',
                color: theme.colors.primaryNavy,
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <span style={{ fontSize: '0.82rem', color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '9999px', fontWeight: 800 }}>
              ● Live Synchronized
            </span>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: EXECUTIVE OVERVIEW
        ========================================================================== */}
        {activeTab === 'overview' && (
          <div>
            {/* Top Stat Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Total Registered Users</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '8px', color: theme.colors.primaryNavy }}>{stats.users}</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Verified Merchants</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '8px', color: theme.colors.tealAccent }}>{stats.merchants}</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Total Bookings Logged</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '8px', color: theme.colors.sunsetOrange }}>{stats.bookings}</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
                <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Verified Revenue</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '8px', color: '#059669' }}>₹{stats.revenue.toLocaleString()}</div>
              </div>
            </div>

            {/* Split Grids: Top Rated Merchants & Recent Live Bookings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: theme.colors.primaryNavy }}>Top Rated Partners</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {topMerchants.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                      <div>
                        <div style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{m.shop_name}</div>
                        <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{m.service_type} • {m.address}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={15} fill="#F59E0B" color="#F59E0B" />
                        <span style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{m.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: theme.colors.primaryNavy }}>Recent Appointments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {recentBookings.map((b) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                      <div>
                        <div style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{b.customer_name} → {b.shop_name}</div>
                        <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{b.service}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: theme.colors.sunsetOrange }}>₹{b.price}</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: b.status === 'accepted' ? '#059669' : '#D97706' }}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: MASTER DATA MANAGEMENT (ADD / EDIT / DELETE CATEGORIES & SUB-SERVICES)
        ========================================================================== */}
        {activeTab === 'master-data' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  Service Hierarchy & Taxonomy Control
                </h2>
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
                  Define high-level sectors (Salon, Spa, Car Detailing...) and configure default sub-services, base rates, and booking duration.
                </span>
              </div>
              <button
                onClick={() => handleOpenCategoryModal()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: theme.colors.sunsetOrange,
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)',
                }}
              >
                <Plus size={16} /> Add New Main Category
              </button>
            </div>

            {/* Two-Pane Layout: Left Categories, Right Sub-categories */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
              {/* Left Pane: Categories List */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: theme.radii.xl,
                  border: `1px solid ${theme.colors.borderLight}`,
                  padding: '18px',
                  boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Master Categories ({categories.length})
                </div>

                {categories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: theme.radii.lg,
                        border: `1px solid ${isSelected ? theme.colors.sunsetOrange : theme.colors.borderLight}`,
                        backgroundColor: isSelected ? theme.colors.sunsetOrangeLight : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{cat.icon || '✨'}</span>
                        <div>
                          <div style={{ fontWeight: 800, color: theme.colors.primaryNavy, fontSize: '0.92rem' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
                            {cat.sub_categories?.length || 0} Sub-services
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenCategoryModal(cat)}
                          title="Edit Category"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: theme.colors.textSecondary,
                            padding: '4px',
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          title="Delete Category"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#EF4444',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Pane: Sub-Categories of Selected Category */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: theme.radii.xl,
                  border: `1px solid ${theme.colors.borderLight}`,
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)',
                }}
              >
                {selectedCategory ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${theme.colors.borderLight}`, paddingBottom: '16px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '2rem' }}>{selectedCategory.icon || '✨'}</span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                            {selectedCategory.name} Sub-Services
                          </h3>
                          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: theme.colors.textMuted }}>
                            {selectedCategory.description || 'Custom business service category with configurable sub-tiers.'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenSubCategoryModal()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#0F1E36',
                          color: '#FFFFFF',
                          padding: '9px 16px',
                          borderRadius: theme.radii.md,
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={15} /> Add Sub-Service
                      </button>
                    </div>

                    {/* Sub-categories Table */}
                    {selectedCategory.sub_categories?.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.colors.textMuted }}>
                        <Layers size={36} style={{ marginBottom: '10px', color: '#CBD5E1' }} />
                        <h4 style={{ margin: 0, color: theme.colors.primaryNavy }}>No sub-services defined yet</h4>
                        <p style={{ fontSize: '0.85rem', margin: '6px 0 0' }}>
                          Add specific treatments, procedures or offerings under {selectedCategory.name}.
                        </p>
                      </div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${theme.colors.borderLight}`, color: theme.colors.textMuted }}>
                            <th style={{ padding: '12px' }}>Service Name</th>
                            <th style={{ padding: '12px' }}>Default Price</th>
                            <th style={{ padding: '12px' }}>Duration</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCategory.sub_categories?.map((sub) => (
                            <tr key={sub.id} style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                              <td style={{ padding: '14px 12px', fontWeight: 800, color: theme.colors.primaryNavy }}>
                                {sub.name}
                              </td>
                              <td style={{ padding: '14px 12px', color: theme.colors.sunsetOrange, fontWeight: 800 }}>
                                ₹{sub.default_price}
                              </td>
                              <td style={{ padding: '14px 12px', color: theme.colors.textSecondary }}>
                                <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                                {sub.duration_mins} mins
                              </td>
                              <td style={{ padding: '14px 12px' }}>
                                <span
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    backgroundColor: sub.is_active ? '#DCFCE7' : '#FEE2E2',
                                    color: sub.is_active ? '#166534' : '#991B1B',
                                  }}
                                >
                                  {sub.is_active ? 'Active' : 'Disabled'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleOpenSubCategoryModal(sub)}
                                    title="Edit Sub-category"
                                    style={{
                                      background: '#F1F5F9',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '6px 8px',
                                      cursor: 'pointer',
                                      color: theme.colors.primaryNavy,
                                    }}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubCategory(sub.id, sub.name)}
                                    title="Delete Sub-category"
                                    style={{
                                      background: '#FEE2E2',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '6px 8px',
                                      cursor: 'pointer',
                                      color: '#DC2626',
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '50px', color: theme.colors.textMuted }}>
                    Select a category to view its sub-services
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: MERCHANTS FLEET
        ========================================================================== */}
        {(activeTab === 'merchants' || activeTab === 'revenue') && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  Registered Merchant Partners ({merchantsList.length})
                </h3>
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>
                  Manage storefront subscriptions, service categories, and real-time revenue collection.
                </span>
              </div>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} color={theme.colors.textMuted} style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Filter merchants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.borderLight}`, color: theme.colors.textMuted }}>
                  <th style={{ padding: '12px' }}>Business</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Rating</th>
                  <th style={{ padding: '12px' }}>Base Price</th>
                  <th style={{ padding: '12px' }}>Bookings</th>
                  <th style={{ padding: '12px' }}>Subscription</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchantsList
                  .filter((m) => m.shop_name?.toLowerCase().includes(search.toLowerCase()) || m.service_type?.toLowerCase().includes(search.toLowerCase()))
                  .map((m) => (
                    <tr key={m.id} style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{m.shop_name}</div>
                        <div style={{ fontSize: '0.78rem', color: theme.colors.textMuted }}>{m.address}</div>
                      </td>
                      <td style={{ padding: '14px 12px', color: theme.colors.textSecondary, fontWeight: 600 }}>{m.service_type}</td>
                      <td style={{ padding: '14px 12px', color: '#D97706', fontWeight: 700 }}>
                        ★ {m.rating?.toFixed(1) || '5.0'}
                      </td>
                      <td style={{ padding: '14px 12px', color: theme.colors.primaryNavy, fontWeight: 700 }}>
                        ₹{m.base_price}
                      </td>
                      <td style={{ padding: '14px 12px', color: theme.colors.textSecondary, fontWeight: 700 }}>
                        {m.total_bookings}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: m.is_subscribed ? '#DCFCE7' : '#FEE2E2', color: m.is_subscribed ? '#166534' : '#991B1B' }}>
                          {m.is_subscribed ? 'Active Pro' : 'Unpaid'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleMerchantSub(m.id, m.is_subscribed)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: theme.radii.sm,
                            border: `1px solid ${theme.colors.borderLight}`,
                            backgroundColor: m.is_subscribed ? '#FEF2F2' : '#F0FDF4',
                            color: m.is_subscribed ? '#DC2626' : '#166534',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {m.is_subscribed ? 'Revoke Subscription' : 'Grant Active'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            TAB 4: USERS / CUSTOMER BASE
        ========================================================================== */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
              Registered Platform Accounts ({usersList.length})
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.borderLight}`, color: theme.colors.textMuted }}>
                  <th style={{ padding: '12px' }}>User</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Bookings Placed</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: theme.colors.primaryNavy }}>{u.name}</td>
                    <td style={{ padding: '14px 12px', color: theme.colors.textSecondary }}>{u.email}</td>
                    <td style={{ padding: '14px 12px', textTransform: 'capitalize' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: u.role === 'admin' ? '#FEE2E2' : u.role === 'merchant' ? '#FEF3C7' : '#EFF6FF',
                          color: u.role === 'admin' ? '#991B1B' : u.role === 'merchant' ? '#92400E' : '#1D4ED8',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: theme.colors.primaryNavy }}>
                      {u.total_bookings}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#DCFCE7', color: '#166534' }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================================
            TAB 5: BOOKINGS AUDIT LEDGER
        ========================================================================== */}
        {activeTab === 'bookings' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
              All Bookings & Transactions ({bookingsList.length})
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.borderLight}`, color: theme.colors.textMuted }}>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Merchant</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Review</th>
                </tr>
              </thead>
              <tbody>
                {bookingsList.map((b) => (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontWeight: 700, color: theme.colors.primaryNavy }}>{b.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>{b.customer_email}</div>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: theme.colors.primaryNavy }}>{b.shop_name}</td>
                    <td style={{ padding: '14px 12px', color: theme.colors.textSecondary }}>{b.service_type}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 800, color: theme.colors.sunsetOrange }}>₹{b.price}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          backgroundColor: b.status === 'accepted' ? '#DCFCE7' : b.status === 'completed' ? '#DBEAFE' : '#FEF3C7',
                          color: b.status === 'accepted' ? '#166534' : b.status === 'completed' ? '#1E40AF' : '#D97706',
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {b.has_reviewed ? (
                        <span style={{ color: '#D97706', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={13} fill="#F59E0B" /> Reviewed
                        </span>
                      ) : (
                        <span style={{ color: theme.colors.textMuted, fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: ADD / EDIT MAIN CATEGORY
      ========================================================================== */}
      {showCategoryModal && (
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
          onClick={() => setShowCategoryModal(false)}
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
                {editingCategory ? 'Edit Master Category' : 'Create Master Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Grooming, Salon, Dental Care"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Icon / Emoji
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="✂️, 💆, 🦷"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: theme.radii.md,
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '1.1rem',
                      textAlign: 'center',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: Number(e.target.value) })}
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

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of services under this category..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
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
                  onClick={() => setShowCategoryModal(false)}
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
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD / EDIT SUB-CATEGORY
      ========================================================================== */}
      {showSubCategoryModal && (
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
          onClick={() => setShowSubCategoryModal(false)}
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
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: theme.colors.primaryNavy }}>
                  {editingSubCategory ? 'Edit Sub-Service' : 'Add New Sub-Service'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: theme.colors.sunsetOrange, fontWeight: 700 }}>
                  Under: {selectedCategory?.name}
                </span>
              </div>
              <button
                onClick={() => setShowSubCategoryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSubCategory}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                  Sub-Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Tissue Massage (60m), Hair Keratin Spa"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: theme.radii.md,
                    border: `1px solid ${theme.colors.borderLight}`,
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.colors.primaryNavy, marginBottom: '6px' }}>
                    Default Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={subCategoryForm.default_price}
                    onChange={(e) => setSubCategoryForm({ ...subCategoryForm, default_price: e.target.value })}
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
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={subCategoryForm.duration_mins}
                    onChange={(e) => setSubCategoryForm({ ...subCategoryForm, duration_mins: e.target.value })}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubCategoryModal(false)}
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
                  {editingSubCategory ? 'Save Changes' : 'Add Sub-Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
