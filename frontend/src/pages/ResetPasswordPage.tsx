import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';
const ACCENT = 'var(--primary)';

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
    width: '100%', padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: 15,
    border: `2px solid ${focused === name ? ACCENT : 'var(--input)'}`,
    outline: 'none', backgroundColor: 'var(--card)', color: TEXT,
    fontFamily: 'var(--font-sans)', transition: 'border 0.15s', boxSizing: 'border-box' as const,
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
      <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-sans)' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: TEXT, fontSize: 20, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>Invalid reset link</h2>
          <p style={{ color: SEC, marginBottom: 24 }}>This link is invalid or has expired. Request a new one below.</p>
          <Link to="/forgot-password" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '12px 28px', fontSize: 14 }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: TEXT, margin: '6px 0 4px' }}>Set new password</h1>
          <p style={{ fontSize: 14, color: SEC, margin: 0 }}>Must be at least 8 characters</p>
        </div>

        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', padding: '28px 24px', border: '2px solid var(--foreground)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: SEC, marginBottom: 6 }}>New password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('pass'), paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: SEC, marginBottom: 6 }}>Confirm password</label>
              <input
                type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                style={inputStyle('confirm')}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
