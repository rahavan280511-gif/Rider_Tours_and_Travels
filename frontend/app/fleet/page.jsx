"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../src/services/api';

const categoryBadge = {
  Sedan:           { bg: '#eff6ff', color: '#1447e6', border: '#bedbff' },
  MPV:             { bg: '#ecfdf5', color: '#007956', border: '#a4f4cf' },
  Premium:         { bg: '#fffbeb', color: '#b75000', border: '#fee685' },
  Luxury:          { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  'Tempo Traveller': { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  Urbania:         { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

const categoryHeader = {
  Sedan:           '#1d4ed8',
  MPV:             '#059669',
  Premium:         '#d97706',
  Luxury:          '#7c3aed',
  'Tempo Traveller': '#ea580c',
  Urbania:         '#e11d48',
};

const s = {
  page: { width: '100%', fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' },
  hero: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)',
    color: '#fff', padding: '72px 24px'
  },
  heroInner: { maxWidth: '1200px', margin: '0 auto' },
  heroSub: { color: '#a5b4fc', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' },
  heroH1: { fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, marginBottom: '14px' },
  heroP: { color: '#c7d2fe', fontSize: '17px', maxWidth: '480px', lineHeight: 1.7 },
  body: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 60px' },
  filterRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' },
  filterBtn: (active) => ({
    padding: '8px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: 700,
    border: active ? 'none' : '1px solid #e2e8f0',
    background: active ? '#4f46e5' : '#fff',
    color: active ? '#fff' : '#475569',
    cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: active ? '0 2px 10px rgba(79,70,229,0.3)' : 'none'
  }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  card: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px',
    overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    display: 'flex', flexDirection: 'column'
  },
  imgWrap: { height: '200px', overflow: 'hidden', position: 'relative', background: '#e2e8f0' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' },
  vehicleName: { fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: '8px 0 4px' },
  vehicleSub: { fontSize: '13px', color: '#94a3b8', marginBottom: '14px' },
  featureTags: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' },
  featureTag: { fontSize: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '3px 8px', borderRadius: '20px' },
  priceTable: { borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', color: '#64748b' },
  priceBold: { fontWeight: 800, color: '#0f172a' },
  priceHighlight: { fontWeight: 800, color: '#4f46e5' },
  bookBtn: {
    display: 'block', textAlign: 'center', marginTop: 'auto',
    background: '#4f46e5', color: '#fff', fontWeight: 800, fontSize: '14px',
    padding: '14px', borderRadius: '14px', textDecoration: 'none',
    transition: 'background 0.15s'
  },
  skeletonCard: { background: '#e2e8f0', borderRadius: '20px', height: '360px', animation: 'pulse 1.5s ease-in-out infinite' },
  error: { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '16px', padding: '24px', textAlign: 'center', fontWeight: 700 },
  countLabel: { fontSize: '13px', color: '#94a3b8', marginBottom: '20px' },
};

export default function FleetPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/vehicles');
        if (res.data?.success) setVehicles(res.data.data);
        else setError('Failed to load vehicles. Please try again.');
      } catch (err) {
        setError('Error connecting to server: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = ['All', ...Array.from(new Set(vehicles.map(v => v.category)))];
  const filtered = activeCategory === 'All' ? vehicles : vehicles.filter(v => v.category === activeCategory);

  return (
    <div style={s.page}>
      {/* Page Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.heroSub}>Our Vehicles</p>
          <h1 style={s.heroH1}>Our Fleet</h1>
          <p style={s.heroP}>Choose from Sedans, MPVs, Premium Innovas, Luxury Hycross, Tempo Travellers, or Urbania. Transparent pricing, every time.</p>
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        {/* Category Filters */}
        {!loading && !error && (
          <div style={s.filterRow}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={s.filterBtn(activeCategory === cat)}
              >{cat}</button>
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div style={s.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={s.skeletonCard} />)}
          </div>
        )}

        {/* Error */}
        {error && <div style={s.error}>{error}</div>}

        {/* Vehicle Grid */}
        {!loading && !error && (
          <>
            <p style={s.countLabel}>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found</p>
            <div style={s.grid}>
              {filtered.map(vehicle => {
                const badge = categoryBadge[vehicle.category] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
                const hdrColor = categoryHeader[vehicle.category] || '#4f46e5';
                return (
                  <div key={vehicle._id} style={s.card}>
                    {/* Image */}
                    <div style={s.imgWrap}>
                      <img src={vehicle.imageUrl} alt={vehicle.name} style={s.img} />
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                        }}>{vehicle.category}</span>
                      </div>
                      {vehicle.available && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: '#22c55e', color: '#fff' }}>Available</span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div style={s.cardBody}>
                      <h2 style={s.vehicleName}>{vehicle.name}</h2>
                      <p style={s.vehicleSub}>👥 {vehicle.capacity} Seats</p>

                      {/* Feature Tags */}
                      {vehicle.features?.length > 0 && (
                        <div style={s.featureTags}>
                          {vehicle.features.slice(0, 3).map((f, i) => (
                            <span key={i} style={s.featureTag}>{f}</span>
                          ))}
                          {vehicle.features.length > 3 && (
                            <span style={{ ...s.featureTag, color: '#94a3b8', border: 'none', background: 'none' }}>+{vehicle.features.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {/* Pricing */}
                      <div style={s.priceTable}>
                        <div style={s.priceRow}>
                          <span>Local 4hr / 40km</span>
                          <span style={s.priceBold}>₹{vehicle.pricing?.hrs4_kms40}</span>
                        </div>
                        <div style={s.priceRow}>
                          <span>Local 8hr / 80km</span>
                          <span style={s.priceBold}>₹{vehicle.pricing?.hrs8_kms80}</span>
                        </div>
                        <div style={s.priceRow}>
                          <span>Outstation Rate</span>
                          <span style={s.priceHighlight}>₹{vehicle.pricing?.outstationRate}/km</span>
                        </div>
                      </div>

                      <Link href={`/book?vehicle=${vehicle._id}`} style={s.bookBtn}>
                        Book This Vehicle
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
