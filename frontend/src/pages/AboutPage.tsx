import { Link } from 'react-router-dom';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = 'var(--text)';
const SEC = 'var(--text-secondary)';
const ACCENT = 'var(--accent)';
const CARD = '#1c1c1e';

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <CapaLogo size={44} />
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
    <div style={{ minHeight: '100vh', background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
        <div className="orange-float" style={{ display: 'inline-block', marginBottom: 24 }}>
          <CapaLogo size={120} />
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 16px', lineHeight: 1.05 }}>
          Investing for Everyone,<br />Everywhere
        </h1>
        <p style={{ fontSize: 19, color: SEC, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
          Capa is your trusted trading platform connecting African investors to global markets — simply, securely, and affordably.
        </p>
      </section>

      {/* About CAPA */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '40px 36px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16 }}>About CAPA</h2>
          <p style={{ fontSize: 17, color: SEC, lineHeight: 1.7, margin: 0 }}>
            CAPA is a company dedicated to listing all stock exchange platforms in one place. Our goal is to make it easier for investors to quickly identify and evaluate investment opportunities.
          </p>
          <p style={{ fontSize: 17, color: SEC, lineHeight: 1.7, margin: '16px 0 0' }}>
            We are situated at <strong style={{ color: TEXT }}>Zetech University</strong> in Nairobi, Kenya.
          </p>
          <div style={{ marginTop: 24, padding: '20px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: SEC, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Contact Us</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="tel:+254799277412" style={{ color: ACCENT, textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>
                📞 +254 799 277 412
              </a>
              <a href="mailto:capa@gmail.com" style={{ color: ACCENT, textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>
                ✉️ capa@gmail.com
              </a>
            </div>
          </div>
          <p style={{ fontSize: 16, color: SEC, lineHeight: 1.7, margin: '24px 0 0', fontStyle: 'italic' }}>
            We thank you for choosing us as your trusted trading platform.
          </p>
        </div>
      </section>

      {/* Guidelines */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8, textAlign: 'center' }}>How to Get Started</h2>
        <p style={{ fontSize: 15, color: SEC, textAlign: 'center', marginBottom: 32 }}>Everything you need to know to begin investing with CAPA.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              step: '01',
              title: 'How to Open an Account',
              sub: 'If you are new!',
              body: 'Requirements: Email address, phone number, KRA PIN, and preferred mode of payment and deposit.',
            },
            {
              step: '02',
              title: 'KRA PIN — What It Is & Why We Need It',
              sub: null,
              body: 'A KRA PIN (Kenya Revenue Authority Personal Identification Number) is a unique identifier issued by the Kenya Revenue Authority. It is required by Kenyan law for any financial or investment activity, including opening a brokerage account. CAPA uses your KRA PIN to comply with tax regulations and to report any capital gains or dividends you earn to the KRA. If you do not have a KRA PIN, you can register for one for free at iTax (itax.kra.go.ke) using your National ID. The process takes only a few minutes.',
            },
            {
              step: '03',
              title: 'Deposit Money',
              sub: null,
              body: 'Deposit money using your preferred mobile banking app, then refresh this page and the balance should be updated in the app. If you encounter any errors, kindly contact our support team. After that, you will need to convert currencies based on the country in which each stock is listed.',
            },
            {
              step: '04',
              title: 'Changing Currencies',
              sub: null,
              body: 'Select the preferred country and your mobile wallet money will be updated automatically based on the country\'s conversion rate.',
            },
            {
              step: '05',
              title: 'Buying Stocks',
              sub: null,
              body: 'Please select a country to view its stock exchanges and market listings, including publicly traded companies and their current prices. You can choose to invest in individual stocks or in our index fund.',
            },
          ].map(({ step, title, sub, body }) => (
            <div key={step} style={{ backgroundColor: CARD, borderRadius: 18, padding: '28px 32px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: ACCENT, opacity: 0.7, minWidth: 40, lineHeight: 1 }}>{step}</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                  {title}{sub && <span style={{ fontSize: 13, fontWeight: 400, color: SEC, marginLeft: 8 }}>— {sub}</span>}
                </h3>
                <p style={{ fontSize: 14, color: SEC, margin: '8px 0 0', lineHeight: 1.7 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px 80px', backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', marginTop: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>Ready to start investing?</h2>
        <p style={{ fontSize: 17, color: SEC, marginBottom: 28 }}>Open your account in minutes. No minimum deposit.</p>
        <Link to="/register" style={{ display: 'inline-block', background: ACCENT, color: '#fff', textDecoration: 'none', padding: '14px 36px', borderRadius: 980, fontSize: 18, fontWeight: 500 }}>
          Get Started
        </Link>
      </section>

      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, fontSize: 12, color: SEC }}>
          © {new Date().getFullYear()} Capa Investments Ltd. Regulated investment platform. Capital at risk.{' '}
          <Link to="/terms" style={{ color: SEC }}>Terms</Link> · <Link to="/privacy" style={{ color: SEC }}>Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
