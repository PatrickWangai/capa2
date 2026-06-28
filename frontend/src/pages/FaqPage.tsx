import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = '#f5821f';
const CARD = '#1c1c1e';

const faqs = [
  { category: 'Getting Started', items: [
    { q: 'How do I open a Capa account?', a: 'Register with your email and password, verify your email, then complete our KYC identity verification. The whole process takes under 10 minutes.' },
    { q: 'What documents do I need for verification?', a: 'A government-issued photo ID (passport, national ID, or driver\'s licence) and proof of address (utility bill or bank statement less than 3 months old).' },
    { q: 'Is there a minimum deposit?', a: 'No minimum deposit is required to open an account. However, some assets have a minimum trade size (typically $1 or equivalent).' },
  ]},
  { category: 'Investing', items: [
    { q: 'What can I invest in?', a: 'Stocks and ETFs listed on NYSE, NASDAQ, LSE, and the Nairobi Securities Exchange. We\'re continuously adding more markets and asset classes.' },
    { q: 'How are my investments protected?', a: 'Eligible investments are held in your name through our regulated custodian. Client assets are segregated from company assets as required by regulation.' },
    { q: 'Can I invest fractional shares?', a: 'Yes. You can invest any amount in a stock — you don\'t need to buy a whole share. This lets you build a diversified portfolio with any budget.' },
  ]},
  { category: 'Deposits & Withdrawals', items: [
    { q: 'How do I deposit funds?', a: 'We accept M-Pesa, bank transfers, and card payments. Go to Deposit in the app and follow the instructions for your preferred method.' },
    { q: 'How long do withdrawals take?', a: 'Withdrawals are processed within 1–3 business days. M-Pesa withdrawals are typically same-day.' },
    { q: 'Are there any fees?', a: 'We charge a small commission on trades. Deposits and withdrawals via M-Pesa are free. See our Pricing page for the full fee schedule.' },
  ]},
  { category: 'Security', items: [
    { q: 'How is my account secured?', a: 'We use 256-bit AES encryption, two-factor authentication (2FA), and follow industry security standards. We recommend enabling 2FA in your account settings.' },
    { q: 'What if I forget my password?', a: 'Use the "Forgot Password" link on the login page. We\'ll send a reset link to your registered email address valid for 1 hour.' },
    { q: 'Is my data safe?', a: 'Yes. We never sell your personal data. All data is encrypted at rest and in transit. See our Privacy Policy for full details.' },
  ]},
];

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ fontSize: 15, fontWeight: 500, color: TEXT, fontFamily: 'inherit' }}>{q}</span>
        <ChevronDown size={18} color={SEC} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 16 }} />
      </button>
      {open && (
        <p style={{ margin: '0 0 16px', fontSize: 15, color: SEC, lineHeight: 1.65 }}>{a}</p>
      )}
    </div>
  );
}

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <CapaLogo size={24} />
        <span style={{ color: TEXT, fontWeight: 600, fontSize: 15 }}>Capa</span>
      </Link>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link to="/login" style={{ color: SEC, textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
        <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, background: ACCENT, padding: '5px 14px', borderRadius: 980 }}>Get Started</Link>
      </div>
    </nav>
  );
}

export default function FaqPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 12px' }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: 17, color: SEC, margin: 0 }}>Can't find what you're looking for? <Link to="/contact" style={{ color: ACCENT }}>Contact us</Link>.</p>
        </div>

        {faqs.map(({ category, items }) => (
          <div key={category} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{category}</h2>
            <div style={{ backgroundColor: CARD, borderRadius: 18, padding: '0 24px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
              {items.map(item => <Accordion key={item.q} q={item.q} a={item.a} />)}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontSize: 16, color: SEC, marginBottom: 16 }}>Still need help?</p>
          <Link to="/contact" style={{ display: 'inline-block', background: ACCENT, color: '#fff', textDecoration: 'none', padding: '13px 32px', borderRadius: 980, fontSize: 16, fontWeight: 500 }}>
            Contact Support
          </Link>
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
