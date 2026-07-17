import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User, Lock, Shield, Mail, Phone, MapPin, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/ui';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-white flex items-center gap-2 mb-5">
        <Icon size={16} style={{ color: 'var(--accent)' }} />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     '',
    dateOfBirth: '',
    addressLine1: '',
    city:       '',
    postalCode: '',
    taxId:      '',
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass,    setSavingPass]    = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['profile-full'],
    queryFn: () => api.get('/api/users/me').then(r => r.data),
    retry: false,
  });

  useEffect(() => {
    if (!profileLoaded && profileData?.user) {
      const u = profileData.user;
      setProfile(p => ({
        ...p,
        phone:        u.phone        || '',
        dateOfBirth:  u.dateOfBirth  ? u.dateOfBirth.slice(0, 10) : '',
        addressLine1: u.addressLine1 || '',
        city:         u.city         || '',
        postalCode:   u.postalCode   || '',
        taxId:        u.taxId        || '',
      }));
      setProfileLoaded(true);
    }
  }, [profileData, profileLoaded]);

  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    retry: false,
  });

  const account   = portfolioData?.account;
  const positions = portfolioData?.positions ?? [];
  const summary   = portfolioData?.summary;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/api/auth/profile', profile);
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
      await api.put('/api/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
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

  const kycVariant = user?.kycStatus === 'APPROVED' ? 'green' : user?.kycStatus === 'PENDING' ? 'yellow' : 'red';
  const kycLabel   = user?.kycStatus === 'APPROVED' ? 'Verified' : user?.kycStatus === 'PENDING' ? 'Under Review' : 'Not Verified';

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header card */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', color: 'var(--accent-text)' }}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
            <Badge variant={kycVariant}>{kycLabel}</Badge>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
          {account && (
            <p className="text-xs text-gray-500 mt-1">Account {account.accountNumber} · {account.baseCurrency}</p>
          )}
        </div>
      </div>

      {/* Email verification banner */}
      {user?.status === 'PENDING' && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-yellow-700/40 bg-yellow-900/20">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-yellow-400 shrink-0" />
            <p className="text-sm text-yellow-300">Please verify your email address to activate your account.</p>
          </div>
          <button onClick={resendVerification} className="text-xs font-semibold whitespace-nowrap"
            style={{ color: 'var(--accent)' }}>
            Resend
          </button>
        </div>
      )}

      {/* Account stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Portfolio Value', value: `$${Number(summary.totalValue || 0).toFixed(2)}` },
            { label: 'Total P&L',       value: `${Number(summary.totalGainLoss || 0) >= 0 ? '+' : ''}$${Number(summary.totalGainLoss || 0).toFixed(2)}`, positive: Number(summary.totalGainLoss || 0) >= 0 },
            { label: 'Positions',       value: String(positions.length) },
          ].map(({ label, value, positive }) => (
            <div key={label} className="card" style={{ padding: '14px 18px' }}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={clsx('text-base font-bold mt-1', positive === true ? 'text-green-400' : positive === false ? 'text-red-400' : 'text-white')}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* KRA PIN banner */}
      {!profile.taxId && profileLoaded && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-orange-700/40 bg-orange-900/20">
          <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-300">KRA PIN required to trade</p>
            <p className="text-xs text-orange-400/80 mt-0.5">Add your Kenya Revenue Authority PIN below to unlock buying and selling.</p>
          </div>
        </div>
      )}

      {/* Personal info */}
      <SectionCard title="Personal Information" icon={User}>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First Name</label>
              <input className="input" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Phone size={12} /> Phone (optional)</label>
            <input className="input" type="tel" placeholder="+254700000000" value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Calendar size={12} /> Date of Birth</label>
            <input className="input" type="date" value={profile.dateOfBirth}
              onChange={e => setProfile(p => ({ ...p, dateOfBirth: e.target.value }))} />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><MapPin size={12} /> Address</label>
            <input className="input" placeholder="Street address" value={profile.addressLine1}
              onChange={e => setProfile(p => ({ ...p, addressLine1: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">City</label>
              <input className="input" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input className="input" value={profile.postalCode} onChange={e => setProfile(p => ({ ...p, postalCode: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label flex items-center gap-1.5">
              <Shield size={12} />
              KRA PIN
              <span className="text-orange-400 text-xs font-semibold ml-1">Required to trade</span>
            </label>
            <input
              className="input"
              placeholder="e.g. A012345678Z"
              value={profile.taxId}
              onChange={e => setProfile(p => ({ ...p, taxId: e.target.value.toUpperCase() }))}
              style={!profile.taxId ? { borderColor: 'rgba(249,115,22,0.5)' } : {}}
            />
            <p className="text-xs text-gray-500 mt-1">Your Kenya Revenue Authority Personal Identification Number.</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary" style={{ fontSize: 14, padding: '10px 24px' }}>
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </SectionCard>

      {/* Change password */}
      <SectionCard title="Change Password" icon={Lock}>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" placeholder="••••••••" value={passwords.currentPassword}
              onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="Min. 8 characters" value={passwords.newPassword}
              onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" placeholder="Repeat new password" value={passwords.confirmPassword}
              onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
          </div>
          <button type="submit" disabled={savingPass} className="btn-primary" style={{ fontSize: 14, padding: '10px 24px' }}>
            {savingPass ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      </SectionCard>

      {/* KYC status */}
      <SectionCard title="Identity Verification" icon={Shield}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className={user?.kycStatus === 'APPROVED' ? 'text-green-400' : 'text-yellow-400'} />
              <p className="font-medium text-white">
                {user?.kycStatus === 'APPROVED' ? 'Identity Verified' : user?.kycStatus === 'PENDING' ? 'Under Review' : 'Not Verified'}
              </p>
            </div>
            <p className="text-sm text-gray-400">
              {user?.kycStatus === 'APPROVED'
                ? 'You can trade and withdraw without restrictions.'
                : user?.kycStatus === 'PENDING'
                  ? 'Review typically takes 1-2 business days.'
                  : 'Complete verification to unlock deposits, trading and withdrawals.'}
            </p>
          </div>
          {user?.kycStatus !== 'APPROVED' && (
            <Link to="/kyc" className="btn-primary whitespace-nowrap" style={{ fontSize: 13, padding: '9px 18px' }}>
              {user?.kycStatus === 'PENDING' ? 'View Status' : 'Verify Now'}
            </Link>
          )}
        </div>
      </SectionCard>

      {/* Risk disclaimer */}
      <div className="text-xs text-gray-500 leading-relaxed px-1 pb-4">
        <strong className="text-gray-400">Risk Warning:</strong> Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results. Capital at risk.
      </div>
    </div>
  );
}
