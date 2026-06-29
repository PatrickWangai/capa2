import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = '#20d4b8';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (name: string) => ({
    width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 17,
    border: `1px solid ${focused === name ? ACCENT : 'rgba(84,84,88,0.65)'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(32,212,184,0.18)' : 'none',
    outline: 'none', backgroundColor: 'rgba(44,44,46,0.88)', color: TEXT,
    fontFamily: 'inherit', transition: 'border 0.15s, box-shadow 0.15s', boxSizing: 'border-box' as const,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match.');
    if (password.length < 8) return toast.error('Password must be at least 8 characters.');
    if (!token) return toast.error('Invalid reset link. Please request a new one.');
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h2 style={{ color: TEXT, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Invalid reset link</h2>
          <p style={{ color: SEC, marginBottom: 24 }}>This link is invalid or has expired. Request a new one below.</p>
          <Link to="/forgot-password" style={{ background: ACCENT, color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 980, fontSize: 16 }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CapaLogo size={120} />
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.22em', color: ACCENT, textTransform: 'uppercase', margin: '6px 0 14px' }}>Unstoppable Minds</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, margin: '0 0 4px' }}>Set new password</h1>
          <p style={{ fontSize: 15, color: SEC, margin: 0 }}>Must be at least 8 characters</p>
        </div>

        <div style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: '28px 24px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6 }}>New password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('pass'), paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(235,235,245,0.4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6 }}>Confirm password</label>
              <input
                type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                style={inputStyle('confirm')}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: 12, backgroundColor: loading ? '#f0a060' : ACCENT, color: '#fff', border: 'none', fontSize: 17, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
