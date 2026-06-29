import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT   = '#ffffff';
const SEC    = 'rgba(235,235,245,0.6)';
const ACCENT = '#f5821f';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', mfaCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      if (data.requiresMfa) { setNeedsMfa(true); setLoading(false); return; }
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const inputStyle = (name: string) => ({
    width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 17,
    border: `1px solid ${focused === name ? ACCENT : 'rgba(84,84,88,0.65)'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(245,130,31,0.18)' : 'none',
    outline: 'none', backgroundColor: '#2c2c2e', color: TEXT,
    fontFamily: 'inherit', transition: 'border 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CapaLogo size={110} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', color: ACCENT, textTransform: 'uppercase', margin: '4px 0 14px' }}>Unstoppable Minds</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, margin: '0 0 4px' }}>Sign in to Capa</h1>
          <p style={{ fontSize: 14, color: SEC, margin: 0 }}>Enter your details to continue</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#1c1c1e', borderRadius: 20, padding: '28px 24px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6, letterSpacing: '-0.01em' }}>Email</label>
              <input style={inputStyle('email')} type="email" placeholder="you@example.com" required
                value={form.email} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: SEC, letterSpacing: '-0.01em' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle('password'), paddingRight: 44 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.password} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(235,235,245,0.4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {needsMfa && (
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6 }}>MFA Code</label>
                <input style={inputStyle('mfa')} type="text" placeholder="6-digit code" maxLength={6}
                  value={form.mfaCode} onFocus={() => setFocused('mfa')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, mfaCode: e.target.value }))} />
              </div>
            )}

            <button type="submit" disabled={loading} style={{ marginTop: 4, width: '100%', padding: '13px', borderRadius: 12, backgroundColor: loading ? '#f0a060' : ACCENT, color: '#fff', border: 'none', fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ fontSize: 14, color: SEC, textAlign: 'center', marginTop: 20, marginBottom: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
