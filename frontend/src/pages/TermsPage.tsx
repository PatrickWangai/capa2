import { Link } from 'react-router-dom';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = '#20d4b8';
const CARD = '#1c1c1e';

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <CapaLogo size={44} />
        <span style={{ color: TEXT, fontWeight: 600, fontSize: 15 }}>Capa</span>
      </Link>
    </nav>
  );
}

const sections = [
  { title: '1. Acceptance of Terms', body: 'By creating an account or using the Capa platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.' },
  { title: '2. Eligibility', body: 'You must be at least 18 years old and legally capable of entering into contracts in your jurisdiction. The Service is not available to persons in jurisdictions where it is prohibited by law.' },
  { title: '3. Account Registration', body: 'You agree to provide accurate, current, and complete information during registration and to keep your account information updated. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.' },
  { title: '4. Identity Verification (KYC)', body: 'To comply with anti-money laundering (AML) regulations, we require identity verification before you can trade or withdraw funds. You agree to provide valid government-issued identification and any additional documents we may request.' },
  { title: '5. Investment Risk', body: 'Investing in financial instruments involves significant risk, including the possible loss of some or all of your invested capital. Past performance is not indicative of future results. We do not provide personalised financial advice. Always consider your financial situation and risk tolerance before investing.' },
  { title: '6. Fees', body: 'Our fees are described on the Pricing page. We reserve the right to change our fee schedule with 30 days notice. Continued use of the Service after fee changes constitutes acceptance of the new fees.' },
  { title: '7. Prohibited Activities', body: 'You may not use the Service for market manipulation, money laundering, or any unlawful purpose. You may not use automated trading bots without express written permission. You may not attempt to circumvent any security measures.' },
  { title: '8. Termination', body: 'We may suspend or terminate your account at any time for breach of these Terms, regulatory requirements, or suspected fraudulent activity. You may close your account at any time by contacting support, subject to completion of any outstanding transactions.' },
  { title: '9. Limitation of Liability', body: 'To the maximum extent permitted by law, Capa and its affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including investment losses.' },
  { title: '10. Governing Law', body: 'These Terms are governed by the laws of the jurisdiction in which Capa Investments Ltd is registered. Any disputes shall be resolved through binding arbitration, except where prohibited by local law.' },
  { title: '11. Changes to Terms', body: 'We may update these Terms from time to time. We will notify you of material changes via email or in-app notification. Your continued use of the Service after changes constitutes acceptance.' },
  { title: '12. Contact', body: 'For questions about these Terms, contact us at legal@capa.invest.' },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: SEC, marginBottom: 40 }}>Last updated: January 2024</p>

        <div style={{ backgroundColor: 'rgba(32,212,184,0.08)', border: '1px solid rgba(32,212,184,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 36 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(32,212,184,0.9)', lineHeight: 1.6 }}>
            <strong>Important:</strong> Investing involves risk. By using Capa, you acknowledge that you may lose some or all of your invested capital. Please read these terms carefully.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sections.map(s => (
            <div key={s.title}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: TEXT, marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: SEC, lineHeight: 1.7, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, fontSize: 12, color: SEC }}>
          © 2024 Capa Investments Ltd.{' '}
          <Link to="/privacy" style={{ color: SEC }}>Privacy Policy</Link> · <Link to="/contact" style={{ color: SEC }}>Contact</Link>
        </p>
      </footer>
    </div>
  );
}
