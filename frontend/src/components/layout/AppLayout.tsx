import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowDownUp, Bell,
  CreditCard, ShieldCheck, LogOut, Menu, User, ShieldAlert, X, Palette
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import CapaLogo from '../ui/CapaLogo';
import { useTheme, THEMES, type ThemeName } from '../../context/ThemeContext';

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
  const [open, setOpen]           = useState(false);
  const [paletteOpen, setPalette] = useState(false);
  const { theme, setTheme }       = useTheme();

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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-gradient)' }}>
      {/* Mobile nav overlay */}
      {open && (
        <div className="fixed inset-0 z-20 lg:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)} />
      )}

      {/* Customizations drawer overlay */}
      {paletteOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          onClick={() => setPalette(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, right: 0, width: 300, height: '100%',
              backgroundColor: 'rgba(8,16,40,0.97)',
              backdropFilter: 'saturate(180%) blur(32px)',
              WebkitBackdropFilter: 'saturate(180%) blur(32px)',
              borderLeft: '1px solid rgba(255,255,255,0.10)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                Customizations
              </span>
              <button onClick={() => setPalette(false)} style={{ color: 'rgba(235,235,245,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            {/* Colour theme grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(235,235,245,0.38)', letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 16px' }}>Colour Theme</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(Object.entries(THEMES) as [ThemeName, typeof THEMES[ThemeName]][]).map(([name, t]) => {
                  const active = theme === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setTheme(name)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                        padding: '12px 6px', borderRadius: 14,
                        backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                        border: active ? `1.5px solid ${t.swatch}` : '1.5px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', background: t.swatch,
                        boxShadow: active ? `0 0 0 2.5px #fff, 0 0 0 4.5px ${t.swatch}` : `0 2px 8px rgba(0,0,0,0.35)`,
                        transition: 'box-shadow 0.15s',
                      }} />
                      <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(235,235,245,0.45)', letterSpacing: '0.02em' }}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <CapaLogo size={44} />
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
                backgroundColor: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'rgba(235,235,245,0.85)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                  {label === 'Verification' && kycBadge && (
                    <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Customizations */}
          <button
            onClick={() => { setPalette(true); setOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '9px 12px', borderRadius: 10, marginTop: 2,
              fontSize: 15, fontWeight: 500, background: 'none', border: 'none',
              cursor: 'pointer', color: 'rgba(235,235,245,0.85)', transition: 'background 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Palette size={18} strokeWidth={1.8} />
            Customizations
          </button>
        </nav>

        {/* User */}
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
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
          <CapaLogo size={40} />
          <div style={{ width: 20 }} />
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
