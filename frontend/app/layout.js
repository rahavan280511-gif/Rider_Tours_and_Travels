import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar";
import Image from "next/image";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Rider Tours — Premium Travel Services in Chennai",
  description: "Rider Tours offers premium cab and tempo traveller services in Chennai. Book Sedan, MPV, Luxury, and Urbania vehicles for local, outstation, and wedding travel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", background: '#fff', color: '#0f172a' }}>

        {/* ── Sticky Navigation (Client Component for hamburger) ── */}
        <NavBar />

        {/* ── Page Content ── */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* ── Footer ── */}
        <footer id="main-footer" style={{ background: '#0f172a', color: '#94a3b8' }}>
          <div className="footer-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '56px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Image
                    src="/logo.png"
                    alt="Rider Tours Logo"
                    width={48}
                    height={48}
                    style={{ objectFit: 'contain', filter: 'invert(1) brightness(2)' }}
                  />
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>Rider Tours</span>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.7 }}>
                  Premium travel services in Chennai — local rides, outstation tours, corporate trips, and wedding transportation.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Quick Links</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  {[['/', 'Home'], ['/fleet', 'Our Fleet'], ['/tariff', 'Tariff Rates'], ['/book', 'Book a Cab']].map(([href, label]) => (
                    <li key={href}><a href={href} style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>{label}</a></li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Contact Us</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                  <li>📞 +91 98415 80722</li>
                  <li>📧 ridertoursandtravels29@gmail.com</li>
                  <li>📍 Chennai, Tamil Nadu</li>
                </ul>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#475569' }}>
              <span>© {new Date().getFullYear()} Rider Tours. All rights reserved.</span>
              <a href="/admin/login" style={{
                color: '#475569', textDecoration: 'none', fontSize: '12px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '6px',
                border: '1px solid #1e293b', padding: '6px 14px', borderRadius: '6px',
              }}>🔑 Owner Login</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
