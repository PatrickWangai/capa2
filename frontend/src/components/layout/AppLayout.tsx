import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowDownUp, Bell,
  CreditCard, ShieldCheck, LogOut, Menu, User, ShieldAlert
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import CapaCIcon from '../ui/CapaCIcon';


const nav = [
  { to: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/markets',       label: 'Markets',      icon: TrendingUp },
  { to: '/portfolio',     label: 'Portfolio',    icon: Briefcase },
  { to: '/orders',        label: 'Orders',       icon: ArrowDownUp },
  { to: '/deposit',       label: 'Deposit',      icon: CreditCard },
  { to: '/notifications', label: 'Alerts',       icon: Bell },
  { to: '/kyc',           label: 'Verification', icon: ShieldCheck },
  { to: '/profile',       label: 'Profile',      icon: User },
];

export default function AppLayout() {
  const { user, logout, setAuth, accessToken, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Refresh user profile on mount so adminRole is always up to date
  // even for sessions that predate the adminRole field being added.
  useEffect(() => {
    api.get('/api/auth/me').then(r => {
      if (r.data?.user && accessToken && refreshToken) {
        setAuth(r.data.user, accessToken, refreshToken);
      }
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const kycBadge = user?.kycStatus !== 'APPROVED';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'linear-gradient(160deg, #082e3c 0%, #0c5260 18%, #0f8878 45%, #18c0a8 72%, #2acfbc 88%, #1aaa96 100%)' }}>
      {open && (
        <div className="fixed inset-0 z-20 lg:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)} />
      )}

      {/* Sidebar — Apple frosted glass */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          backgroundColor: 'rgba(6,38,52,0.62)',
          backdropFilter: 'saturate(160%) blur(28px)',
          WebkitBackdropFilter: 'saturate(160%) blur(28px)',
          borderRight: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '1px 0 0 rgba(0,0,0,0.2)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <CapaCIcon size={40} />
          <span style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>Capa</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {user?.adminRole && (
            <NavLink
              to="/admin/dashboard"
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                transition: 'background 0.15s',
                backgroundColor: isActive ? 'rgba(168,85,247,0.15)' : 'transparent',
                color: isActive ? '#c084fc' : 'rgba(235,235,245,0.85)',
              })}
            >
              {({ isActive }) => <><ShieldAlert size={18} strokeWidth={isActive ? 2.2 : 1.8} />Admin</>}
            </NavLink>
          )}
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => clsx('flex items-center gap-3 rounded-xl text-sm font-medium transition-colors', isActive ? '' : '')}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                transition: 'background 0.15s',
                backgroundColor: isActive ? 'rgba(32,212,184,0.18)' : 'transparent',
                color: isActive ? '#20d4b8' : 'rgba(235,235,245,0.85)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                  {label === 'Verification' && kycBadge && (
                    <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#20d4b8' }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#20d4b8,#0fa8a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: 11, color: 'rgba(235,235,245,0.6)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <button onClick={handleLogout} style={{ color: '#aeaeb2', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff3b30')}
              onMouseLeave={e => (e.currentTarget.style.color = '#aeaeb2')}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile top bar */}
        <header className="lg:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44, padding: '0 16px', backgroundColor: 'rgba(6,38,52,0.62)', backdropFilter: 'saturate(160%) blur(28px)', WebkitBackdropFilter: 'saturate(160%) blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <button onClick={() => setOpen(true)} style={{ color: '#ffffff', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <Menu size={20} />
          </button>
          <CapaCIcon size={32} />
          <div style={{ width: 20 }} />
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'linear-gradient(160deg, #082e3c 0%, #0c5260 18%, #0f8878 45%, #18c0a8 72%, #2acfbc 88%, #1aaa96 100%)', backgroundAttachment: 'fixed' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
