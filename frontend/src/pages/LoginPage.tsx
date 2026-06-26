import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import CapaLogo from '../components/ui/CapaLogo';

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

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Logo — large, centred, white wordmark on black */}
      <div className="mb-12">
        <CapaLogo className="text-white h-14 w-auto" />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-white text-center mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Sign in to your Capa account</p>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 space-y-4">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition text-sm"
                type="email" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition text-sm"
                  type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-300"
                  onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {needsMfa && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">MFA Code</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30 transition text-sm"
                  type="text" placeholder="6-digit code" maxLength={6}
                  value={form.mfaCode} onChange={e => setForm(f => ({ ...f, mfaCode: e.target.value }))}
                />
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="pt-1 text-center">
            <p className="text-gray-600 text-xs">
              Don't have an account?{' '}
              <Link to="/register" className="text-white hover:text-gray-300 font-medium">Create one</Link>
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-gray-600 text-center">
          <span className="text-gray-500 font-medium">Demo: </span>demo@capa.invest / Demo1234!
        </div>
      </div>
    </div>
  );
}
