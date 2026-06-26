import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";


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

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 mb-4">
            {/* Logo removed */}
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-1">
            Start investing globally in minutes
          </p>
        </div>

        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input className="input" placeholder="Jane" required value={formData.firstName} onChange={set('firstName')} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" placeholder="Doe" required value={formData.lastName} onChange={set('lastName')} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="jane@example.com" required value={formData.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input className="input" type="tel" placeholder="+254700000000" value={formData.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label">Country of Residence</label>
              <select className="input" value={formData.country} onChange={set('country')}>
                {COUNTRIES.map((c) => (<option key={c.code} value={c.code}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min. 8 characters" required minLength={8}
                value={formData.password} onChange={set('password')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}