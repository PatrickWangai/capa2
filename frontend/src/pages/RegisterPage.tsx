import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import CapaLogo from '../components/ui/CapaLogo';

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

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition text-sm";
  const labelClass = "block text-xs font-medium text-gray-400 mb-1.5";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-10">
        <CapaLogo className="text-white h-14 w-auto" />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-white text-center mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Start investing globally in minutes</p>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name</label>
                <input className={inputClass} placeholder="Jane" required value={formData.firstName} onChange={set('firstName')} />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input className={inputClass} placeholder="Doe" required value={formData.lastName} onChange={set('lastName')} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" placeholder="jane@example.com" required value={formData.email} onChange={set('email')} />
            </div>
            <div>
              <label className={labelClass}>Phone <span className="text-gray-600">(optional)</span></label>
              <input className={inputClass} type="tel" placeholder="+254700000000" value={formData.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className={labelClass}>Country of Residence</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition text-sm"
                value={formData.country} onChange={set('country')}
              >
                {COUNTRIES.map((c) => (<option key={c.code} value={c.code} className="bg-gray-900">{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input className={inputClass} type="password" placeholder="Min. 8 characters" required minLength={8}
                value={formData.password} onChange={set('password')} />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-1"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:text-gray-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
