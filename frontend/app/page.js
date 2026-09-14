"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../src/services/api';

const catBadge = {
  Sedan: { bg: '#eff6ff', color: '#1447e6', border: '#bedbff' },
  MPV: { bg: '#ecfdf5', color: '#007956', border: '#a4f4cf' },
  Premium: { bg: '#fffbeb', color: '#b75000', border: '#fee685' },
  Luxury: { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  'Tempo Traveller': { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  Urbania: { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredService, setHoveredService] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [vr, tr] = await Promise.all([api.get('/vehicles'), api.get('/tariffs')]);
        if (vr.data?.success) setVehicles(vr.data.data.slice(0, 4));
        if (tr.data?.success) setTariffs(tr.data.data.slice(0, 3));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        color: '#fff', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(139,92,246,0.15)', filter: 'blur(50px)'
        }} />
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '80px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px', alignItems: 'center', position: 'relative'
        }}>
          <div>
            <span style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', color: '#c7d2fe',
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', padding: '6px 16px', borderRadius: '20px', marginBottom: '20px'
            }}>
              Premium Travel in Chennai
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px' }}>
              Ride in Comfort.<br />
              <span style={{ color: '#a5b4fc' }}>Arrive in Style.</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#c7d2fe', marginBottom: '36px', maxWidth: '440px', lineHeight: 1.7 }}>
              From quick local trips to multi-day outstation journeys — premium fleet at transparent, affordable rates.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link href="/book" style={{
                background: '#fff', color: '#4f46e5', fontWeight: 800, fontSize: '15px',
                padding: '14px 32px', borderRadius: '50px', textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)', transition: 'all 0.2s',
                display: 'inline-block'
              }}>Book a Ride →</Link>
              <Link href="/fleet" style={{
                border: '2px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 700,
                fontSize: '15px', padding: '14px 32px', borderRadius: '50px',
                textDecoration: 'none', display: 'inline-block', transition: 'all 0.2s'
              }}>View Fleet</Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Vehicles Available', value: '10+' },
              { label: 'Vehicle Categories', value: '6' },
              { label: 'Trip Types Covered', value: '3' },
              { label: 'Years of Service', value: '8+' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '16px', padding: '24px', textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#a5b4fc' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE HIGHLIGHTS ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              {
                title: 'Local Rides',
                desc: 'Book 4hr/40km or 8hr/80km packages for city travel. Extra hour and km charges at transparent rates.',
                bgImage: 'https://media.istockphoto.com/id/170069081/photo/opening-car-door.jpg?s=612x612&w=0&k=20&c=5YP5K6R4mFtyormHUx31tx0ON3LFBORaqX1h9_eM_po=',
                link: '/tariff',
                cta: 'View Local Tariffs',
                themeColor: '#4f46e5'
              },
              {
                title: 'Outstation Tours',
                desc: 'Travel beyond city limits with per-km pricing. Minimum 300km per day. Driver allowance included.',
                bgImage: 'https://images.pexels.com/photos/33576905/pexels-photo-33576905.jpeg',
                link: '/tariff',
                cta: 'View Outstation Rates',
                themeColor: '#10b981'
              },
              {
                title: 'Wedding & Events',
                desc: 'Luxury fleet for weddings, corporate events, and airport transfers. Book multiple vehicles easily.',
                bgImage: 'https://www.flowernpetals.com/wp-content/uploads/2025/04/1739279137870.webp',
                link: '/book',
                cta: 'Inquire for Event',
                themeColor: '#f43f5e'
              },
            ].map((s, index) => {
              const isHovered = hoveredService === index;
              return (
                <Link
                  href={s.link}
                  key={s.title}
                  onMouseEnter={() => setHoveredService(index)}
                  onMouseLeave={() => setHoveredService(null)}
                  style={{
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    background: '#fff',
                    boxShadow: isHovered
                      ? '0 20px 30px rgba(0, 0, 0, 0.08), 0 0 15px rgba(0, 0, 0, 0.02)'
                      : '0 4px 16px rgba(0, 0, 0, 0.04)',
                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {/* Top Image Part (No black shade/overlay) */}
                  <div style={{
                    height: '220px',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={s.bgImage}
                      alt={s.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.5s ease'
                      }}
                    />

                  </div>

                  {/* Bottom Content Part */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: '10px',
                    }}>{s.title}</h3>

                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      lineHeight: 1.6,
                      marginBottom: '24px',
                      flex: 1
                    }}>{s.desc}</p>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: s.themeColor,
                      fontSize: '14px',
                      fontWeight: 700,
                      transition: 'gap 0.2s ease'
                    }}>
                      <span>{s.cta}</span>
                      <span style={{
                        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                        transition: 'transform 0.2s ease'
                      }}>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED FLEET ── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Our Vehicles</p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0f172a' }}>Featured Fleet</h2>
            </div>
            <Link href="/fleet" style={{ color: '#4f46e5', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>View All Vehicles →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {[1, 2, 3, 4].map(i => <div key={i} style={{ background: '#f1f5f9', borderRadius: '20px', height: '280px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {vehicles.map(v => {
                const badge = catBadge[v.category] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
                return (
                  <div key={v._id} style={{
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px',
                    overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.2s, transform 0.2s'
                  }}>
                    <div style={{ height: '176px', overflow: 'hidden', background: '#f1f5f9' }}>
                      <img src={v.imageUrl} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '18px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                        background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                      }}>{v.category}</span>
                      <h3 style={{ fontWeight: 800, color: '#0f172a', margin: '8px 0 2px', fontSize: '16px' }}>{v.name}</h3>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>{v.capacity} Seats</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#4f46e5', fontWeight: 800, fontSize: '14px' }}>₹{v.pricing?.hrs4_kms40}/4hr</span>
                        <Link href="/book" style={{
                          fontSize: '12px', background: '#4f46e5', color: '#fff',
                          padding: '6px 14px', borderRadius: '20px', textDecoration: 'none', fontWeight: 700
                        }}>Book</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── TARIFF PREVIEW ── */}
      <section style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Transparent Pricing</p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0f172a' }}>Tariff Packages</h2>
            </div>
            <Link href="/tariff" style={{ color: '#4f46e5', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Full Price Sheet →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[1, 2, 3].map(i => <div key={i} style={{ background: '#e2e8f0', borderRadius: '20px', height: '220px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {tariffs.map((t, idx) => (
                <div key={t._id} style={{
                  borderRadius: '20px', padding: '28px',
                  background: idx === 1 ? '#4f46e5' : '#fff',
                  color: idx === 1 ? '#fff' : '#0f172a',
                  border: idx === 1 ? 'none' : '1px solid #e2e8f0',
                  boxShadow: idx === 1 ? '0 12px 40px rgba(79,70,229,0.3)' : '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>{t.category}</h3>
                  <p style={{ fontSize: '12px', marginBottom: '16px', opacity: 0.7 }}>{t.capacity}</p>
                  <div style={{ fontSize: '40px', fontWeight: 900, marginBottom: '4px', color: idx === 1 ? '#fff' : '#4f46e5' }}>
                    ₹{t.pricing.local40km}
                  </div>
                  <p style={{ fontSize: '12px', marginBottom: '20px', opacity: 0.65 }}>4 hrs / 40 kms</p>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: idx === 1 ? 0.85 : 0.75 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>8hr/80km</span><span style={{ fontWeight: 700 }}>₹{t.pricing.local80km}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Extra Hour</span><span style={{ fontWeight: 700 }}>₹{t.pricing.extraHour}/hr</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Outstation</span><span style={{ fontWeight: 700 }}>₹{t.pricing.outstationRate}/km</span>
                    </div>
                  </div>
                  <Link href="/book" style={{
                    display: 'block', textAlign: 'center', marginTop: '20px',
                    padding: '12px', borderRadius: '14px', fontWeight: 800, fontSize: '14px', textDecoration: 'none',
                    background: idx === 1 ? '#fff' : '#4f46e5',
                    color: idx === 1 ? '#4f46e5' : '#fff',
                  }}>Book This Class</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Simple Process</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0f172a', marginBottom: '56px' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px' }}>
            {[
              { step: '01', icon: '🚗', title: 'Choose Vehicle', desc: 'Browse Sedan, MPV, Premium, Luxury, or Traveller options.' },
              { step: '02', icon: '📍', title: 'Enter Details', desc: 'Set your pickup, drop, date, time, and trip type.' },
              { step: '03', icon: '💰', title: 'Instant Fare', desc: 'Our calculator estimates your fare in real time.' },
              { step: '04', icon: '✅', title: 'Confirm Booking', desc: 'Submit and receive a unique Rider Tours booking ID.' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', background: '#eef2ff', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', margin: '0 auto 14px'
                }}>{item.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#c7d2fe', letterSpacing: '2px', marginBottom: '6px' }}>{item.step}</div>
                <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', fontSize: '15px' }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
        color: '#fff', padding: '80px 24px', textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, marginBottom: '16px' }}>Ready to Book Your Ride?</h2>
          <p style={{ color: '#a5b4fc', marginBottom: '32px', fontSize: '17px' }}>Premium rides start from just ₹1,600. Book now and travel in comfort.</p>
          <Link href="/book" style={{
            display: 'inline-block', background: '#fff', color: '#4f46e5',
            fontWeight: 900, padding: '18px 48px', borderRadius: '50px',
            textDecoration: 'none', fontSize: '17px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
          }}>Book Now →</Link>
        </div>
      </section>
    </div>
  );
}
