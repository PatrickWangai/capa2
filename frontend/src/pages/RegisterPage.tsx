import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useAlertStore } from '../store/alertStore';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = 'var(--text)';
const SEC = 'var(--text-secondary)';
const ACCENT = 'var(--accent)';

const COUNTRIES = [
  { code: "KE", name: "Kenya" }, { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" }, { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" }, { code: "RW", name: "Rwanda" },
  { code: "NG", name: "Nigeria" }, { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" }, { code: "OTHER", name: "Other" },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "", country: "KE" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const showAlert = useAlertStore(s => s.show);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      showAlert({ variant: 'error', title: 'Password too short', message: 'Password must be at least 8 characters.' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", formData);
      setAuth(data.user, data.accessToken, data.refreshToken);
      showAlert({ variant: 'success', title: 'Account created!', message: "Welcome to Capa! Let's get you set up." });
      navigate("/onboarding");
    } catch (err: any) {
      showAlert({ variant: 'error', title: 'Registration failed', message: err.response?.data?.error || 'Please try again.' });
    } finally { setLoading(false); }
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 15,
    border: `1px solid ${focused === name ? ACCENT : 'rgba(84,84,88,0.65)'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(var(--accent-rgb),0.18)' : 'none',
    outline: 'none', backgroundColor: 'rgba(44,44,46,0.88)', color: TEXT,
    fontFamily: 'inherit', transition: 'border 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  });

  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6, letterSpacing: '-0.01em' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Back to home */}
      <Link to="/" style={{ position: 'fixed', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: SEC, textDecoration: 'none', padding: '7px 14px', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', transition: 'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.11)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}>
        ← Home
      </Link>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CapaLogo size={120} />
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, margin: '6px 0 4px' }}>Create your account</h1>
          <p style={{ fontSize: 15, color: SEC, margin: 0 }}>Start investing globally in minutes</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: 'rgba(10,10,12,0.82)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: 20, padding: '28px 24px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={lbl}>First Name</label>
                <input style={inputStyle('firstName')} placeholder="Jane" required
                  value={formData.firstName} onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)} onChange={set('firstName')} />
              </div>
              <div>
                <label style={lbl}>Last Name</label>
                <input style={inputStyle('lastName')} placeholder="Doe" required
                  value={formData.lastName} onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)} onChange={set('lastName')} />
              </div>
            </div>

            <div>
              <label style={lbl}>Email</label>
              <input style={inputStyle('email')} type="email" placeholder="jane@example.com" required
                value={formData.email} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} onChange={set('email')} />
            </div>

            <div>
              <label style={lbl}>Phone <span style={{ color: 'rgba(235,235,245,0.3)' }}>(optional)</span></label>
              <input style={inputStyle('phone')} type="tel" placeholder="+254700000000"
                value={formData.phone} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} onChange={set('phone')} />
            </div>

            <div>
              <label style={lbl}>Country</label>
              <select style={{ ...inputStyle('country'), appearance: 'auto' }}
                value={formData.country} onFocus={() => setFocused('country')} onBlur={() => setFocused(null)} onChange={set('country')}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={lbl}>Password</label>
              <input style={inputStyle('password')} type="password" placeholder="Min. 8 characters" required minLength={8}
                value={formData.password} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} onChange={set('password')} />
            </div>

            <button type="submit" disabled={loading} style={{ marginTop: 6, width: '100%', padding: '13px', borderRadius: 12, backgroundColor: loading ? 'var(--accent-dark)' : ACCENT, color: '#fff', border: 'none', fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: SEC }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
