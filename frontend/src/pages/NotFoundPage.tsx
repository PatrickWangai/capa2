import { Link } from 'react-router-dom';
import CapaLogo from '../components/ui/CapaLogo';
import { useAuthStore } from '../store/authStore';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = 'var(--accent)';

export default function NotFoundPage() {
  const token = useAuthStore(s => s.accessToken);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased', textAlign: 'center' }}>
      <div className="orange-float" style={{ display: 'inline-block', marginBottom: 28 }}>
        <CapaLogo size={80} />
      </div>
      <h1 style={{ fontSize: 'clamp(64px,12vw,120px)', fontWeight: 800, letterSpacing: '-0.06em', color: TEXT, margin: '0 0 8px', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: TEXT, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Page not found</h2>
      <p style={{ fontSize: 16, color: SEC, margin: '0 0 36px', maxWidth: 360, lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to={token ? '/dashboard' : '/'} style={{ display: 'inline-block', background: ACCENT, color: '#fff', textDecoration: 'none', padding: '13px 28px', borderRadius: 980, fontSize: 16, fontWeight: 500 }}>
          {token ? 'Go to Dashboard' : 'Go Home'}
        </Link>
        <Link to="/contact" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: TEXT, textDecoration: 'none', padding: '13px 28px', borderRadius: 980, fontSize: 16 }}>
          Contact Support
        </Link>
      </div>
    </div>
  );
}
