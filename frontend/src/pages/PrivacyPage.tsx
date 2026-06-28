import { Link } from 'react-router-dom';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = '#f5821f';

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <CapaLogo size={24} />
        <span style={{ color: TEXT, fontWeight: 600, fontSize: 15 }}>Capa</span>
      </Link>
    </nav>
  );
}

const sections = [
  { title: '1. Information We Collect', body: 'We collect information you provide directly: name, email, phone number, date of birth, address, government ID documents, and financial information needed to provide our services. We also collect usage data, device information, and IP addresses to improve our service and detect fraud.' },
  { title: '2. How We Use Your Information', body: 'We use your information to: create and manage your account; verify your identity (KYC/AML compliance); process transactions; send account notifications and statements; detect and prevent fraud; comply with legal and regulatory obligations; and improve our products and services.' },
  { title: '3. Legal Basis for Processing', body: 'We process your data based on: (a) performance of a contract — to provide the Service; (b) legal obligation — for KYC, AML, and tax reporting requirements; (c) legitimate interests — for fraud prevention and service improvement; (d) consent — for marketing communications (you can withdraw consent at any time).' },
  { title: '4. Data Sharing', body: 'We do not sell your personal data. We share it only with: regulated custodians and brokers to execute your investments; KYC verification partners; payment processors for deposits and withdrawals; regulatory authorities when required by law; and cloud infrastructure providers under strict data processing agreements.' },
  { title: '5. Data Retention', body: 'We retain account and transaction data for a minimum of 7 years as required by financial regulations. You may request deletion of non-essential data at any time, subject to our legal obligations to retain certain records.' },
  { title: '6. Your Rights', body: 'Depending on your jurisdiction, you may have the right to: access the personal data we hold about you; correct inaccurate data; delete your data (subject to legal retention requirements); object to certain processing; and receive your data in a portable format. To exercise these rights, email privacy@capa.invest.' },
  { title: '7. Security', body: 'We use industry-standard security measures including AES-256 encryption at rest, TLS 1.3 in transit, and strict access controls. No method of transmission over the internet is 100% secure, but we work continuously to protect your information.' },
  { title: '8. Cookies', body: 'We use essential cookies to maintain your session and remember your preferences. We use analytics cookies only with your consent. You can manage cookie preferences through our cookie consent banner or your browser settings.' },
  { title: '9. International Transfers', body: 'Your data may be processed in countries outside your home country. We ensure adequate safeguards are in place for any international data transfers, including standard contractual clauses where required.' },
  { title: '10. Changes to This Policy', body: 'We may update this Privacy Policy from time to time. Material changes will be communicated by email. Your continued use of the Service after changes constitutes acceptance.' },
  { title: '11. Contact', body: 'For privacy-related enquiries, email privacy@capa.invest. For EU/UK residents, you may also lodge a complaint with your local data protection authority.' },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: SEC, marginBottom: 40 }}>Last updated: January 2024</p>

        <p style={{ fontSize: 16, color: SEC, lineHeight: 1.7, marginBottom: 40 }}>
          At Capa, protecting your personal data is a core responsibility, not an afterthought. This policy explains what data we collect, how we use it, and your rights.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
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
          <Link to="/terms" style={{ color: SEC }}>Terms of Service</Link> · <Link to="/contact" style={{ color: SEC }}>Contact</Link>
        </p>
      </footer>
    </div>
  );
}
