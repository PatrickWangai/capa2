import { Link } from 'react-router-dom';
import OrangeIcon from '../components/ui/OrangeIcon';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = '#f5821f';
const CARD = '#1c1c1e';

const team = [
  { name: 'Patrick Wang', role: 'Founder & CEO', bio: 'Former fintech engineer. Passionate about democratising global investing for Africa.' },
  { name: 'Finance Team', role: 'Investment Operations', bio: 'Experienced professionals managing compliance, risk, and client portfolios.' },
  { name: 'Engineering Team', role: 'Product & Technology', bio: 'Building reliable, secure infrastructure for the next generation of investors.' },
];

const values = [
  { emoji: '🔒', title: 'Security First', desc: 'Bank-grade encryption, two-factor authentication, and cold storage for all assets.' },
  { emoji: '🌍', title: 'Global Access', desc: 'Invest in NYSE, NASDAQ, LSE and more — from anywhere in Africa.' },
  { emoji: '📊', title: 'Transparency', desc: 'Clear fee structures, real-time data, and no hidden charges. Ever.' },
  { emoji: '⚡', title: 'Speed', desc: 'Open an account in minutes. Trade in seconds. Withdraw in 24 hours.' },
];

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <OrangeIcon size={24} />
        <span style={{ color: TEXT, fontWeight: 600, fontSize: 15 }}>Capa</span>
      </Link>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link to="/login" style={{ color: SEC, textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
        <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, background: ACCENT, padding: '5px 14px', borderRadius: 980 }}>Get Started</Link>
      </div>
    </nav>
  );
}

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
        <div className="orange-float" style={{ display: 'inline-block', marginBottom: 24 }}>
          <OrangeIcon size={80} />
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 16px', lineHeight: 1.05 }}>
          Investing for Everyone,<br />Everywhere
        </h1>
        <p style={{ fontSize: 19, color: SEC, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
          Capa is a regulated investment platform connecting African investors to global markets — simply, securely, and affordably.
        </p>
      </section>

      {/* Mission */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '40px 36px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16 }}>Our Mission</h2>
          <p style={{ fontSize: 17, color: SEC, lineHeight: 1.7, margin: 0 }}>
            Millions of people across Africa have savings but limited access to global investment opportunities. We built Capa to change that — giving everyone access to the same stocks, ETFs, and bonds that have historically built wealth for the privileged few.
          </p>
          <p style={{ fontSize: 17, color: SEC, lineHeight: 1.7, margin: '16px 0 0' }}>
            We believe geography should never be a barrier to financial growth.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 24, textAlign: 'center' }}>What We Stand For</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {values.map(v => (
            <div key={v.title} style={{ backgroundColor: CARD, borderRadius: 18, padding: 28, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{v.emoji}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.02em' }}>{v.title}</h3>
              <p style={{ fontSize: 14, color: SEC, margin: 0, lineHeight: 1.6 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 24, textAlign: 'center' }}>The Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {team.map(m => (
            <div key={m.name} style={{ backgroundColor: CARD, borderRadius: 18, padding: 28, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #f5821f, #ff4500)', marginBottom: 16 }} />
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4, letterSpacing: '-0.02em' }}>{m.name}</h3>
              <p style={{ fontSize: 13, color: ACCENT, marginBottom: 10, fontWeight: 500 }}>{m.role}</p>
              <p style={{ fontSize: 14, color: SEC, margin: 0, lineHeight: 1.6 }}>{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px', backgroundColor: '#111111', marginTop: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>Join thousands of investors</h2>
        <p style={{ fontSize: 17, color: SEC, marginBottom: 28 }}>Open your account in minutes. No minimum deposit.</p>
        <Link to="/register" style={{ display: 'inline-block', background: ACCENT, color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 980, fontSize: 18, fontWeight: 500 }}>
          Start Investing
        </Link>
      </section>

      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, fontSize: 12, color: SEC }}>
          © 2024 Capa Investments Ltd. Regulated investment platform. Capital at risk.{' '}
          <Link to="/terms" style={{ color: SEC }}>Terms</Link> · <Link to="/privacy" style={{ color: SEC }}>Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
