import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useAlertStore } from '../store/alertStore';

const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';
const ACCENT = 'var(--primary)';

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
    width: '100%', padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: 15,
    border: `2px solid ${focused === name ? ACCENT : 'var(--input)'}`,
    outline: 'none', backgroundColor: 'var(--card)', color: TEXT,
    fontFamily: 'var(--font-sans)', transition: 'border 0.15s',
    boxSizing: 'border-box',
  });

  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: SEC, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: 'var(--font-sans)' }}>

      {/* Back to home */}
      <Link to="/" style={{ position: 'fixed', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: SEC, textDecoration: 'none', padding: '7px 14px', borderRadius: 'var(--radius)', backgroundColor: 'var(--card)', border: '2px solid var(--foreground)', transition: 'background 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--secondary)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--card)')}>
        ← Home
      </Link>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: TEXT, margin: '6px 0 4px' }}>Create your account</h1>
          <p style={{ fontSize: 14, color: SEC, margin: 0 }}>Start investing globally in minutes</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: 'var(--card)', borderRadius: 'var(--radius)', padding: '28px 24px', border: '2px solid var(--foreground)' }}>
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
              <label style={lbl}>Phone <span style={{ color: 'var(--muted-foreground)', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
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

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 6, width: '100%', padding: '13px', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: SEC }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: ACCENT, textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
