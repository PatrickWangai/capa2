import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import OrangeIcon from '../components/ui/OrangeIcon';

const COUNTRIES = [
  { code: "KE", name: "Kenya" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" },
  { code: "RW", name: "Rwanda" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
  { code: "OTHER", name: "Other" },
];

const baseInput = {
  backgroundColor: '#141414',
  borderColor: 'rgba(255,255,255,0.10)',
  color: '#fff',
};
const focusInput = {
  borderColor: '#f5821f',
  boxShadow: '0 0 0 2px rgba(245,130,31,0.18)',
  outline: 'none',
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "", password: "", firstName: "", lastName: "", phone: "", country: "KE",
  });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters.");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", formData);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success("Account created! Complete KYC to start investing.");
      navigate("/kyc");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (name: string) => ({
    ...baseInput,
    ...(focused === name ? focusInput : {}),
  });

  const cls = 'w-full rounded-lg px-3 py-2.5 text-sm placeholder-gray-600 transition border focus:outline-none';
  const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 6 };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-10" style={{ backgroundColor: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>

      {/* Glowing orange blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '10%',  width: 600, height: 600, borderRadius: '50%', background: 'rgba(245,130,31,0.12)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,69,0,0.09)',   filter: 'blur(100px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Floating orange */}
        <div className="orange-float" style={{ marginBottom: 20 }}>
          <OrangeIcon size={80} />
        </div>

        <h1 className="text-xl font-semibold text-white text-center mb-1">Create your account</h1>
        <p className="text-sm text-center mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Start investing globally in minutes</p>

        <div className="w-full rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: '#0f0f0f', border: '1px solid rgba(255,255,255,0.10)' }}>
          <form onSubmit={submit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={lbl}>First Name</label>
                <input className={cls} placeholder="Jane" required
                  style={fieldStyle('firstName')}
                  onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)}
                  value={formData.firstName} onChange={set('firstName')} />
              </div>
              <div>
                <label style={lbl}>Last Name</label>
                <input className={cls} placeholder="Doe" required
                  style={fieldStyle('lastName')}
                  onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)}
                  value={formData.lastName} onChange={set('lastName')} />
              </div>
            </div>

            <div>
              <label style={lbl}>Email</label>
              <input className={cls} type="email" placeholder="jane@example.com" required
                style={fieldStyle('email')}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                value={formData.email} onChange={set('email')} />
            </div>

            <div>
              <label style={lbl}>Phone <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span></label>
              <input className={cls} type="tel" placeholder="+254700000000"
                style={fieldStyle('phone')}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                value={formData.phone} onChange={set('phone')} />
            </div>

            <div>
              <label style={lbl}>Country of Residence</label>
              <select className={cls}
                style={fieldStyle('country')}
                onFocus={() => setFocused('country')} onBlur={() => setFocused(null)}
                value={formData.country} onChange={set('country')}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} style={{ backgroundColor: '#1a1410' }}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={lbl}>Password</label>
              <input className={cls} type="password" placeholder="Min. 8 characters" required minLength={8}
                style={fieldStyle('password')}
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                value={formData.password} onChange={set('password')} />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              style={{ background: 'linear-gradient(135deg, #f5821f, #ff4500)' }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium" style={{ color: '#f5821f' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
