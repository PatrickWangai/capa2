import { Link } from 'react-router-dom';
import CapaLogo from '../components/ui/CapaLogo';

const SEC    = 'var(--text-secondary)';
const ACCENT = 'var(--accent)';
const CARD   = '#1c1c1e';
const DIVIDER = '1px solid rgba(255,255,255,0.08)';

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <CapaLogo size={44} />
      </Link>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link to="/login"    style={{ color: SEC, textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
        <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, background: ACCENT, padding: '5px 14px', borderRadius: 980 }}>Get Started</Link>
      </div>
    </nav>
  );
}

const steps = [
  {
    n: '01',
    title: 'Create Your Account',
    body: (
      <>
        <p style={{ margin: '0 0 10px' }}>Sign up in just a few minutes.</p>
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#fff' }}>You'll need:</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
          {['Email address', 'Phone number', 'Government-issued ID or Passport', 'KRA PIN (for Kenyan residents)', 'A secure password'].map(i => <li key={i}>{i}</li>)}
        </ul>
        <p style={{ margin: '12px 0 0' }}>Complete identity verification (KYC) to unlock all platform features.</p>
      </>
    ),
  },
  {
    n: '02',
    title: 'Fund Your Account',
    body: (
      <>
        <p style={{ margin: '0 0 10px' }}>Deposit funds securely using your preferred payment method.</p>
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#fff' }}>Supported methods (coming soon):</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
          {['M-Pesa', 'Bank Transfer', 'Debit/Credit Card'].map(i => <li key={i}>{i}</li>)}
        </ul>
        <p style={{ margin: '12px 0 0' }}>Once your deposit is confirmed, your balance will appear in your CAPA wallet.</p>
      </>
    ),
  },
  {
    n: '03',
    title: 'Convert Your Currency',
    body: (
      <>
        <p style={{ margin: '0 0 10px' }}>CAPA supports multi-currency investing. Convert your local currency into the currency required for your chosen market using competitive exchange rates.</p>
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#fff' }}>For example:</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
          {['KES → USD (United States)', 'KES → GBP (United Kingdom)', 'KES → EUR (Europe)'].map(i => <li key={i}>{i}</li>)}
        </ul>
        <p style={{ margin: '12px 0 0' }}>Your converted funds are stored securely in your investment wallet, ready for trading.</p>
      </>
    ),
  },
  {
    n: '04',
    title: 'Start Investing',
    body: (
      <>
        <p style={{ margin: '0 0 10px' }}>Explore stock markets from around the world and invest in companies you believe in.</p>
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#fff' }}>With CAPA you can:</p>
        <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
          {['Invest in individual stocks', 'Buy fractional shares', 'Invest in Exchange-Traded Funds (ETFs)', 'Build and manage a diversified portfolio', 'Track your investments in real time', 'Monitor market performance with live pricing and charts'].map(i => <li key={i}>{i}</li>)}
        </ul>
      </>
    ),
  },
];

const whyPoints = [
  'Access multiple global stock exchanges from one platform',
  'Invest using your local currency',
  'Secure multi-currency wallets',
  'Transparent pricing with no hidden fees',
  'Simple, modern, and intuitive experience',
  'Built for African investors with global ambitions',
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#f5f5f7', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 56px' }}>
        <div style={{ display: 'inline-block', marginBottom: 24 }}>
          <CapaLogo size={100} />
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 12px', lineHeight: 1.05 }}>
          Investing Without Borders
        </h1>
        <p style={{ fontSize: 22, fontWeight: 600, color: ACCENT, margin: '0 0 16px' }}>
          Invest in Global Markets from Africa
        </p>
        <p style={{ fontSize: 17, color: SEC, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          CAPA makes it simple, secure, and affordable for African investors to access leading stock exchanges around the world. Build your wealth by investing in global companies — all from one platform.
        </p>
      </section>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* About */}
        <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '36px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 16px' }}>About CAPA</h2>
          <p style={{ fontSize: 16, color: SEC, lineHeight: 1.75, margin: '0 0 14px' }}>
            CAPA is a global stock investing platform built to give investors seamless access to multiple international stock exchanges through a single account. Our mission is to remove barriers to global investing by providing a secure, transparent, and user-friendly experience.
          </p>
          <p style={{ fontSize: 16, color: SEC, lineHeight: 1.75, margin: 0 }}>
            Whether you're investing in companies listed in the United States, Europe, Asia, or Africa, CAPA helps you discover opportunities, manage your portfolio, and grow your wealth with confidence.
          </p>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: DIVIDER, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🏢</span>
            <span style={{ fontSize: 15, color: SEC }}><strong style={{ color: '#fff' }}>Head Office</strong> — Nairobi, Kenya</span>
          </div>
        </div>

        {/* Contact */}
        <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '36px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 8px' }}>Contact Us</h2>
          <p style={{ fontSize: 15, color: SEC, margin: '0 0 20px' }}>Our support team is always ready to help you with your investing journey.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="tel:+254799277412" style={{ display: 'flex', alignItems: 'center', gap: 10, color: ACCENT, textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>
              <span style={{ fontSize: 20 }}>📞</span> +254 799 277 412
            </a>
            <a href="mailto:support@capa.co.ke" style={{ display: 'flex', alignItems: 'center', gap: 10, color: ACCENT, textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>
              <span style={{ fontSize: 20 }}>✉️</span> support@capa.co.ke
            </a>
          </div>
        </div>

        {/* Getting Started */}
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>Getting Started</h2>
          <p style={{ fontSize: 15, color: SEC, margin: '0 0 24px' }}>Everything you need to begin investing with CAPA.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map(({ n, title, body }) => (
              <div key={n} style={{ backgroundColor: CARD, borderRadius: 18, padding: '28px 32px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: ACCENT, opacity: 0.7, minWidth: 36, lineHeight: 1, flexShrink: 0 }}>{n}</div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.02em' }}>{title}</h3>
                  <div style={{ fontSize: 14, color: SEC, lineHeight: 1.75 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why CAPA */}
        <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '36px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 20px' }}>Why Choose CAPA?</h2>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {whyPoints.map(p => (
              <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: SEC, lineHeight: 1.5 }}>
                <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Mission */}
        <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '36px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 14px' }}>Our Mission</h2>
          <p style={{ fontSize: 16, color: SEC, lineHeight: 1.75, margin: 0 }}>
            To empower every African investor with seamless access to global financial markets through innovative technology, transparency, and world-class investment tools.
          </p>
        </div>

      </div>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px', backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>Ready to start investing?</h2>
        <p style={{ fontSize: 17, color: SEC, marginBottom: 28 }}>Open your account in minutes.</p>
        <Link to="/register" style={{ display: 'inline-block', background: ACCENT, color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 980, fontSize: 17, fontWeight: 600 }}>
          Get Started
        </Link>
      </section>

      <footer style={{ padding: '24px', textAlign: 'center', borderTop: DIVIDER }}>
        <p style={{ margin: 0, fontSize: 12, color: SEC }}>
          © {new Date().getFullYear()} CAPA. All rights reserved.{' '}
          <Link to="/terms"   style={{ color: SEC }}>Terms</Link> · <Link to="/privacy" style={{ color: SEC }}>Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
