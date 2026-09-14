"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../src/services/api';

// ── Fare Calculator ──────────────────────────────────────────────────────────
function calculateFare(vehicle, tripType, kms, durationHours) {
  if (!vehicle?.pricing) return 0;
  const p = vehicle.pricing;

  if (tripType === 'Local') {
    const useLarge = durationHours > 4;
    const base = useLarge ? p.hrs8_kms80 : p.hrs4_kms40;
    const baseKms = useLarge ? 80 : 40;
    const baseHrs = useLarge ? 8 : 4;
    const extraHr = durationHours > baseHrs ? (durationHours - baseHrs) * p.extraHr : 0;
    const extraKm = kms > baseKms ? (kms - baseKms) * p.extraKm : 0;
    return base + extraHr + extraKm;
  }
  if (tripType === 'Outstation') {
    const billable = Math.max(kms, p.minKmsDay || 300);
    return billable * p.outstationRate;
  }
  return 0;
}

// ── Style object ─────────────────────────────────────────────────────────────
const inp = {
  width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px',
  padding: '12px 16px', fontSize: '14px', outline: 'none',
  fontFamily: "'Inter', sans-serif", color: '#0f172a', background: '#fff',
  boxSizing: 'border-box'
};
const lbl = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px'
};

// ── Main Booking Form ─────────────────────────────────────────────────────────
function BookingForm() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('vehicle') || '';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    customerName: '', email: '', phone: '',
    pickup: '', drop: '', date: '', time: '',
    tripType: 'Local', vehicle: preselectedId, kms: 40, durationHours: 4,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/vehicles');
        if (res.data?.success) {
          setVehicles(res.data.data);
          if (!preselectedId && res.data.data.length > 0) {
            setForm(f => ({ ...f, vehicle: res.data.data[0]._id }));
          }
        }
      } catch (e) {
        setError('Could not load vehicles. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    })();
  }, [preselectedId]);

  const selectedVehicle = vehicles.find(v => v._id === form.vehicle);
  const estimatedFare = calculateFare(selectedVehicle, form.tripType, Number(form.kms), Number(form.durationHours));

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const payload = {
        customerName: form.customerName, email: form.email, phone: form.phone,
        pickup: form.pickup, drop: form.drop, date: form.date, time: form.time,
        tripType: form.tripType, vehicle: form.vehicle,
        kms: Number(form.kms), estimatedFare,
        ...(form.tripType === 'Local' ? { durationHours: Number(form.durationHours) } : {})
      };
      const res = await api.post('/bookings', payload);
      if (res.data?.success) {
        setSuccess(res.data.data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else setError(res.data?.message || 'Booking failed. Please try again.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (success) return (
    <div style={{
      width: '100%', minHeight: '60vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px', background: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center'
      }}>
        <div style={{
          width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px', margin: '0 auto 24px'
        }}>✅</div>
        <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Booking Confirmed!</h2>
        <p style={{ color: '#64748b', marginBottom: '28px', lineHeight: 1.6 }}>
          Your ride has been booked successfully. Our team will contact you shortly.
        </p>
        <div style={{ background: '#eef2ff', borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
          {[
            ['Booking ID', success.bookingId, '#4f46e5', '18px'],
            ['Name', success.customerName, '#0f172a', '14px'],
            ['Pickup', success.pickup, '#0f172a', '14px'],
            ['Drop', success.drop, '#0f172a', '14px'],
            ['Date & Time', `${success.date} at ${success.time}`, '#0f172a', '14px'],
            ['Trip Type', success.tripType, '#0f172a', '14px'],
          ].map(([label, val, color, size]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>{label}</span>
              <span style={{ fontWeight: 900, color, fontSize: size }}>{val}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #c7d2fe', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '13px' }}>Estimated Fare <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>(+ 5% GST)</span></span>
            <span style={{ fontWeight: 900, color: '#16a34a', fontSize: '18px' }}>₹{success.estimatedFare?.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Save your Booking ID for tracking. Our driver will contact you before departure.</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setSuccess(null); setForm({ customerName:'', email:'', phone:'', pickup:'', drop:'', date:'', time:'', tripType:'Local', vehicle: vehicles[0]?._id||'', kms:40, durationHours:4 }); }}
            style={{ flex: 1, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 700, padding: '14px', borderRadius: '14px', cursor: 'pointer', fontSize: '14px' }}
          >Book Another</button>
          <Link href="/" style={{ flex: 1, background: '#4f46e5', color: '#fff', fontWeight: 800, padding: '14px', borderRadius: '14px', textDecoration: 'none', textAlign: 'center', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Booking Form ──────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
      {/* Page Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)', color: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ color: '#a5b4fc', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Reserve Your Ride</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, marginBottom: '12px' }}>Book a Cab</h1>
          <p style={{ color: '#c7d2fe', fontSize: '16px', maxWidth: '440px', lineHeight: 1.7 }}>
            Fill in your travel details and get an instant fare estimate before confirming.
          </p>
        </div>
      </div>

      <div className="book-page-body" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 60px' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', fontWeight: 700, fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>Loading vehicles…</div>
        ) : (
          <div className="book-grid">

            {/* ── Form Column ── */}
            <form onSubmit={handleSubmit} style={{
              background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '32px',
              display: 'flex', flexDirection: 'column', gap: '24px'
            }}>

              {/* Personal Details */}
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Personal Details</h2>
                <div className="book-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={lbl}>Full Name *</label>
                    <input style={inp} type="text" name="customerName" value={form.customerName} onChange={handleChange} required placeholder="Rahul Sharma" />
                  </div>
                  <div>
                    <label style={lbl}>Phone *</label>
                    <input style={inp} type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+91 99999 99999" />
                  </div>
                  <div className="book-full-span" style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Email *</label>
                    <input style={inp} type="email" name="email" value={form.email} onChange={handleChange} required placeholder="rahul@email.com" />
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Trip Details</h2>
                <div className="book-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={lbl}>Pickup Location *</label>
                    <input style={inp} type="text" name="pickup" value={form.pickup} onChange={handleChange} required placeholder="Chennai Airport (MAA)" />
                  </div>
                  <div>
                    <label style={lbl}>Drop Location *</label>
                    <input style={inp} type="text" name="drop" value={form.drop} onChange={handleChange} required placeholder="OMR, Chennai" />
                  </div>
                  <div>
                    <label style={lbl}>Travel Date *</label>
                    <input style={inp} type="date" name="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label style={lbl}>Pickup Time *</label>
                    <input style={inp} type="time" name="time" value={form.time} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              {/* Trip Type */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Trip Type</h2>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  {['Local', 'Outstation'].map(type => (
                    <button type="button" key={type}
                      onClick={() => setForm(f => ({ ...f, tripType: type, kms: type === 'Local' ? 40 : 300, durationHours: 4 }))}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
                        border: form.tripType === type ? 'none' : '1px solid #e2e8f0',
                        background: form.tripType === type ? '#4f46e5' : '#fff',
                        color: form.tripType === type ? '#fff' : '#475569',
                        boxShadow: form.tripType === type ? '0 2px 12px rgba(79,70,229,0.3)' : 'none'
                      }}>
                      {type === 'Local' ? '🏙️ Local' : '🛣️ Outstation'}
                    </button>
                  ))}
                </div>

                {form.tripType === 'Local' && (
                  <div className="book-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={lbl}>Duration (hours)</label>
                      <select style={inp} name="durationHours" value={form.durationHours} onChange={handleChange}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => <option key={h} value={h}>{h} hr{h>1?'s':''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Estimated Kms</label>
                      <input style={inp} type="number" name="kms" value={form.kms} onChange={handleChange} min={1} max={500} />
                    </div>
                  </div>
                )}
                {form.tripType === 'Outstation' && (
                  <div>
                    <label style={lbl}>Total Distance (kms)</label>
                    <input style={inp} type="number" name="kms" value={form.kms} onChange={handleChange} min={1} placeholder="300" />
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Minimum 300 km/day is billed for outstation trips.</p>
                  </div>
                )}
              </div>

              {/* Vehicle Selection */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Select Vehicle</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '288px', overflowY: 'auto', paddingRight: '4px' }}>
                  {vehicles.map(vehicle => (
                    <label key={vehicle._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                        borderRadius: '14px', cursor: 'pointer',
                        border: form.vehicle === vehicle._id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        background: form.vehicle === vehicle._id ? '#eef2ff' : '#fff',
                        boxSizing: 'border-box'
                      }}>
                      <input type="radio" name="vehicle" value={vehicle._id}
                        checked={form.vehicle === vehicle._id} onChange={handleChange}
                        style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }} />
                      <img src={vehicle.imageUrl} alt={vehicle.name} style={{ width: '60px', height: '38px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vehicle.name}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{vehicle.category} · {vehicle.capacity} Seats</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>from</p>
                        <p style={{ fontSize: '15px', fontWeight: 900, color: '#4f46e5', margin: 0 }}>₹{vehicle.pricing?.hrs4_kms40}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={submitting} style={{
                width: '100%', background: submitting ? '#a5b4fc' : '#4f46e5', color: '#fff',
                fontWeight: 900, fontSize: '17px', padding: '18px', borderRadius: '14px',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(79,70,229,0.3)', transition: 'all 0.15s'
              }}>
                {submitting ? '⏳ Confirming Booking…' : 'Confirm Booking →'}
              </button>
            </form>

            {/* ── Fare Summary Column ── */}
            <div className="fare-summary-col" style={{ position: 'sticky', top: '88px' }}>
              <div style={{
                background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)', padding: '24px'
              }}>
                <h3 style={{ fontWeight: 900, color: '#0f172a', marginBottom: '20px', fontSize: '16px' }}>Fare Summary</h3>
                {selectedVehicle ? (
                  <>
                    <img src={selectedVehicle.imageUrl} alt={selectedVehicle.name}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '14px', marginBottom: '14px' }} />
                    <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '15px', margin: '0 0 2px' }}>{selectedVehicle.name}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>{selectedVehicle.category} · {selectedVehicle.capacity} Seats</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Trip Type</span><span style={{ fontWeight: 700, color: '#0f172a' }}>{form.tripType}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Distance</span><span style={{ fontWeight: 700, color: '#0f172a' }}>{form.kms} km</span>
                      </div>
                      {form.tripType === 'Local' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                          <span>Duration</span><span style={{ fontWeight: 700, color: '#0f172a' }}>{form.durationHours} hrs</span>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Estimated Fare</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '40px', fontWeight: 900, color: '#4f46e5' }}>
                          ₹{estimatedFare.toLocaleString('en-IN')}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>(+ 5% GST)</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>* Inclusive of driver allowance & fuel</p>
                    </div>

                    <div style={{ marginTop: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                      <strong>Note:</strong> Tolls, permit, and parking will be charged extra. Final fare may vary slightly based on actual distance and waiting time.
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>Select a vehicle to see fare estimate</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
        Loading booking form…
      </div>
    }>
      <BookingForm />
    </Suspense>
  );
}
