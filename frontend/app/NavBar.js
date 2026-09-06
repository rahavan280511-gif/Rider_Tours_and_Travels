"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const linkStyle = {
    color: '#475569', fontWeight: 600, fontSize: '14px', textDecoration: 'none'
  };

  return (
    <header id="main-header" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.97)',
      borderBottom: '1px solid #e2e8f0',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link href="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <Image
              src="/logo.png"
              alt="Rider Tours Logo"
              width={44}
              height={44}
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <span style={{ fontSize: '19px', fontWeight: 900, color: '#1e3a6e', letterSpacing: '-0.3px', lineHeight: 1.1 }}>Rider Tours</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-desktop" style={{ alignItems: 'center', gap: '24px' }}>
          <Link href="/" style={linkStyle}>Home</Link>
          <Link href="/fleet" style={linkStyle}>Fleet</Link>
          <Link href="/tariff" style={linkStyle}>Tariff</Link>
          <Link href="/book" style={{
            background: '#4f46e5', color: '#fff', fontWeight: 700, fontSize: '14px',
            padding: '10px 24px', borderRadius: '50px', textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(79,70,229,0.35)'
          }}>Book Now</Link>
          <Link href="/admin/login" title="Owner Login" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#64748b', fontWeight: 600, fontSize: '13px',
            textDecoration: 'none', border: '1px solid #e2e8f0',
            padding: '8px 14px', borderRadius: '8px', background: '#f8fafc'
          }}>🔑 Owner</Link>
        </nav>

        {/* Hamburger Button — mobile only */}
        <button
          className="nav-mobile-btn"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle navigation menu"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: '5px',
            padding: '8px', borderRadius: '8px',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          {/* Animated hamburger bars */}
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: '#0f172a', borderRadius: '2px',
            transition: 'all 0.25s ease',
            transform: open ? 'translateY(7px) rotate(45deg)' : 'none'
          }} />
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: '#0f172a', borderRadius: '2px',
            transition: 'all 0.25s ease',
            opacity: open ? 0 : 1
          }} />
          <span style={{
            display: 'block', width: '22px', height: '2px',
            background: '#0f172a', borderRadius: '2px',
            transition: 'all 0.25s ease',
            transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none'
          }} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <nav className={`nav-mobile-menu${open ? ' open' : ''}`}>
        <Link href="/" onClick={close} style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none', fontSize: '16px', padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'block' }}>🏠 Home</Link>
        <Link href="/fleet" onClick={close} style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none', fontSize: '16px', padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'block' }}>🚘 Our Fleet</Link>
        <Link href="/tariff" onClick={close} style={{ color: '#0f172a', fontWeight: 700, textDecoration: 'none', fontSize: '16px', padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'block' }}>💰 Tariff Rates</Link>
        <Link href="/book" onClick={close} style={{
          background: '#4f46e5', color: '#fff', fontWeight: 800, textDecoration: 'none',
          fontSize: '16px', padding: '14px 24px', borderRadius: '12px',
          display: 'block', textAlign: 'center', marginTop: '4px',
          boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
        }}>Book Now →</Link>
        <Link href="/admin/login" onClick={close} style={{
          color: '#64748b', fontWeight: 600, textDecoration: 'none',
          fontSize: '14px', padding: '10px 0', display: 'block', textAlign: 'center'
        }}>🔑 Owner Login</Link>
      </nav>
    </header>
  );
}
