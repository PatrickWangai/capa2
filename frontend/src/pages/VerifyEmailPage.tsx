import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = '#20d4b8';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.post('/api/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CapaLogo size={120} />
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', color: ACCENT, textTransform: 'uppercase', margin: '6px 0 24px' }}>Unstoppable Minds</p>

        {status === 'loading' && (
          <>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(32,212,184,0.2)', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
            <h2 style={{ color: TEXT, fontSize: 22, fontWeight: 700 }}>Verifying your email…</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === 'success' && (
          <div style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: '36px 28px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: TEXT, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Email verified!</h2>
            <p style={{ color: SEC, fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>Your email address has been confirmed. Your account is now active.</p>
            <Link to="/dashboard" style={{ display: 'inline-block', background: ACCENT, color: '#fff', textDecoration: 'none', padding: '13px 32px', borderRadius: 980, fontSize: 17, fontWeight: 500 }}>
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: '36px 28px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: TEXT, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Verification failed</h2>
            <p style={{ color: SEC, fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>This link is invalid or has expired. Sign in and we'll send a new one.</p>
            <Link to="/login" style={{ display: 'inline-block', background: ACCENT, color: '#fff', textDecoration: 'none', padding: '13px 32px', borderRadius: 980, fontSize: 17, fontWeight: 500 }}>
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
