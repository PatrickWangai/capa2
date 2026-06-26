import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import CapaIcon from '../components/ui/CapaIcon';

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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    country: "KE",
  });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters.");
    }
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

  const inputCls = [
    'w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 transition',
    'bg-[#1f3a30] border border-[#2a4a3c]',
    'focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
  ].join(' ');

  const selectCls = [
    'w-full rounded-lg px-3 py-2.5 text-sm text-white transition',
    'bg-[#1f3a30] border border-[#2a4a3c]',
    'focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
  ].join(' ');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-10" style={{ backgroundColor: '#152921' }}>
      <div className="mb-8">
        <CapaIcon className="h-20 w-20" />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-white text-center mb-1">Create your account</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Start investing globally in minutes</p>

        <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#1a3028', borderColor: '#2a4a3c' }}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">First Name</label>
                <input className={inputCls} placeholder="Jane" required value={formData.firstName} onChange={set('firstName')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Last Name</label>
                <input className={inputCls} placeholder="Doe" required value={formData.lastName} onChange={set('lastName')} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <input className={inputCls} type="email" placeholder="jane@example.com" required value={formData.email} onChange={set('email')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Phone <span className="text-gray-600">(optional)</span>
              </label>
              <input className={inputCls} type="tel" placeholder="+254700000000" value={formData.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Country of Residence</label>
              <select className={selectCls} value={formData.country} onChange={set('country')}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} style={{ backgroundColor: '#1a3028' }}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <input className={inputCls} type="password" placeholder="Min. 8 characters" required minLength={8}
                value={formData.password} onChange={set('password')} />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium" style={{ color: '#c084fc' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
