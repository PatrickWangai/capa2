import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import CapaIcon from '../components/ui/CapaIcon';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', mfaCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const inputCls = [
    'w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 transition',
    'bg-[#1f3a30] border border-[#2a4a3c]',
    'focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
  ].join(' ');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#152921' }}>
      <div className="mb-10">
        <CapaIcon className="h-24 w-24" />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-white text-center mb-1">Welcome back</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Sign in to your Capa account</p>

        <div className="rounded-2xl p-6 space-y-4 border" style={{ backgroundColor: '#1a3028', borderColor: '#2a4a3c' }}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input className={inputCls} type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input className={inputCls} type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  style={{ paddingRight: '2.5rem' }}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {needsMfa && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">MFA Code</label>
                <input className={inputCls} type="text" placeholder="6-digit code" maxLength={6}
                  value={form.mfaCode} onChange={e => setForm(f => ({ ...f, mfaCode: e.target.value }))} />
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="pt-1 text-center">
            <p className="text-gray-500 text-xs">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium" style={{ color: '#c084fc' }}>Create one</Link>
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl text-xs text-gray-500 text-center border" style={{ backgroundColor: '#1a3028', borderColor: '#2a4a3c' }}>
          <span className="text-gray-400 font-medium">Demo: </span>demo@capa.invest / Demo1234!
        </div>
      </div>
    </div>
  );
}
