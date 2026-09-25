import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';
const ACCENT = 'var(--primary)';

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
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {status === 'loading' && (
          <>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', color: TEXT, fontSize: 20, fontWeight: 900, textTransform: 'uppercase' }}>Verifying your email…</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === 'success' && (
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', padding: '36px 28px', border: '2px solid var(--foreground)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: TEXT, fontSize: 20, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Email verified!</h2>
            <p style={{ color: SEC, fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>Your email address has been confirmed. Your account is now active.</p>
            <Link to="/dashboard" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', fontSize: 14 }}>
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', padding: '36px 28px', border: '2px solid var(--foreground)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: TEXT, fontSize: 20, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Verification failed</h2>
            <p style={{ color: SEC, fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>This link is invalid or has expired. Sign in and we'll send a new one.</p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '13px 32px', fontSize: 14 }}>
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
