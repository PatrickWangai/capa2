import { Link } from 'react-router-dom';
import CapaLogo from '../components/ui/CapaLogo';
import { useAuthStore } from '../store/authStore';

const TEXT = 'var(--text)';
const SEC = 'var(--text-secondary)';
const ACCENT = 'var(--primary)';

export default function NotFoundPage() {
  const token = useAuthStore(s => s.accessToken);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-sans)', textAlign: 'center' }}>
      <div className="orange-float" style={{ display: 'inline-block', marginBottom: 28 }}>
        <CapaLogo size={80} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(64px,12vw,120px)', fontWeight: 900, letterSpacing: '-0.04em', color: TEXT, margin: '0 0 8px', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', color: TEXT, margin: '0 0 12px', letterSpacing: '-0.01em' }}>Page not found</h2>
      <p style={{ fontSize: 15, color: SEC, margin: '0 0 36px', maxWidth: 360, lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to={token ? '/dashboard' : '/'} className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 28px', fontSize: 14 }}>
          {token ? 'Go to Dashboard' : 'Go Home'}
        </Link>
        <Link to="/contact" className="btn-secondary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 28px', fontSize: 14 }}>
          Contact Support
        </Link>
      </div>
    </div>
  );
}
