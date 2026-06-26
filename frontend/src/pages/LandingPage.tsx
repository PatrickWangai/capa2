import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Globe, BarChart2, ArrowRight, Zap } from 'lucide-react';
import CapaIcon from '../components/ui/CapaIcon';

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

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#152921', minHeight: '100vh', color: 'white' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #2a4a3c' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CapaIcon className="h-9 w-9" />
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>CAPA</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/login" style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #2a4a3c', color: '#d1d5db', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Log in
            </Link>
            <Link to="/register" style={{ padding: '8px 18px', borderRadius: 8, background: 'linear-gradient(135deg,#a855f7,#ec4899)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, border: '1px solid #2a4a3c', marginBottom: 32, fontSize: 13, color: '#a78bfa' }}>
          <TrendingUp size={14} />
          Invest Globally. Grow Confidently.
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 24 }}>
          Your money should{' '}
          <span style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            work everywhere
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#9ca3af', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          CAPA gives you one platform to invest in global stocks, ETFs, and crypto — with real-time data, a clean portfolio dashboard, and instant execution.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#a855f7,#ec4899)', color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>
            Start investing free <ArrowRight size={16} />
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 10, border: '1px solid #2a4a3c', color: '#d1d5db', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: '1px solid #2a4a3c', borderBottom: '1px solid #2a4a3c', backgroundColor: '#1a3028' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '96px 24px' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: 'center', marginBottom: 16, letterSpacing: '-0.5px' }}>Everything you need to invest</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 56, fontSize: 16 }}>One platform. All markets. Zero friction.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ backgroundColor: '#1a3028', border: '1px solid #2a4a3c', borderRadius: 16, padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(236,72,153,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ borderRadius: 20, padding: '56px 40px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}>
          <CapaIcon className="h-14 w-14" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.5px' }}>Ready to start?</h2>
          <p style={{ color: '#9ca3af', marginBottom: 32, fontSize: 16 }}>Create your free account in under 2 minutes.</p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 10, background: 'linear-gradient(135deg,#a855f7,#ec4899)', color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 700 }}>
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #2a4a3c', padding: '24px', textAlign: 'center', color: '#4b5563', fontSize: 13 }}>
        © {new Date().getFullYear()} CAPA. All rights reserved.
      </footer>
    </div>
  );
}
