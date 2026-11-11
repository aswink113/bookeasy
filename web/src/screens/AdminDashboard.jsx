import React, { useState } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { theme } from '../theme/appTheme';

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'merchants' | 'users' | 'bookings' | 'revenue'
  const [search, setSearch] = useState('');

  // Sample real-time analytics data
  const stats = {
    users: 1420,
    merchants: 85,
    bookings: 328,
    revenue: 84915,
  };

  const merchants = [
    { id: 1, name: 'Urban Cut Studio', category: 'Salon', rating: 4.9, subscribed: true, bookings: 78, revenue: '₹35,100' },
    { id: 2, name: 'Aura Wellness & Spa', category: 'Spa & Massage', rating: 4.8, subscribed: true, bookings: 54, revenue: '₹64,800' },
    { id: 3, name: 'SpeedyWash Express', category: 'Car Detailing', rating: 4.7, subscribed: true, bookings: 92, revenue: '₹55,200' },
    { id: 4, name: 'Luxe Glow Lounge', category: 'Salon', rating: 4.6, subscribed: false, bookings: 21, revenue: '₹12,600' },
    { id: 5, name: 'Zenith Dental Care', category: 'Dental Clinic', rating: 4.9, subscribed: true, bookings: 43, revenue: '₹43,000' },
  ];

  const recentUsers = [
    { id: 1, name: 'Aswin Kumar', email: 'aswin@example.com', role: 'customer', joined: '2 hours ago', status: 'Active' },
    { id: 2, name: 'Sreya Sen', email: 'sreya@example.com', role: 'customer', joined: '5 hours ago', status: 'Active' },
    { id: 3, name: 'Vikram Mehta', email: 'vikram@urbancut.com', role: 'merchant', joined: 'Yesterday', status: 'Active' },
    { id: 4, name: 'Pooja Hegde', email: 'pooja@gmail.com', role: 'customer', joined: '2 days ago', status: 'Suspended' },
  ];

  const bookings = [
    { id: 'BK-1081', customer: 'Aswin Kumar', merchant: 'Urban Cut Studio', service: 'Haircut & Beard', amount: '₹450', status: 'Confirmed' },
    { id: 'BK-1082', customer: 'Sreya Sen', merchant: 'Aura Wellness', service: 'Deep Tissue 60m', amount: '₹1,200', status: 'Pending' },
    { id: 'BK-1083', customer: 'Ravi Shankar', merchant: 'SpeedyWash Express', service: 'Complete Detailing', amount: '₹800', status: 'Completed' },
    { id: 'BK-1084', customer: 'Neha Sharma', merchant: 'Luxe Glow Lounge', service: 'Express Pedicure', amount: '₹600', status: 'Cancelled' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', color: theme.colors.primaryNavy }}>
      {/* Admin Sidebar - Clean Light Theme */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${theme.colors.borderLight}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px 8px', borderBottom: `1px solid ${theme.colors.borderLight}` }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FF7A00 0%, #FF9533 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.35)',
            }}
          >
            B
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: theme.colors.primaryNavy }}>Bokivo Intel</h3>
            <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>Corporate Admin</span>
          </div>
        </div>

        <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
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
                  gap: '12px',
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
                <Icon size={18} color={active ? theme.colors.sunsetOrange : theme.colors.textSecondary} />
                {item.label}
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
            <ArrowLeft size={16} /> Back to Web App
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: theme.colors.primaryNavy }}>
              {activeTab === 'overview' && 'Corporate Command Center'}
              {activeTab === 'merchants' && 'Merchant Partner Fleet'}
              {activeTab === 'users' && 'Customer Directory'}
              {activeTab === 'bookings' && 'Booking Audit Ledger'}
              {activeTab === 'revenue' && 'Platform Revenue Analytics'}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: theme.colors.textMuted, fontSize: '0.9rem' }}>
              System operational. PostgreSQL + PostGIS cluster active.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#059669', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '9999px', fontWeight: 800 }}>
              ● Live Metrics
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Active Users</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '8px', color: theme.colors.primaryNavy }}>{stats.users}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Merchants</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '8px', color: theme.colors.tealAccent }}>{stats.merchants}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>Total Bookings</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '8px', color: theme.colors.sunsetOrange }}>{stats.bookings}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, fontWeight: 700 }}>MRR Subscription Revenue</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '8px', color: '#059669' }}>₹{stats.revenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Top Performing Merchants */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: theme.colors.primaryNavy }}>Top Rated Merchants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {merchants.slice(0, 4).map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                    <div>
                      <div style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{m.name}</div>
                      <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{m.category}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{m.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings Queue */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: theme.colors.primaryNavy }}>Live Transaction Ledger</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                    <div>
                      <div style={{ fontWeight: 800, color: theme.colors.primaryNavy }}>{b.customer} → {b.merchant}</div>
                      <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted }}>{b.service}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: theme.colors.sunsetOrange }}>{b.amount}</div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: b.status === 'Confirmed' ? '#059669' : '#D97706' }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'merchants' || activeTab === 'revenue') && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: 800, color: theme.colors.primaryNavy }}>Registered Merchant Partners</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.borderLight}`, color: theme.colors.textMuted }}>
                  <th style={{ padding: '12px' }}>Business</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Rating</th>
                  <th style={{ padding: '12px' }}>Subscription</th>
                  <th style={{ padding: '12px' }}>Gross Revenue</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: theme.colors.primaryNavy }}>{m.name}</td>
                    <td style={{ padding: '14px 12px', color: theme.colors.textSecondary }}>{m.category}</td>
                    <td style={{ padding: '14px 12px', color: '#D97706', fontWeight: 700 }}>★ {m.rating}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: m.subscribed ? '#DCFCE7' : '#FEE2E2', color: m.subscribed ? '#166534' : '#991B1B' }}>
                        {m.subscribed ? 'Active' : 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#059669', fontWeight: 800 }}>{m.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: 800, color: theme.colors.primaryNavy }}>Customer Directory</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.borderLight}`, color: theme.colors.textMuted }}>
                  <th style={{ padding: '12px' }}>User</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Joined</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: theme.colors.primaryNavy }}>{u.name}</td>
                    <td style={{ padding: '14px 12px', color: theme.colors.textSecondary }}>{u.email}</td>
                    <td style={{ padding: '14px 12px', textTransform: 'capitalize', color: theme.colors.textSecondary }}>{u.role}</td>
                    <td style={{ padding: '14px 12px', color: theme.colors.textMuted }}>{u.joined}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: u.status === 'Active' ? '#DCFCE7' : '#FEE2E2', color: u.status === 'Active' ? '#166534' : '#991B1B' }}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: theme.radii.xl, border: `1px solid ${theme.colors.borderLight}`, padding: '24px', boxShadow: '0 4px 12px rgba(15, 30, 54, 0.04)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: 800, color: theme.colors.primaryNavy }}>Global Booking Ledger</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.borderLight}`, color: theme.colors.textMuted }}>
                  <th style={{ padding: '12px' }}>Booking ID</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Merchant</th>
                  <th style={{ padding: '12px' }}>Service</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: `1px solid ${theme.colors.borderLight}` }}>
                    <td style={{ padding: '14px 12px', fontWeight: 800, color: theme.colors.sunsetOrange }}>{b.id}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: theme.colors.primaryNavy }}>{b.customer}</td>
                    <td style={{ padding: '14px 12px', color: theme.colors.textSecondary }}>{b.merchant}</td>
                    <td style={{ padding: '14px 12px', color: theme.colors.textSecondary }}>{b.service}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 800, color: theme.colors.primaryNavy }}>{b.amount}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: b.status === 'Confirmed' ? '#DCFCE7' : '#FEF3C7', color: b.status === 'Confirmed' ? '#166534' : '#D97706' }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
