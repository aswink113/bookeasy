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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0F1D', color: '#F8FAFC' }}>
      {/* Admin Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#0F172A',
          borderRight: '1px solid #1E293B',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px 8px', borderBottom: '1px solid #1E293B' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#0A0F1D',
            }}
          >
            B
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#F8FAFC' }}>Bokivo Intel</h3>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Corporate Admin</span>
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
                  backgroundColor: active ? '#1E293B' : 'transparent',
                  color: active ? '#10B981' : '#94A3B8',
                  fontSize: '0.9rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={18} color={active ? '#10B981' : '#94A3B8'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #1E293B' }}>
          <button
            onClick={() => onNavigate('customer-home')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: theme.radii.md,
              backgroundColor: '#1E293B',
              border: 'none',
              color: '#F8FAFC',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
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
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
              {activeTab === 'overview' && 'Corporate Command Center'}
              {activeTab === 'merchants' && 'Merchant Partner Fleet'}
              {activeTab === 'users' && 'Customer Directory'}
              {activeTab === 'bookings' && 'Booking Audit Ledger'}
              {activeTab === 'revenue' && 'Platform Revenue Analytics'}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#94A3B8', fontSize: '0.9rem' }}>
              System operational. PostgreSQL + PostGIS cluster active.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 14px', borderRadius: '9999px', fontWeight: 700 }}>
              ● Live Metrics
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#0F172A', padding: '20px', borderRadius: theme.radii.xl, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Active Users</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#F8FAFC' }}>{stats.users}</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: '20px', borderRadius: theme.radii.xl, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Merchants</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#38B6FF' }}>{stats.merchants}</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: '20px', borderRadius: theme.radii.xl, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Total Bookings</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#F59E0B' }}>{stats.bookings}</div>
          </div>
          <div style={{ backgroundColor: '#0F172A', padding: '20px', borderRadius: theme.radii.xl, border: '1px solid #1E293B' }}>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>MRR Subscription Revenue</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#10B981' }}>₹{stats.revenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Top Performing Merchants */}
            <div style={{ backgroundColor: '#0F172A', borderRadius: theme.radii.xl, border: '1px solid #1E293B', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Top Rated Merchants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {merchants.slice(0, 4).map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{m.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{m.category}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontWeight: 700 }}>{m.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings Queue */}
            <div style={{ backgroundColor: '#0F172A', borderRadius: theme.radii.xl, border: '1px solid #1E293B', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>Live Transaction Ledger</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #1E293B' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{b.customer} → {b.merchant}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{b.service}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#38B6FF' }}>{b.amount}</div>
                      <span style={{ fontSize: '0.75rem', color: b.status === 'Confirmed' ? '#10B981' : '#F59E0B' }}>
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
          <div style={{ backgroundColor: '#0F172A', borderRadius: theme.radii.xl, border: '1px solid #1E293B', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: 700 }}>Registered Merchant Partners</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '12px' }}>Business</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Rating</th>
                  <th style={{ padding: '12px' }}>Subscription</th>
                  <th style={{ padding: '12px' }}>Gross Revenue</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '14px 12px', color: '#94A3B8' }}>{m.category}</td>
                    <td style={{ padding: '14px 12px' }}>★ {m.rating}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: m.subscribed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: m.subscribed ? '#10B981' : '#EF4444' }}>
                        {m.subscribed ? 'Active' : 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#10B981', fontWeight: 700 }}>{m.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#0F172A', borderRadius: theme.radii.xl, border: '1px solid #1E293B', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: 700 }}>Customer Directory</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
                  <th style={{ padding: '12px' }}>User</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Joined</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '14px 12px', color: '#94A3B8' }}>{u.email}</td>
                    <td style={{ padding: '14px 12px', textTransform: 'capitalize' }}>{u.role}</td>
                    <td style={{ padding: '14px 12px', color: '#94A3B8' }}>{u.joined}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: u.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.status === 'Active' ? '#10B981' : '#EF4444' }}>
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
          <div style={{ backgroundColor: '#0F172A', borderRadius: theme.radii.xl, border: '1px solid #1E293B', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.15rem', fontWeight: 700 }}>Global Booking Ledger</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E293B', color: '#94A3B8' }}>
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
                  <tr key={b.id} style={{ borderBottom: '1px solid #1E293B' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 600, color: '#38B6FF' }}>{b.id}</td>
                    <td style={{ padding: '14px 12px' }}>{b.customer}</td>
                    <td style={{ padding: '14px 12px', color: '#94A3B8' }}>{b.merchant}</td>
                    <td style={{ padding: '14px 12px' }}>{b.service}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 700 }}>{b.amount}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: b.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: b.status === 'Confirmed' ? '#10B981' : '#F59E0B' }}>
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

