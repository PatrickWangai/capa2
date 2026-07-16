import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Shield, Bell, Lock, Smartphone, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { PageLoader } from '../components/ui';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

type Tab = 'security' | 'notifications' | 'account';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {children}
    </div>
  );
}

// ── Security tab ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const { user } = useAuthStore();
  const qc       = useQueryClient();

  // Change password
  const [oldPw,  setOldPw]  = useState('');
  const [newPw,  setNewPw]  = useState('');
  const [confPw, setConfPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  // 2FA / MFA
  const [mfaStep,   setMfaStep]   = useState<'idle'|'setup'|'verify'|'done'>('idle');
  const [mfaData,   setMfaData]   = useState<any>(null);
  const [mfaCode,   setMfaCode]   = useState('');
  const [mfaBusy,   setMfaBusy]   = useState(false);
  const [mfaDisBusy,setMfaDisBusy]= useState(false);

  const mfaEnabled = user?.mfaEnabled ?? false;

  const handleChangePassword = async () => {
    if (newPw !== confPw) return toast.error('Passwords do not match');
    if (newPw.length < 8) return toast.error('Password must be at least 8 characters');
    setPwBusy(true);
    try {
      await api.put('/api/auth/change-password', { currentPassword: oldPw, newPassword: newPw });
      toast.success('Password updated successfully');
      setOldPw(''); setNewPw(''); setConfPw('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally { setPwBusy(false); }
  };

  const handleSetupMfa = async () => {
    setMfaBusy(true);
    try {
      const { data } = await api.post('/api/auth/mfa/setup');
      setMfaData(data);
      setMfaStep('setup');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start 2FA setup');
    } finally { setMfaBusy(false); }
  };

  const handleVerifyMfa = async () => {
    if (!mfaCode || mfaCode.length !== 6) return toast.error('Enter the 6-digit code from your app');
    setMfaBusy(true);
    try {
      await api.post('/api/auth/mfa/verify', { token: mfaCode, secret: mfaData?.secret });
      toast.success('Two-factor authentication enabled!');
      setMfaStep('done');
      qc.invalidateQueries({ queryKey: ['auth-me'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid code — try again');
    } finally { setMfaBusy(false); }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(mfaData?.secret ?? '');
    toast.success('Secret copied');
  };

  return (
    <div className="space-y-4">
      {/* 2FA */}
      <Section title="Two-Factor Authentication">
        {mfaEnabled || mfaStep === 'done' ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={18} style={{ color: '#34d399' }} />
              <div>
                <p className="text-sm font-semibold text-white">2FA is enabled</p>
                <p className="text-xs text-gray-500">Your account is protected with an authenticator app.</p>
              </div>
            </div>
          </div>
        ) : mfaStep === 'idle' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              Protect your account with a one-time code from an authenticator app (Google Authenticator, Authy).
            </p>
            <button className="btn-primary" onClick={handleSetupMfa} disabled={mfaBusy}>
              {mfaBusy ? 'Setting up…' : 'Enable 2FA'}
            </button>
          </div>
        ) : mfaStep === 'setup' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
            </p>
            {mfaData?.qrCodeUrl && (
              <div className="flex justify-center">
                <img src={mfaData.qrCodeUrl} alt="QR Code" style={{ width: 180, height: 180, background: '#fff', borderRadius: 12, padding: 8 }} />
              </div>
            )}
            {mfaData?.secret && (
              <div className="rounded-xl p-3 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Manual entry key</p>
                  <p className="text-sm font-mono text-white tracking-widest">{mfaData.secret}</p>
                </div>
                <button onClick={copySecret} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <Copy size={14} className="text-gray-400" />
                </button>
              </div>
            )}
            <div>
              <label className="label">Verification Code</label>
              <input className="input text-center tracking-widest text-xl" maxLength={6}
                placeholder="000000" value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div className="flex gap-3">
              <button className="btn-primary flex-1" onClick={handleVerifyMfa} disabled={mfaBusy}>
                {mfaBusy ? 'Verifying…' : 'Verify & Enable'}
              </button>
              <button className="btn-secondary" onClick={() => { setMfaStep('idle'); setMfaData(null); setMfaCode(''); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </Section>

      {/* Change Password */}
      <Section title="Change Password">
        <div className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input className="input pr-10" type={showPw ? 'text' : 'password'}
                placeholder="Current password" value={oldPw} onChange={e => setOldPw(e.target.value)} />
              <button onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="At least 8 characters"
              value={newPw} onChange={e => setNewPw(e.target.value)} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" placeholder="Repeat new password"
              value={confPw} onChange={e => setConfPw(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={handleChangePassword} disabled={pwBusy || !oldPw || !newPw || !confPw}>
            {pwBusy ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </Section>

      {/* Active sessions */}
      <Section title="Active Sessions">
        <p className="text-sm text-gray-400">
          You are currently logged in. To log out all other devices, change your password.
        </p>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <CheckCircle size={16} style={{ color: '#34d399' }} />
          <span className="text-sm text-white">This device — current session</span>
        </div>
      </Section>
    </div>
  );
}

// ── Notifications tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    orderFilled:   true,
    priceAlerts:   true,
    deposits:      true,
    withdrawals:   true,
    kycUpdates:    true,
    dividends:     true,
    emailNotifs:   true,
    pushNotifs:    false,
    smsNotifs:     false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const ToggleRow = ({ label, desc, k }: { label: string; desc?: string; k: keyof typeof prefs }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      <button onClick={() => toggle(k)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        style={{ background: prefs[k] ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }}>
        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{ transform: prefs[k] ? 'translateX(24px)' : 'translateX(4px)' }} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Section title="Activity Notifications">
        <div className="space-y-4">
          <ToggleRow label="Order Filled"    desc="When your buy or sell order executes"    k="orderFilled" />
          <ToggleRow label="Price Alerts"    desc="When a stock hits your target price"     k="priceAlerts" />
          <ToggleRow label="Deposits"        desc="When a deposit is credited"              k="deposits" />
          <ToggleRow label="Withdrawals"     desc="When a withdrawal is processed"         k="withdrawals" />
          <ToggleRow label="KYC Updates"     desc="Updates to your identity verification"  k="kycUpdates" />
          <ToggleRow label="Dividends"       desc="When dividend payments are received"    k="dividends" />
        </div>
      </Section>
      <Section title="Delivery Channels">
        <div className="space-y-4">
          <ToggleRow label="In-App & Email" desc="Always on — required"                   k="emailNotifs" />
          <div className="flex items-center justify-between opacity-50">
            <div>
              <p className="text-sm font-medium text-white">Push Notifications</p>
              <p className="text-xs text-gray-500">Coming soon — requires mobile app</p>
            </div>
            <div className="h-6 w-11 rounded-full bg-white/10" />
          </div>
          <div className="flex items-center justify-between opacity-50">
            <div>
              <p className="text-sm font-medium text-white">SMS</p>
              <p className="text-xs text-gray-500">Coming soon — requires SMS provider</p>
            </div>
            <div className="h-6 w-11 rounded-full bg-white/10" />
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── Account tab ───────────────────────────────────────────────────────────────
function AccountTab() {
  return (
    <div className="space-y-4">
      <Section title="Data & Privacy">
        <p className="text-sm text-gray-400">
          You can request a copy of all your personal data or request account deletion.
          These requests are processed within 30 days in accordance with data protection law.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary text-sm">Request Data Export</button>
          <button className="text-sm px-4 py-2 rounded-xl font-semibold transition-all"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            Request Account Deletion
          </button>
        </div>
      </Section>
      <Section title="Legal">
        <div className="space-y-2">
          {[['Terms of Service', '/terms'], ['Privacy Policy', '/privacy']].map(([label, path]) => (
            <a key={path} href={path} target="_blank" rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-sm text-white">{label}</span>
              <span className="text-xs text-gray-500">→</span>
            </a>
          ))}
        </div>
      </Section>
      <Section title="App Info">
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between"><span>Version</span><span className="text-white">1.0.0</span></div>
          <div className="flex justify-between"><span>Environment</span><span className="text-white">Development</span></div>
        </div>
      </Section>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('security');

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'security',      label: 'Security',      icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell   },
    { id: 'account',       label: 'Account',       icon: Lock   },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1 text-sm">Security, notifications, and account preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
            style={{
              background: tab === id ? 'var(--accent)' : 'transparent',
              color:      tab === id ? 'var(--accent-text)' : 'rgba(255,255,255,0.55)',
            }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'security'      && <SecurityTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'account'       && <AccountTab />}
    </div>
  );
}
