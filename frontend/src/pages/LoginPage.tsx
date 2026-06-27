import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import OrangeIcon from '../components/ui/OrangeIcon';

const TEXT = '#1d1d1f';
const SEC  = '#6e6e73';
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
    border: `1px solid ${focused === name ? ACCENT : '#d2d2d7'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(245,130,31,0.15)' : 'none',
    outline: 'none', backgroundColor: '#fff', color: TEXT,
    fontFamily: 'inherit', transition: 'border 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box' as const,
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="orange-float" style={{ display: 'inline-block' }}>
            <OrangeIcon size={72} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, marginTop: 16, marginBottom: 4 }}>Sign in to Capa</h1>
          <p style={{ fontSize: 15, color: SEC, margin: 0 }}>Enter your details to continue</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '28px 24px', boxShadow: '0 2px 20px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6, letterSpacing: '-0.01em' }}>Email</label>
              <input style={inputStyle('email')} type="email" placeholder="you@example.com" required
                value={form.email} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6, letterSpacing: '-0.01em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle('password'), paddingRight: 44 }} type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.password} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#aeaeb2', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
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

        {/* Demo hint */}
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.04)', fontSize: 13, color: SEC, textAlign: 'center' }}>
          <span style={{ fontWeight: 600, color: TEXT }}>Demo:</span> demo@capa.invest / Demo1234!
        </div>
      </div>
    </div>
  );
}
