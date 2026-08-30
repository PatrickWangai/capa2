import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useAlertStore } from '../store/alertStore';
import CapaCCircle from '../components/ui/CapaCCircle';

const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';
const ACCENT = 'var(--primary)';

function Feature({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#fff' }}>
      <span style={{ marginTop: 2, display: 'flex', width: 18, height: 18, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#fff', color: ACCENT }}>
        <Check size={11} strokeWidth={3} />
      </span>
      <span>{text}</span>
    </div>
  );
}

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
    width: '100%', padding: '9px 12px', borderRadius: 'var(--radius)', fontSize: 14,
    border: `2px solid ${focused === name ? ACCENT : 'var(--border)'}`,
    outline: 'none', backgroundColor: 'var(--background)', color: TEXT,
    fontFamily: 'var(--font-sans)', transition: 'border-color 0.15s',
    boxSizing: 'border-box' as const,
  });

  const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6 };

  return (
    <div style={{
      position: 'relative', display: 'grid', gridTemplateColumns: '1fr',
      minHeight: '100vh', background: ACCENT, padding: 24,
      fontFamily: 'var(--font-sans)',
    }}
    className="capa-login-grid"
    >
      <style>{`
        @media (min-width: 1024px) {
          .capa-login-grid { grid-template-columns: 1fr 1fr !important; padding: 40px !important; }
          .capa-login-left { margin-top: 0 !important; }
        }
      `}</style>

      {/* Badge logo */}
      <div style={{
        pointerEvents: 'none', position: 'absolute', left: '50%', top: 24, zIndex: 10,
        transform: 'translateX(-50%)', width: 80, height: 80, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.7)', background: ACCENT,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CapaCCircle size={44} />
      </div>

      {/* Left: pitch */}
      <div className="capa-login-left" style={{
        position: 'relative', marginTop: 96, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: 28, padding: '0 16px 40px',
      }}>
        <div>
          <p style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)' }}>
            Capa Investments
          </p>
          <h1 style={{ lineHeight: 0.98, margin: 0 }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 46px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: TEXT }}>
              Sign in to your
            </span>
            <span style={{ display: 'block', marginTop: 2, fontFamily: 'var(--font-script)', fontSize: 'clamp(52px, 7vw, 68px)', color: '#fff' }}>
              portfolio.
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Feature text="Real-time NYSE, NASDAQ, LSE and NSE market data" />
          <Feature text="M-Pesa and bank deposits, settled instantly" />
          <Feature text="Bank-grade encryption and segregated custody" />
        </div>

        <Link
          to="/contact"
          style={{
            display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 8,
            borderRadius: 'var(--radius)', border: '2px solid var(--foreground)', background: '#fff',
            padding: '11px 20px', fontSize: 13, fontWeight: 700, color: TEXT, textDecoration: 'none',
            boxShadow: '5px 5px 0 0 var(--foreground)', transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '7px 7px 0 0 var(--foreground)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '5px 5px 0 0 var(--foreground)'; }}
        >
          Need help signing in? →
        </Link>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          © {new Date().getFullYear()} Capa Investments Ltd.
        </p>
      </div>

      {/* Right: form card */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 24px' }}>
        <div style={{
          width: '100%', maxWidth: 380, borderRadius: 'calc(var(--radius) + 12px)',
          border: '2px solid var(--foreground)', background: 'var(--card)',
          padding: '28px 24px', boxShadow: '8px 8px 0 0 var(--foreground)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: TEXT }}>Enter your credentials</h2>
            <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: SEC }}>
              To continue to your portfolio.
            </p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={label}>Email</label>
              <input style={inputStyle('email')} type="email" placeholder="you@example.com" required
                value={form.email} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: SEC }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle('password'), paddingRight: 40 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.password} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {needsMfa && (
              <div>
                <label style={label}>MFA code</label>
                <input style={inputStyle('mfa')} type="text" placeholder="6-digit code" maxLength={6}
                  value={form.mfaCode} onFocus={() => setFocused('mfa')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, mfaCode: e.target.value }))} />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '11px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: SEC, margin: 0 }}>
            Trouble signing in? <Link to="/contact" style={{ color: ACCENT, textDecoration: 'none' }}>Contact support</Link>.
          </p>
          <p style={{ textAlign: 'center', fontSize: 13, color: SEC, margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 700 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
