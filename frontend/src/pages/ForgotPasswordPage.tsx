import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';
const ACCENT = 'var(--primary)';

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
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: TEXT, margin: '6px 0 4px' }}>
            {sent ? 'Check your inbox' : 'Reset your password'}
          </h1>
          <p style={{ fontSize: 14, color: SEC, margin: 0 }}>
            {sent ? `We sent a reset link to ${email}` : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        {sent ? (
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', padding: '28px 24px', border: '2px solid var(--foreground)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <p style={{ fontSize: 14, color: SEC, lineHeight: 1.6, marginBottom: 24 }}>
              If an account exists for <strong style={{ color: TEXT }}>{email}</strong>, you'll receive a reset link within a few minutes. Check your spam folder if you don't see it.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '12px 28px', fontSize: 14 }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', padding: '28px 24px', border: '2px solid var(--foreground)' }}>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: SEC, marginBottom: 6 }}>Email address</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: 15, border: `2px solid ${focused ? ACCENT : 'var(--input)'}`, outline: 'none', backgroundColor: 'var(--card)', color: TEXT, fontFamily: 'var(--font-sans)', transition: 'border 0.15s', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: SEC }}>
              Remembered it? <Link to="/login" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
