import { useState } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User, Lock, Shield, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import CapaLogo from '../components/ui/CapaLogo';

const TEXT = 'var(--text)';
const SEC = 'var(--text-secondary)';
const ACCENT = 'var(--accent)';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 18, padding: 24, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)', marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 600, color: TEXT, letterSpacing: '-0.02em' }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, name, type = 'text', onChange, placeholder }: {
  label: string; value: string; name: string; type?: string;
  onChange: (name: string, value: string) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onChange={e => onChange(name, e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 15, border: `1px solid ${focused ? ACCENT : 'rgba(84,84,88,0.65)'}`, boxShadow: focused ? '0 0 0 3px rgba(var(--accent-rgb),0.18)' : 'none', outline: 'none', backgroundColor: 'rgba(44,44,46,0.88)', color: TEXT, fontFamily: 'inherit', transition: 'border 0.15s, box-shadow 0.15s', boxSizing: 'border-box' }}
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    dateOfBirth: '',
    addressLine1: '',
    city: '',
    postalCode: '',
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const setField = (name: string, value: string) => setProfile(p => ({ ...p, [name]: value }));
  const setPassField = (name: string, value: string) => setPasswords(p => ({ ...p, [name]: value }));

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/api/auth/profile', profile);
      // Update auth store with new name
      if (user) setAuth({ ...user, firstName: data.firstName, lastName: data.lastName }, accessToken!, refreshToken!);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSavingProfile(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('New passwords do not match');
    if (passwords.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setSavingPass(true);
    try {
      await api.put('/api/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally { setSavingPass(false); }
  };

  const resendVerification = async () => {
    try {
      await api.post('/api/auth/resend-verification');
      toast.success('Verification email sent — check your inbox');
    } catch {
      toast.error('Could not send verification email');
    }
  };

  const btnStyle = (loading: boolean): React.CSSProperties => ({
    padding: '11px 24px', borderRadius: 980, backgroundColor: loading ? 'var(--accent-dark)' : ACCENT,
    color: '#fff', border: 'none', fontSize: 15, fontWeight: 500,
    cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s', fontFamily: 'inherit',
  });

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CapaLogo size={44} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: SEC }}>{user?.email}</p>
        </div>
      </div>

      {/* Email verification banner */}
      {user?.status === 'PENDING' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: 'rgba(255,159,10,0.12)', border: '1px solid rgba(255,159,10,0.3)', borderRadius: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={18} color="#ffa00a" />
            <p style={{ margin: 0, fontSize: 14, color: '#ffa00a' }}>Please verify your email address to activate your account.</p>
          </div>
          <button onClick={resendVerification} style={{ fontSize: 13, color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0, whiteSpace: 'nowrap' }}>
            Resend
          </button>
        </div>
      )}

      {/* Personal info */}
      <Section title="Personal Information">
        <form onSubmit={saveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="First Name" name="firstName" value={profile.firstName} onChange={setField} />
            <Field label="Last Name" name="lastName" value={profile.lastName} onChange={setField} />
          </div>
          <Field label="Phone (optional)" name="phone" value={profile.phone} onChange={setField} placeholder="+254700000000" type="tel" />
          <Field label="Date of Birth" name="dateOfBirth" value={profile.dateOfBirth} onChange={setField} type="date" />
          <Field label="Address" name="addressLine1" value={profile.addressLine1} onChange={setField} placeholder="Street address" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="City" name="city" value={profile.city} onChange={setField} />
            <Field label="Postal Code" name="postalCode" value={profile.postalCode} onChange={setField} />
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit" disabled={savingProfile} style={btnStyle(savingProfile)}>
              {savingProfile ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Section>

      {/* Change password */}
      <Section title="Change Password">
        <form onSubmit={changePassword}>
          <Field label="Current Password" name="currentPassword" value={passwords.currentPassword} onChange={setPassField} type="password" placeholder="••••••••" />
          <Field label="New Password" name="newPassword" value={passwords.newPassword} onChange={setPassField} type="password" placeholder="Min. 8 characters" />
          <Field label="Confirm New Password" name="confirmPassword" value={passwords.confirmPassword} onChange={setPassField} type="password" placeholder="Repeat new password" />
          <div style={{ marginTop: 8 }}>
            <button type="submit" disabled={savingPass} style={btnStyle(savingPass)}>
              {savingPass ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* KYC status */}
      <Section title="Identity Verification (KYC)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={20} color={user?.kycStatus === 'APPROVED' ? '#30d158' : '#ffa00a'} />
            <div>
              <p style={{ margin: 0, fontSize: 15, color: TEXT, fontWeight: 500 }}>
                {user?.kycStatus === 'APPROVED' ? 'Identity Verified' : user?.kycStatus === 'PENDING' ? 'Under Review' : 'Not Verified'}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: SEC }}>
                {user?.kycStatus === 'APPROVED' ? 'You can trade and withdraw without restrictions.' : 'Complete verification to unlock all features.'}
              </p>
            </div>
          </div>
          {user?.kycStatus !== 'APPROVED' && (
            <a href="/kyc" style={{ padding: '9px 18px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Verify Now
            </a>
          )}
        </div>
      </Section>

      {/* Risk disclaimer */}
      <div style={{ padding: '14px 18px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, marginTop: 8 }}>
        <p style={{ margin: 0, fontSize: 12, color: SEC, lineHeight: 1.6 }}>
          <strong style={{ color: 'rgba(235,235,245,0.8)' }}>Risk Warning:</strong> Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results. Capa Investments Ltd is regulated. Capital at risk.
        </p>
      </div>
    </div>
  );
}
