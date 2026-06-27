import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import OrangeIcon from '../components/ui/OrangeIcon';

const inputCls = [
  'w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 transition',
  'border focus:outline-none',
].join(' ');

const inputStyle = {
  backgroundColor: '#1a1410',
  borderColor: 'rgba(245,130,31,0.2)',
};

const inputFocusStyle = {
  borderColor: '#f5821f',
  boxShadow: '0 0 0 2px rgba(245,130,31,0.18)',
};

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
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (name: string) => ({
    ...inputStyle,
    ...(focused === name ? inputFocusStyle : {}),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#0a0808', position: 'relative', overflow: 'hidden' }}>

      {/* Glowing orange blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '10%',  width: 600, height: 600, borderRadius: '50%', background: 'rgba(245,130,31,0.12)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,69,0,0.09)',   filter: 'blur(100px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Floating orange */}
        <div className="orange-float" style={{ marginBottom: 24 }}>
          <OrangeIcon size={96} />
        </div>

        <h1 className="text-xl font-semibold text-white text-center mb-1">Welcome back</h1>
        <p className="text-sm text-center mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign in to your Capa account</p>

        <div className="w-full rounded-2xl p-6 space-y-4" style={{ backgroundColor: '#130f0d', border: '1px solid rgba(245,130,31,0.15)' }}>
          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Email</label>
              <input
                className={inputCls} type="email" placeholder="you@example.com" required
                style={fieldStyle('email')}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Password</label>
              <div className="relative">
                <input
                  className={inputCls} type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  style={{ ...fieldStyle('password'), paddingRight: '2.5rem' }}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-2.5 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {needsMfa && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>MFA Code</label>
                <input
                  className={inputCls} type="text" placeholder="6-digit code" maxLength={6}
                  style={fieldStyle('mfa')}
                  onFocus={() => setFocused('mfa')} onBlur={() => setFocused(null)}
                  value={form.mfaCode} onChange={e => setForm(f => ({ ...f, mfaCode: e.target.value }))}
                />
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              style={{ background: 'linear-gradient(135deg, #f5821f, #ff4500)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium" style={{ color: '#f5821f' }}>Create one</Link>
          </p>
        </div>

        <div className="mt-4 p-3 rounded-xl text-xs text-center w-full" style={{ backgroundColor: '#130f0d', border: '1px solid rgba(245,130,31,0.1)', color: 'rgba(255,255,255,0.35)' }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Demo: </span>demo@capa.invest / Demo1234!
        </div>
      </div>
    </div>
  );
}
