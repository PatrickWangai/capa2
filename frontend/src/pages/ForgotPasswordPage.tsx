import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = 'var(--accent)';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CapaLogo size={120} />
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', color: ACCENT, textTransform: 'uppercase', margin: '6px 0 14px' }}>Unstoppable Minds</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, margin: '0 0 4px' }}>
            {sent ? 'Check your inbox' : 'Reset your password'}
          </h1>
          <p style={{ fontSize: 15, color: SEC, margin: 0 }}>
            {sent ? `We sent a reset link to ${email}` : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        {sent ? (
          <div style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: '28px 24px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <p style={{ fontSize: 15, color: SEC, lineHeight: 1.6, marginBottom: 24 }}>
              If an account exists for <strong style={{ color: TEXT }}>{email}</strong>, you'll receive a reset link within a few minutes. Check your spam folder if you don't see it.
            </p>
            <Link to="/login" style={{ display: 'inline-block', background: ACCENT, color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 980, fontSize: 16, fontWeight: 500 }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: '28px 24px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6 }}>Email address</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 17, border: `1px solid ${focused ? ACCENT : 'rgba(84,84,88,0.65)'}`, boxShadow: focused ? '0 0 0 3px rgba(var(--accent-rgb),0.18)' : 'none', outline: 'none', backgroundColor: 'rgba(44,44,46,0.88)', color: TEXT, fontFamily: 'inherit', transition: 'border 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 12, backgroundColor: loading ? 'var(--accent-dark)' : ACCENT, color: '#fff', border: 'none', fontSize: 17, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: SEC }}>
              Remembered it? <Link to="/login" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
