import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import { useAlertStore } from '../store/alertStore';

const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';
const ACCENT = 'var(--primary)';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', mfaCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const showAlert = useAlertStore(s => s.show);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      if (data.requiresMfa) { setNeedsMfa(true); setLoading(false); return; }
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      const data = err.response?.data;
      const msg = data?.details?.[0]?.message || data?.error || 'Please check your credentials and try again.';
      showAlert({ variant: 'error', title: 'Sign in failed', message: msg });
    } finally { setLoading(false); }
  };

  const inputStyle = (name: string) => ({
    width: '100%', padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: 15,
    border: `2px solid ${focused === name ? ACCENT : 'var(--input)'}`,
    outline: 'none', backgroundColor: 'var(--card)', color: TEXT,
    fontFamily: 'var(--font-sans)', transition: 'border 0.15s',
    boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-sans)' }}>

      {/* Back to home */}
      <Link to="/" style={{ position: 'fixed', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: SEC, textDecoration: 'none', padding: '7px 14px', borderRadius: 'var(--radius)', backgroundColor: 'var(--card)', border: '2px solid var(--foreground)', transition: 'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--card)')}>
        ← Home
      </Link>

      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: TEXT, margin: '6px 0 4px' }}>Sign in to Capa</h1>
          <p style={{ fontSize: 13, color: SEC, margin: 0 }}>Enter your details to continue</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', padding: '28px 24px', border: '2px solid var(--foreground)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: SEC, marginBottom: 6 }}>Email</label>
              <input style={inputStyle('email')} type="email" placeholder="you@example.com" required
                value={form.email} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: SEC }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 700 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle('password'), paddingRight: 44 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.password} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {needsMfa && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: SEC, marginBottom: 6 }}>MFA Code</label>
                <input style={inputStyle('mfa')} type="text" placeholder="6-digit code" maxLength={6}
                  value={form.mfaCode} onFocus={() => setFocused('mfa')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, mfaCode: e.target.value }))} />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4, width: '100%', padding: '13px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: SEC, textAlign: 'center', marginTop: 20, marginBottom: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 700 }}>Create one</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
