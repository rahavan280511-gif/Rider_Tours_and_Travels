"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../src/services/api';

const categoryStyles = {
  Sedan:             { header: '#1d4ed8', light: '#eff6ff', text: '#1447e6', border: '#bedbff' },
  MPV:               { header: '#059669', light: '#ecfdf5', text: '#007956', border: '#a4f4cf' },
  Premium:           { header: '#d97706', light: '#fffbeb', text: '#b75000', border: '#fee685' },
  Luxury:            { header: '#7c3aed', light: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
  'Tempo Traveller': { header: '#ea580c', light: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  Urbania:           { header: '#e11d48', light: '#fff1f2', text: '#be123c', border: '#fecdd3' },
};

const DEFAULT = { header: '#475569', light: '#f8fafc', text: '#475569', border: '#e2e8f0' };

export default function TariffPage() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/tariffs');
        if (res.data?.success) setTariffs(res.data.data);
        else setError('Failed to load tariff data.');
      } catch (err) {
        setError('Error connecting to server: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', sans-serif", background: '#fff' }}>

      {/* Page Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #1e293b 100%)',
        color: '#fff', padding: '72px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: '#a5b4fc', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Pricing</p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, marginBottom: '14px' }}>Tariff Rates</h1>
          <p style={{ color: '#94a3b8', fontSize: '17px', maxWidth: '480px', lineHeight: 1.7 }}>
            Transparent, category-based pricing. No hidden charges — just fair, premium rates for every trip.
          </p>
        </div>
      </div>

      {/* Note Banner */}
      <div style={{ background: '#eef2ff', borderBottom: '1px solid #c7d2fe' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '14px 24px',
          display: 'flex', flexWrap: 'wrap', gap: '24px',
          fontSize: '13px', color: '#4338ca', fontWeight: 600
        }}>
          <span>📍 All local packages include driver charge</span>
          <span>🛣️ Outstation: Min. 300 km/day billed</span>
          <span>⛽ Fuel charges included in all rates</span>
          <span>💍 Wedding packages available on request</span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: '20px', height: '320px', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '16px', padding: '24px', textAlign: 'center', fontWeight: 700 }}>
            {error}
          </div>
        )}

        {/* Tariff Cards Grid */}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {tariffs.map(tariff => {
              const c = categoryStyles[tariff.category] || DEFAULT;
              return (
                <div key={tariff._id} style={{
                  border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column'
                }}>
                  {/* Card Header */}
                  <div style={{ background: c.header, color: '#fff', padding: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px' }}>{tariff.category}</h2>
                    <p style={{ fontSize: '13px', opacity: 0.75, marginBottom: '16px' }}>Capacity: {tariff.capacity}</p>
                    <div style={{ fontSize: '40px', fontWeight: 900 }}>₹{tariff.pricing.local40km}</div>
                    <p style={{ fontSize: '12px', opacity: 0.65, marginTop: '4px' }}>for 4 hrs / 40 kms</p>
                  </div>

                  {/* Card Body */}
                  <div style={{ background: '#fff', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    {/* Vehicles list */}
                    {tariff.vehicles?.length > 0 && (
                      <div style={{
                        background: c.light, borderRadius: '12px', padding: '12px',
                        marginBottom: '20px', border: `1px solid ${c.border}`
                      }}>
                        <p style={{ fontSize: '11px', fontWeight: 800, color: c.text, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Available Vehicles</p>
                        <p style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>{tariff.vehicles.join(' • ')}</p>
                      </div>
                    )}

                    {/* Pricing rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', flex: 1 }}>
                      {[
                        ['Local 8hr / 80km', `₹${tariff.pricing.local80km}`, false],
                        ['Extra Hour', `₹${tariff.pricing.extraHour}/hr`, false],
                        ['Extra Km', `₹${tariff.pricing.extraKm}/km`, false],
                        ['Outstation Rate', `₹${tariff.pricing.outstationRate}/km`, true],
                        ['Min Kms per Day', `${tariff.minKmsPerDay} km`, false],
                        ['Min Day Rate', `₹${tariff.pricing.minimumDayRate}`, false],
                        ['Discount Rate', `₹${tariff.pricing.discountPrice}`, false, '#16a34a'],
                        ['Wedding Charge', `₹${tariff.weddingCharge}`, true],
                      ].map(([label, val, highlight, forceColor]) => (
                        <div key={label} style={{
                          display: 'flex', justifyContent: 'space-between',
                          paddingBottom: '8px', borderBottom: '1px dashed #f1f5f9',
                          color: '#64748b'
                        }}>
                          <span>{label}</span>
                          <span style={{ fontWeight: 800, color: forceColor || (highlight ? c.header : '#0f172a') }}>{val}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/book" style={{
                      display: 'block', textAlign: 'center', marginTop: '20px',
                      background: c.header, color: '#fff', fontWeight: 800, fontSize: '14px',
                      padding: '14px', borderRadius: '14px', textDecoration: 'none'
                    }}>
                      Book {tariff.category}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: '64px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          borderRadius: '24px', padding: '48px 32px', textAlign: 'center', color: '#fff'
        }}>
          <h3 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '12px' }}>Need a Custom Quote?</h3>
          <p style={{ color: '#c7d2fe', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px', lineHeight: 1.7 }}>
            For multi-day tours, corporate contracts, or wedding arrangements, contact us directly for the best rates.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/book" style={{
              background: '#fff', color: '#4f46e5', fontWeight: 800, padding: '14px 32px',
              borderRadius: '50px', textDecoration: 'none', fontSize: '15px'
            }}>Book Online →</Link>
            <a href="tel:+919841580722" style={{
              border: '2px solid rgba(255,255,255,0.4)', color: '#fff', fontWeight: 800,
              padding: '14px 32px', borderRadius: '50px', textDecoration: 'none', fontSize: '15px'
            }}>Call +91 98415 80722</a>
          </div>
        </div>
      </div>
    </div>
  );
}
