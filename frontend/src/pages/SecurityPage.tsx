import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Server, Key, AlertTriangle } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = 'var(--text)';
const SEC = 'var(--text-secondary)';
const ACCENT = 'var(--accent)';
const CARD = '#1c1c1e';

const pillars = [
  { icon: Lock, title: 'Encryption', desc: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Your passwords are hashed with bcrypt — we never store them in plain text.' },
  { icon: Shield, title: 'Segregated Assets', desc: 'Client funds and assets are held separately from company assets as required by financial regulations, ensuring your money is protected even in the unlikely event of company insolvency.' },
  { icon: Key, title: 'Two-Factor Authentication', desc: 'We strongly recommend enabling 2FA (TOTP) on your account. This ensures only you can access your account, even if your password is compromised.' },
  { icon: Eye, title: 'Fraud Monitoring', desc: 'Our systems monitor for suspicious login attempts, unusual activity, and potential fraud 24/7. Abnormal activity triggers automatic account protection.' },
  { icon: Server, title: 'Infrastructure Security', desc: 'Our infrastructure is hosted on enterprise-grade cloud providers with SOC 2 Type II certification. Regular penetration tests and security audits are conducted.' },
  { icon: AlertTriangle, title: 'Responsible Disclosure', desc: 'Found a security vulnerability? We have a responsible disclosure program. Email security@capa.invest with details and we will investigate promptly.' },
];

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <CapaLogo size={44} />
        <span style={{ color: TEXT, fontWeight: 600, fontSize: 15 }}>Capa</span>
      </Link>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <Link to="/login" style={{ color: SEC, textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
        <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, background: ACCENT, padding: '5px 14px', borderRadius: 980 }}>Get Started</Link>
      </div>
    </nav>
  );
}

export default function SecurityPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(var(--accent-rgb),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Shield size={32} color={ACCENT} />
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 12px' }}>Your Security is Our Priority</h1>
          <p style={{ fontSize: 17, color: SEC, maxWidth: 500, margin: '0 auto' }}>We apply bank-grade security standards to protect your account, money, and personal data.</p>
        </div>

        {/* Security pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 40 }}>
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ backgroundColor: CARD, borderRadius: 18, padding: 28, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(var(--accent-rgb),0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Icon size={20} color={ACCENT} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ fontSize: 14, color: SEC, margin: 0, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Tips for users */}
        <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '32px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 20 }}>How to keep your account safe</h2>
          <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Enable two-factor authentication in Settings → Security',
              'Use a unique, strong password (min 8 characters, mix of letters, numbers, symbols)',
              'Never share your password or 2FA codes with anyone — including Capa staff',
              'Always log out when using shared or public devices',
              'Be wary of phishing emails — we only send emails from @capa.invest',
              'Check your login history regularly for unexpected activity',
            ].map(tip => (
              <li key={tip} style={{ fontSize: 15, color: SEC, lineHeight: 1.5 }}>{tip}</li>
            ))}
          </ul>
        </div>

        <div style={{ padding: '20px 24px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: SEC }}>Questions about security?</p>
          <Link to="/contact" style={{ color: ACCENT, fontSize: 14, fontWeight: 500 }}>Contact our security team →</Link>
        </div>
      </div>

      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, fontSize: 12, color: SEC }}>
          © 2026 Capa Investments Ltd.{' '}
          <Link to="/terms" style={{ color: SEC }}>Terms</Link> · <Link to="/privacy" style={{ color: SEC }}>Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
