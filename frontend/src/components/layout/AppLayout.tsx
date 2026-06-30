import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowDownUp, Bell,
  CreditCard, ShieldCheck, LogOut, User, ShieldAlert, X, Palette,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CapaLogo from '../ui/CapaLogo';
import { useTheme, THEMES, COLOUR_THEMES, type ThemeName } from '../../context/ThemeContext';

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

const APPEARANCES: { name: ThemeName; label: string; bg: string; fg: string }[] = [
  { name: 'white', label: 'White', bg: '#f5f5f7', fg: '#1d1d1f' },
  { name: 'black', label: 'Black', bg: '#181818', fg: '#f5f5f7' },
];

export default function AppLayout() {
  const { user, logout, setAuth, accessToken, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const [paletteOpen, setPalette] = useState(false);
  const { theme, setTheme }       = useTheme();
  const isLight = THEMES[theme]?.isLight ?? false;

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

  // Adaptive colours driven by CSS vars (updated by ThemeContext)
  const sidebarBorder  = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.10)';
  const navInactive    = 'var(--nav-text)';
  const drawerBg       = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(8,16,40,0.97)';
  const drawerBorder   = isLight ? 'rgba(0,0,0,0.08)'       : 'rgba(255,255,255,0.10)';
  const drawerHeadText = isLight ? '#1d1d1f'                 : '#ffffff';
  const drawerLabelClr = isLight ? 'rgba(0,0,0,0.38)'       : 'rgba(235,235,245,0.38)';
  const drawerCloseClr = isLight ? 'rgba(0,0,0,0.35)'       : 'rgba(235,235,245,0.5)';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-gradient)' }}>

      {/* ── Customizations drawer ── */}
      {paletteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setPalette(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 0, right: 0, width: 300, height: '100%',
              backgroundColor: drawerBg,
              backdropFilter: 'saturate(180%) blur(32px)',
              WebkitBackdropFilter: 'saturate(180%) blur(32px)',
              borderLeft: `1px solid ${drawerBorder}`,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${drawerBorder}` }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: drawerHeadText }}>Customizations</span>
              <button onClick={() => setPalette(false)} style={{ color: drawerCloseClr, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

              {/* ── Appearance (Black / White) ── */}
              <p style={{ fontSize: 11, fontWeight: 600, color: drawerLabelClr, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 12px' }}>Appearance</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                {APPEARANCES.map(({ name, label, bg, fg }) => {
                  const active = theme === name;
                  const isLightCard = name === 'white';
                  const activeBorder = isLightCard ? '#0071e3' : '#f5f5f7';
                  return (
                    <button
                      key={name}
                      onClick={() => setTheme(name)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '14px 10px', borderRadius: 16, cursor: 'pointer',
                        backgroundColor: active
                          ? (isLightCard ? 'rgba(0,113,227,0.08)' : 'rgba(255,255,255,0.08)')
                          : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'),
                        border: active
                          ? `2px solid ${activeBorder}`
                          : `1.5px solid ${isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'; }}
                    >
                      {/* Colour preview swatch */}
                      <div style={{
                        width: 60, height: 36, borderRadius: 10,
                        background: bg,
                        border: `1px solid ${isLightCard ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.10)'}`,
                        boxShadow: active ? `0 0 0 2px ${activeBorder}` : '0 1px 4px rgba(0,0,0,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ width: 28, height: 14, borderRadius: 4, background: fg, opacity: 0.25 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: active ? 600 : 500, color: active ? activeBorder : drawerLabelClr }}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Colour Theme ── */}
              <p style={{ fontSize: 11, fontWeight: 600, color: drawerLabelClr, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 12px' }}>Colour Theme</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {COLOUR_THEMES.map(name => {
                  const t = THEMES[name];
                  const active = theme === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setTheme(name)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                        padding: '12px 6px', borderRadius: 14,
                        backgroundColor: active
                          ? (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)')
                          : 'transparent',
                        border: active
                          ? `1.5px solid ${t.swatch}`
                          : `1.5px solid ${isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', background: t.swatch,
                        boxShadow: active ? `0 0 0 2.5px ${isLight ? '#fff' : '#fff'}, 0 0 0 4.5px ${t.swatch}` : '0 2px 8px rgba(0,0,0,0.35)',
                        transition: 'box-shadow 0.15s',
                      }} />
                      <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? (isLight ? '#1d1d1f' : '#fff') : drawerLabelClr, letterSpacing: '0.02em' }}>
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

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column',
          height: '100vh', overflowY: 'auto',
          backgroundColor: 'var(--sidebar-bg)',
          backdropFilter: 'saturate(160%) blur(28px)',
          WebkitBackdropFilter: 'saturate(160%) blur(28px)',
          borderRight: `1px solid ${sidebarBorder}`,
          boxShadow: '1px 0 0 rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${sidebarBorder}` }}>
          <CapaLogo size={44} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
          {user?.adminRole && (
            <NavLink
              to="/admin/dashboard"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                transition: 'background 0.15s',
                backgroundColor: isActive ? 'rgba(168,85,247,0.15)' : 'transparent',
                color: isActive ? '#c084fc' : navInactive,
              })}
            >
              {({ isActive }) => <><ShieldAlert size={18} strokeWidth={isActive ? 2.2 : 1.8} />Admin</>}
            </NavLink>
          )}
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                transition: 'background 0.15s',
                backgroundColor: isActive ? 'var(--accent-dim)' : 'transparent',
                color: isActive ? 'var(--accent)' : navInactive,
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
            onClick={() => setPalette(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '9px 12px', borderRadius: 10, marginTop: 2,
              fontSize: 15, fontWeight: 500, background: 'none', border: 'none',
              cursor: 'pointer', color: navInactive, transition: 'background 0.15s',
              textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Palette size={18} strokeWidth={1.8} />
            Customizations
          </button>
        </nav>

        {/* User panel */}
        <div style={{ padding: 12, borderTop: `1px solid ${sidebarBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-text)', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              style={{ color: isLight ? '#86868b' : '#aeaeb2', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff3b30')}
              onMouseLeave={e => (e.currentTarget.style.color = isLight ? '#86868b' : '#aeaeb2')}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}>
        <Outlet />
      </main>
    </div>
  );
}
