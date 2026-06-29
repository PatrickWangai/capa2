import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = '#20d4b8';
const CARD = '#1c1c1e';

const fees = [
  { category: 'Trading', items: [
    { label: 'US Stocks & ETFs', value: '0.5% per trade', note: 'Min $1' },
    { label: 'UK Stocks', value: '0.5% per trade', note: 'Min £1' },
    { label: 'Kenyan Stocks (NSE)', value: '0.3% per trade', note: 'Min KES 50' },
    { label: 'Fractional Shares', value: '0.5% per trade', note: 'From $1' },
  ]},
  { category: 'Deposits', items: [
    { label: 'M-Pesa', value: 'Free', note: '' },
    { label: 'Bank Transfer (KES)', value: 'Free', note: '' },
    { label: 'Bank Transfer (USD/GBP)', value: 'Free', note: 'FX rate applies' },
    { label: 'Card (Visa/Mastercard)', value: '1.5%', note: '' },
  ]},
  { category: 'Withdrawals', items: [
    { label: 'M-Pesa', value: 'Free', note: 'Same day' },
    { label: 'Bank Transfer (KES)', value: 'KES 50', note: '1–2 business days' },
    { label: 'Bank Transfer (USD/GBP)', value: '$5 / £4', note: '2–3 business days' },
  ]},
  { category: 'Account', items: [
    { label: 'Account Opening', value: 'Free', note: '' },
    { label: 'Monthly Fee', value: 'Free', note: 'No subscription' },
    { label: 'Inactivity Fee', value: 'Free', note: '' },
    { label: 'Data & Statements', value: 'Free', note: '' },
  ]},
];

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <CapaLogo size={44} />
        <span style={{ color: TEXT, fontWeight: 600, fontSize: 15 }}>Capa</span>
      </Link>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link to="/login" style={{ color: SEC, textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
        <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, background: ACCENT, padding: '5px 14px', borderRadius: 980 }}>Get Started</Link>
      </div>
    </nav>
  );
}

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 12px' }}>Simple, Transparent Pricing</h1>
          <p style={{ fontSize: 17, color: SEC, margin: 0 }}>No hidden fees. No surprises. Ever.</p>
        </div>

        {/* No monthly fee highlight */}
        <div style={{ backgroundColor: 'rgba(32,212,184,0.08)', border: '1px solid rgba(32,212,184,0.25)', borderRadius: 18, padding: '28px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: TEXT }}>No monthly subscription</h3>
            <p style={{ margin: 0, fontSize: 15, color: SEC }}>You only pay when you trade. Open an account for free and keep it open at no cost — forever.</p>
          </div>
        </div>

        {fees.map(({ category, items }) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{category}</h2>
            <div style={{ backgroundColor: CARD, borderRadius: 18, overflow: 'hidden', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
              {items.map((item, i) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                  <div>
                    <span style={{ fontSize: 15, color: TEXT }}>{item.label}</span>
                    {item.note && <span style={{ fontSize: 13, color: SEC, marginLeft: 8 }}>— {item.note}</span>}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: item.value === 'Free' ? '#30d158' : TEXT }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* What's always free */}
        <div style={{ backgroundColor: CARD, borderRadius: 18, padding: 28, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)', marginTop: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600 }}>Always free</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['Account opening', 'Real-time price data', 'Portfolio tracking', 'Price alerts', 'Tax statements', 'Mobile app', 'Customer support', 'Account statements'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={16} color="#30d158" />
                <span style={{ fontSize: 14, color: SEC }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 40, padding: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: SEC, lineHeight: 1.6 }}>
            <strong style={{ color: 'rgba(235,235,245,0.8)' }}>Disclaimer:</strong> Fees are subject to change. FX conversion rates apply when investing in currencies other than your account base currency. All prices shown exclude applicable taxes. Capa Investments Ltd is a regulated entity. Capital at risk.
          </p>
        </div>
      </div>

      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, fontSize: 12, color: SEC }}>
          © 2024 Capa Investments Ltd. Capital at risk.{' '}
          <Link to="/terms" style={{ color: SEC }}>Terms</Link> · <Link to="/privacy" style={{ color: SEC }}>Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
