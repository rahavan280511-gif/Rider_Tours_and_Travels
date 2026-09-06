"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../src/services/api';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Auth state
  const [token, setToken] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  // Data states
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, enquiries, fleet
  const [bookingFilter, setBookingFilter] = useState('All'); // All, Pending, Confirmed, Completed, Cancelled
  const [bookingSearch, setBookingSearch] = useState('');
  const [enquirySearch, setEnquirySearch] = useState('');

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Auth checking on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('rider_tours_admin_token');
    const savedEmail = localStorage.getItem('rider_tours_admin_email');
    if (!savedToken) {
      router.push('/admin/login');
      return;
    }
    // Schedule state updates via setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setToken(savedToken);
      setAdminEmail(savedEmail || 'owner@ridertours.com');
      setAuthChecking(false);
    }, 0);
  }, [router]);

  // Fetch all dashboard data — used by the "Try Again" button and the useEffect below
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, bookingsRes, enquiriesRes, vehiclesRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/bookings'),
        api.get('/enquiries'),
        api.get('/vehicles'), // vehicles public endpoint, no auth required
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (bookingsRes.data?.success) setBookings(bookingsRes.data.data);
      if (enquiriesRes.data?.success) setEnquiries(enquiriesRes.data.data);
      if (vehiclesRes.data?.success) setVehicles(vehiclesRes.data.data);

    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('rider_tours_admin_token');
        router.push('/admin/login');
      } else {
        setError('Failed to fetch dashboard data. Please try refreshing.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token, fetchData]);


  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('rider_tours_admin_token');
    localStorage.removeItem('rider_tours_admin_email');
    localStorage.removeItem('rider_tours_admin_username');
    router.push('/admin/login');
  };

  // Update booking status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}`, { status: newStatus });
      if (res.data?.success) {
        // Update local list
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
        showToast(`Booking status updated to ${newStatus}`);
        // Refresh stats
        const statsRes = await api.get('/analytics');
        if (statsRes.data?.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update booking status', 'error');
    }
  };

  // Update booking payment status
  const handleUpdateBookingPayment = async (bookingId, newPaymentStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}`, { paymentStatus: newPaymentStatus });
      if (res.data?.success) {
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, paymentStatus: newPaymentStatus } : b));
        showToast(`Payment status updated to ${newPaymentStatus}`);
        const statsRes = await api.get('/analytics');
        if (statsRes.data?.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update payment status', 'error');
    }
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId, displayId) => {
    if (!window.confirm(`Are you sure you want to delete Booking ${displayId}?`)) return;

    try {
      const res = await api.delete(`/bookings/${bookingId}`);
      if (res.data?.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        showToast(`Booking ${displayId} deleted successfully`);
        const statsRes = await api.get('/analytics');
        if (statsRes.data?.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete booking', 'error');
    }
  };

  // Update enquiry status
  const handleUpdateEnquiryStatus = async (enquiryId, newStatus) => {
    try {
      const res = await api.put(`/enquiries/${enquiryId}`, { status: newStatus });
      if (res.data?.success) {
        setEnquiries(prev => prev.map(e => e._id === enquiryId ? { ...e, status: newStatus } : e));
        showToast(`Enquiry marked as ${newStatus}`);
        const statsRes = await api.get('/analytics');
        if (statsRes.data?.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update enquiry', 'error');
    }
  };

  // Delete enquiry
  const handleDeleteEnquiry = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      const res = await api.delete(`/enquiries/${enquiryId}`);
      if (res.data?.success) {
        setEnquiries(prev => prev.filter(e => e._id !== enquiryId));
        showToast('Enquiry deleted successfully');
        const statsRes = await api.get('/analytics');
        if (statsRes.data?.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to delete enquiry', 'error');
    }
  };

  // Filters and searches
  const filteredBookings = bookings.filter(b => {
    const matchesFilter = bookingFilter === 'All' || b.status === bookingFilter;
    const matchesSearch = 
      b.bookingId?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.phone?.includes(bookingSearch) ||
      b.email?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.pickup?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.drop?.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredEnquiries = enquiries.filter(e => {
    const matchesSearch =
      e.name?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.email?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.phone?.includes(enquirySearch) ||
      e.subject?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      e.message?.toLowerCase().includes(enquirySearch.toLowerCase());
    return matchesSearch;
  });

  if (authChecking) {
    return (
      <div style={{
        width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#0f172a',
        color: '#94a3b8', fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)',
          borderRadius: '50%', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite',
          marginBottom: '16px'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '15px', fontWeight: 600 }}>Loading admin session...</p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', minHeight: '100vh', background: '#f8fafc',
      fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Bypass customer header/footer */}
      <style>{`
        #main-header { display: none !important; }
        #main-footer { display: none !important; }
        tr:hover { background-color: #f8fafc; }
        select:focus, input:focus {
          border-color: #6366f1 !important;
          outline: none;
        }
      `}</style>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '14px 24px', borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontWeight: 700, fontSize: '14px', animation: 'slideUp 0.2s ease-out',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Dashboard Top Header */}
      <header style={{
        background: '#0f172a', color: '#fff', borderBottom: '1px solid #1e293b',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '70px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🚗</span>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Rider Tours</span>
              <span style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px',
                borderRadius: '50px', marginLeft: '8px', verticalAlign: 'middle', textTransform: 'uppercase'
              }}>Owner Portal</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Logged in as</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{adminEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.08)', color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 16px',
                borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="admin-main" style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
            borderRadius: '12px', padding: '16px', marginBottom: '24px', fontWeight: 700
          }}>
            ⚠️ {error} <button onClick={() => fetchData()} style={{ background: 'none', border: 'none', color: '#4f46e5', textDecoration: 'underline', cursor: 'pointer', fontWeight: 800 }}>Try Again</button>
          </div>
        )}

        {/* ── METRICS SUMMARY SECTION ── */}
        {stats && (
          <div className="admin-stats-grid" style={{ marginBottom: '32px' }}>
            {/* Total Revenue */}
            <div style={{
              background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
              padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Projected Revenue</p>
              <h3 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#10b981' }}>₹{stats.totalRevenue?.toLocaleString('en-IN')}</h3>
              <span style={{ fontSize: '11px', color: '#94a3b8', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>Confirmed + Completed Rides</span>
            </div>

            {/* Paid Revenue */}
            <div style={{
              background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
              padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Collected Revenue</p>
              <h3 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#3b82f6' }}>₹{stats.paidRevenue?.toLocaleString('en-IN')}</h3>
              <span style={{ fontSize: '11px', color: '#94a3b8', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>Marked as Paid</span>
            </div>

            {/* Total Bookings */}
            <div style={{
              background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
              padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Bookings</p>
              <h3 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#4f46e5' }}>{stats.bookingsCount}</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', color: '#0369a1', background: '#f0f9ff', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>{stats.statusCounts?.Confirmed || 0} Confirmed</span>
                <span style={{ fontSize: '10px', color: '#15803d', background: '#f0fdf4', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>{stats.statusCounts?.Completed || 0} Done</span>
              </div>
            </div>

            {/* Pending Actions */}
            <div style={{
              background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
              padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Bookings</p>
              <h3 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#f59e0b' }}>{stats.statusCounts?.Pending || 0}</h3>
              <span style={{ fontSize: '11px', background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>Awaiting Confirmation</span>
            </div>

            {/* Inquiries */}
            <div style={{
              background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
              padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Enquiries</p>
              <h3 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 900, color: '#8b5cf6' }}>{stats.enquiriesCount}</h3>
              <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#6d28d9', padding: '2px 8px', borderRadius: '50px', fontWeight: 700 }}>Contact Submissions</span>
            </div>
          </div>
        )}

        {/* ── TABS NAVIGATION ── */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px',
          gap: '8px'
        }}>
          {[
            ['bookings', '📅 Bookings Management'],
            ['enquiries', '💬 Contact Enquiries'],
            ['fleet', '🚘 Fleet Reference']
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '12px 20px', border: 'none', background: 'none',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                borderBottom: activeTab === id ? '3px solid #4f46e5' : '3px solid transparent',
                color: activeTab === id ? '#4f46e5' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading Spinner for Content Area */}
        {loading ? (
          <div style={{
            background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0',
            padding: '80px 24px', textAlign: 'center', color: '#94a3b8'
          }}>
            <div style={{
              width: '32px', height: '32px', border: '3px solid rgba(0,0,0,0.05)',
              borderRadius: '50%', borderTopColor: '#4f46e5', animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ fontWeight: 600, fontSize: '14px' }}>Loading list details...</p>
          </div>
        ) : (
          <div style={{ width: '100%' }}>

            {/* ── TAB 1: BOOKINGS ── */}
            {activeTab === 'bookings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Search, Filter & Actions Row */}
                <div style={{
                  display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                  background: '#fff', padding: '16px 20px', borderRadius: '16px',
                  border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  {/* Status Filters */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setBookingFilter(filter)}
                        style={{
                          padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
                          fontWeight: 700, cursor: 'pointer',
                          border: bookingFilter === filter ? 'none' : '1px solid #e2e8f0',
                          background: bookingFilter === filter ? '#4f46e5' : '#fff',
                          color: bookingFilter === filter ? '#fff' : '#64748b',
                          boxShadow: bookingFilter === filter ? '0 2px 6px rgba(79,70,229,0.2)' : 'none'
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  {/* Search input */}
                  <div style={{ flex: '1', maxWidth: '360px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search bookings (Name, ID, Phone, Route)..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                        borderRadius: '10px', fontSize: '13px', fontFamily: "'Inter', sans-serif",
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Bookings Table */}
                <div style={{
                  background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          {['Booking ID', 'Customer Details', 'Vehicle', 'Trip Details', 'Travel Time', 'Estimated Fare', 'Status Update', 'Payment', 'Actions'].map(col => (
                            <th key={col} style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={9} style={{ padding: '48px', textAlignment: 'center', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                              No bookings found matching filters.
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map(booking => {
                            // Status colors mapping
                            const statusStyles = {
                              Pending: { bg: '#fff9db', color: '#f59e0b', border: '#ffe3e3' },
                              Confirmed: { bg: '#eef2ff', color: '#4f46e5', border: '#c7d2fe' },
                              Completed: { bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0' },
                              Cancelled: { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' }
                            };

                            const currentStyle = statusStyles[booking.status] || { bg: '#f1f5f9', color: '#475569' };

                            return (
                              <tr key={booking._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                                {/* Booking ID */}
                                <td style={{ padding: '16px 20px', fontWeight: 900, color: '#4f46e5', fontSize: '14px' }}>
                                  {booking.bookingId || 'RT-XXXX'}
                                </td>

                                {/* Customer Details */}
                                <td style={{ padding: '16px 20px' }}>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{booking.customerName}</div>
                                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>📞 {booking.phone}</div>
                                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>✉️ {booking.email}</div>
                                </td>

                                {/* Vehicle */}
                                <td style={{ padding: '16px 20px' }}>
                                  {booking.vehicle ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <img
                                        src={booking.vehicle.imageUrl}
                                        alt={booking.vehicle.name}
                                        style={{ width: '48px', height: '30px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                      />
                                      <div>
                                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{booking.vehicle.name}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{booking.vehicle.category}</div>
                                      </div>
                                    </div>
                                  ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>Unspecified</span>
                                  )}
                                </td>

                                {/* Trip Details */}
                                <td style={{ padding: '16px 20px' }}>
                                  <span style={{
                                    fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px',
                                    background: booking.tripType === 'Local' ? '#eff6ff' : '#faf5ff',
                                    color: booking.tripType === 'Local' ? '#1d4ed8' : '#6b21a8',
                                    textTransform: 'uppercase', display: 'inline-block', marginBottom: '6px'
                                  }}>
                                    {booking.tripType}
                                  </span>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                    📍 {booking.pickup} → {booking.drop}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                    {booking.kms} kms {booking.tripType === 'Local' && booking.durationHours ? `· ${booking.durationHours} hrs` : ''}
                                  </div>
                                </td>

                                {/* Date/Time */}
                                <td style={{ padding: '16px 20px' }}>
                                  <div style={{ fontWeight: 700, color: '#334155', fontSize: '13px' }}>{booking.date}</div>
                                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>⏰ {booking.time}</div>
                                </td>

                                {/* Estimated Fare */}
                                <td style={{ padding: '16px 20px', fontWeight: 900, color: '#0f172a', fontSize: '15px' }}>
                                  ₹{booking.estimatedFare?.toLocaleString('en-IN')}
                                </td>

                                {/* Status Update */}
                                <td style={{ padding: '16px 20px' }}>
                                  <select
                                    value={booking.status}
                                    onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                                    style={{
                                      padding: '6px 12px', borderRadius: '8px', fontSize: '13px',
                                      fontWeight: 700, cursor: 'pointer', border: `1px solid ${currentStyle.color}`,
                                      background: currentStyle.bg, color: currentStyle.color
                                    }}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>

                                {/* Payment Toggle */}
                                <td style={{ padding: '16px 20px' }}>
                                  <select
                                    value={booking.paymentStatus}
                                    onChange={(e) => handleUpdateBookingPayment(booking._id, e.target.value)}
                                    style={{
                                      padding: '6px 10px', borderRadius: '8px', fontSize: '12px',
                                      fontWeight: 700, cursor: 'pointer',
                                      border: booking.paymentStatus === 'Paid' ? '1px solid #10b981' : '1px solid #cbd5e1',
                                      background: booking.paymentStatus === 'Paid' ? '#ecfdf5' : '#fff',
                                      color: booking.paymentStatus === 'Paid' ? '#047857' : '#475569'
                                    }}
                                  >
                                    <option value="Pending">Unpaid</option>
                                    <option value="Paid">Paid</option>
                                  </select>
                                </td>

                                {/* Actions */}
                                <td style={{ padding: '16px 20px' }}>
                                  <button
                                    onClick={() => handleDeleteBooking(booking._id, booking.bookingId)}
                                    style={{
                                      border: 'none', background: 'none', cursor: 'pointer',
                                      color: '#ef4444', fontSize: '16px', padding: '6px', borderRadius: '4px',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.background = '#fee2e2'}
                                    onMouseOut={(e) => e.target.style.background = 'none'}
                                    title="Delete booking"
                                  >
                                    🗑️
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: CONTACT ENQUIRIES ── */}
            {activeTab === 'enquiries' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Search Bar */}
                <div style={{
                  display: 'flex', flexDirection: 'row', justifyContent: 'flex-end',
                  background: '#fff', padding: '16px 20px', borderRadius: '16px',
                  border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ width: '100%', maxWidth: '360px' }}>
                    <input
                      type="text"
                      placeholder="Search enquiries (Name, Message, Email)..."
                      value={enquirySearch}
                      onChange={(e) => setEnquirySearch(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                        borderRadius: '10px', fontSize: '13px', fontFamily: "'Inter', sans-serif",
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Enquiries Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                  {filteredEnquiries.length === 0 ? (
                    <div style={{
                      gridColumn: '1 / -1', background: '#fff', borderRadius: '16px',
                      padding: '48px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0'
                    }}>
                      No contact enquiries found.
                    </div>
                  ) : (
                    filteredEnquiries.map(enquiry => (
                      <div
                        key={enquiry._id}
                        style={{
                          background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
                          padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', position: 'relative'
                        }}
                      >
                        {/* New Tag */}
                        {enquiry.status === 'New' && (
                          <span style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: '#fbbf24', color: '#78350f', fontWeight: 800,
                            fontSize: '9px', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase'
                          }}>
                            New Message
                          </span>
                        )}

                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                            {new Date(enquiry.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </p>
                          <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{enquiry.subject}</h4>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>{enquiry.name}</span>
                        </div>

                        <div style={{
                          background: '#f8fafc', borderRadius: '10px', padding: '12px 16px',
                          fontSize: '13px', color: '#475569', lineHeight: 1.6, flex: 1
                        }}>
                          {enquiry.message}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                          <div>📞 {enquiry.phone}</div>
                          <div>✉️ <a href={`mailto:${enquiry.email}`} style={{ color: '#4f46e5', textDecoration: 'none' }}>{enquiry.email}</a></div>
                        </div>

                        <div style={{
                          borderTop: '1px solid #f1f5f9', paddingTop: '14px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {enquiry.status === 'New' ? (
                              <button
                                onClick={() => handleUpdateEnquiryStatus(enquiry._id, 'Replied')}
                                style={{
                                  background: '#4f46e5', color: '#fff', border: 'none',
                                  padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
                                  fontWeight: 700, cursor: 'pointer'
                                }}
                              >
                                Mark Replied
                              </button>
                            ) : (
                              <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>
                                ✓ Replied / Handled
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteEnquiry(enquiry._id)}
                            style={{
                              background: 'none', border: '1px solid #fee2e2', color: '#ef4444',
                              padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
                              fontWeight: 700, cursor: 'pointer'
                            }}
                            onMouseOver={(e) => { e.target.style.background = '#ef4444'; e.target.style.color = '#fff'; }}
                            onMouseOut={(e) => { e.target.style.background = 'none'; e.target.style.color = '#ef4444'; }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 3: FLEET REFERENCE ── */}
            {activeTab === 'fleet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{
                  background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          {['Vehicle Image', 'Name', 'Category', 'Capacity', 'Local 4hr/40km', 'Local 8hr/80km', 'Outstation Rate', 'Extra HR/KM'].map(col => (
                            <th key={col} style={{ padding: '16px 20px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map(vehicle => (
                          <tr key={vehicle._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 20px' }}>
                              <img src={vehicle.imageUrl} alt={vehicle.name} style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                              {vehicle.name}
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                              <span style={{
                                padding: '3px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#334155', fontSize: '11px', fontWeight: 700
                              }}>{vehicle.category}</span>
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                              👤 {vehicle.capacity} Seats
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                              ₹{vehicle.pricing?.hrs4_kms40?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                              ₹{vehicle.pricing?.hrs8_kms80?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '16px 20px', fontWeight: 700, color: '#4f46e5', fontSize: '14px' }}>
                              ₹{vehicle.pricing?.outstationRate}/km
                            </td>
                            <td style={{ padding: '16px 20px', fontSize: '12px', color: '#64748b' }}>
                              ₹{vehicle.pricing?.extraHr}/hr · ₹{vehicle.pricing?.extraKm}/km
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
