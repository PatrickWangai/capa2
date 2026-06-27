import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Globe, BarChart2, ArrowRight, Zap } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Global Markets',
    desc: 'Trade stocks, ETFs, and crypto from markets across the US, Europe, and Africa.',
  },
  {
    icon: BarChart2,
    title: 'Real-Time Portfolio',
    desc: 'Watch your investments grow with live prices, P&L tracking, and performance charts.',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    desc: 'KYC-verified accounts, encrypted transactions, and institutional-grade security.',
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    desc: 'Market and limit orders executed in milliseconds. No delays, no surprises.',
  },
];

const stats = [
  { value: '50+', label: 'Global Markets' },
  { value: '$0', label: 'Commission Trades' },
  { value: '24/7', label: 'Live Support' },
  { value: '100%', label: 'Secure' },
];

function CapaLogoFull({ size = 320 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CAPA"
    >
      <defs>
        <linearGradient id="lgFull" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#7117ea" />
          <stop offset="100%" stopColor="#ea6060" />
        </linearGradient>
        <mask id="cMask">
          <rect width="400" height="400" fill="white" />
          {/* C hollow — opens right */}
          <path d="M 148 110 H 420 V 198 H 148 A 52 52 0 0 1 96 148 V 160 A 52 52 0 0 1 148 110 Z" fill="black" />
        </mask>
      </defs>
      {/* C icon */}
      <rect x="20" y="20" width="340" height="340" rx="80" ry="80"
        fill="url(#lgFull)" mask="url(#cMask)" />
    </svg>
  );
}

function CapaWordmark() {
  return (
    <svg viewBox="0 0 220 48" xmlns="http://www.w3.org/2000/svg" width="220" height="48" aria-label="CAPA">
      <defs>
        <linearGradient id="lgWord" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7117ea" />
          <stop offset="100%" stopColor="#ea6060" />
        </linearGradient>
      </defs>
      <text
        x="0" y="42"
        fontFamily="'Inter','Helvetica Neue',sans-serif"
        fontWeight="900"
        fontSize="52"
        letterSpacing="-2"
        fill="url(#lgWord)"
      >CAPA</text>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#152921', minHeight: '100vh', color: 'white' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #2a4a3c' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Nav logo — small */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="36" height="36" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lgNav" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="#7117ea" />
                  <stop offset="100%" stopColor="#ea6060" />
                </linearGradient>
                <mask id="cMaskNav">
                  <rect width="400" height="400" fill="white" />
                  <path d="M 148 110 H 420 V 198 H 148 A 52 52 0 0 1 96 148 V 160 A 52 52 0 0 1 148 110 Z" fill="black" />
                </mask>
              </defs>
              <rect x="20" y="20" width="340" height="340" rx="80" ry="80" fill="url(#lgNav)" mask="url(#cMaskNav)" />
            </svg>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-1px', background: 'linear-gradient(135deg,#7117ea,#ea6060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CAPA</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/login" style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #2a4a3c', color: '#d1d5db', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Log in
            </Link>
            <Link to="/register" style={{ padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#7117ea,#ea6060)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 72px', textAlign: 'center' }}>

        {/* Big logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <CapaLogoFull size={160} />
        </div>

        {/* Wordmark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <CapaWordmark />
        </div>

        {/* Motto */}
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 24 }}>
          Unstoppable minds
        </p>

        {/* Tagline */}
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20 }}>
          Invest Globally.{' '}
          <span style={{ background: 'linear-gradient(135deg,#7117ea,#ea6060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Grow Confidently.
          </span>
        </h1>

        <p style={{ fontSize: 17, color: '#9ca3af', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          One platform for global stocks, ETFs, and crypto — real-time data, clean portfolio dashboard, and instant execution.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#7117ea,#ea6060)', color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>
            Start investing free <ArrowRight size={16} />
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, border: '1px solid #2a4a3c', color: '#d1d5db', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
            Sign in
          </Link>
        </div>

        {/* Trend badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 28, padding: '6px 14px', borderRadius: 999, border: '1px solid #2a4a3c', fontSize: 12, color: '#a78bfa' }}>
          <TrendingUp size={13} /> Live markets · Updated in real time
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: '1px solid #2a4a3c', borderBottom: '1px solid #2a4a3c', backgroundColor: '#1a3028' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg,#7117ea,#ea6060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '88px 24px' }}>
        <h2 style={{ fontSize: 34, fontWeight: 800, textAlign: 'center', marginBottom: 12, letterSpacing: '-0.5px' }}>Everything you need to invest</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 52, fontSize: 16 }}>One platform. All markets. Zero friction.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ backgroundColor: '#1a3028', border: '1px solid #2a4a3c', borderRadius: 16, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,rgba(113,23,234,0.2),rgba(234,96,96,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color="#a78bfa" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 88px' }}>
        <div style={{ borderRadius: 20, padding: '56px 40px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(113,23,234,0.15),rgba(234,96,96,0.15))', border: '1px solid rgba(113,23,234,0.3)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#7117ea', marginBottom: 16 }}>Unstoppable minds</p>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>Ready to start?</h2>
          <p style={{ color: '#9ca3af', marginBottom: 32, fontSize: 16 }}>Create your free account in under 2 minutes.</p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 10, background: 'linear-gradient(135deg,#7117ea,#ea6060)', color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #2a4a3c', padding: '24px', textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
        © {new Date().getFullYear()} CAPA · Unstoppable minds
      </footer>
    </div>
  );
}
