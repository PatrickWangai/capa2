import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowDownUp, Bell,
  CreditCard, ShieldCheck, LogOut, User, ShieldAlert, X, Palette, Search,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CapaLogo from '../ui/CapaLogo';
import { useTheme, THEMES, COLOUR_THEMES } from '../../context/ThemeContext';
import { SearchPalette } from './SearchPalette';

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
  const [paletteOpen, setPalette] = useState(false);
  const [searchOpen, setSearch] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    api.get('/api/auth/me').then(r => {
      if (r.data?.user && accessToken && refreshToken) {
        setAuth(r.data.user, accessToken, refreshToken);
      }
    }).catch(() => {});
  }, []);

  // Cmd+K / Ctrl+K → open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const closeMobile = () => {};

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  const kycBadge = user?.kycStatus !== 'APPROVED';

  const sidebarBorder  = 'rgba(255,255,255,0.10)';
  const navInactive    = 'var(--nav-text)';
  const drawerBg       = 'rgba(8,16,40,0.97)';
  const drawerBorder   = 'rgba(255,255,255,0.10)';
  const drawerHeadText = '#ffffff';
  const drawerLabelClr = 'rgba(235,235,245,0.38)';
  const drawerCloseClr = 'rgba(235,235,245,0.5)';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${sidebarBorder}` }}>
        <CapaLogo size={44} />
      </div>

      {/* Search button */}
      <div style={{ padding: '10px 12px 4px' }}>
        <button
          onClick={() => { setSearch(true); closeMobile(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '8px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(235,235,245,0.5)', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 14, textAlign: 'left', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(235,235,245,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(235,235,245,0.5)'; }}
        >
          <Search size={15} />
          <span style={{ flex: 1 }}>Search stocks…</span>
          <kbd style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(235,235,245,0.4)' }}>⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        {user?.adminRole && (
          <NavLink
            to="/admin/dashboard"
            onClick={closeMobile}
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
            onClick={closeMobile}
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
            cursor: 'pointer', color: navInactive, transition: 'background 0.15s', textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Palette size={18} strokeWidth={1.8} />
          Customizations
        </button>
      </nav>

      {/* User panel */}
      <div style={{ padding: 12, borderTop: `1px solid ${sidebarBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-text)', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ color: '#aeaeb2', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff3b30')}
            onMouseLeave={e => (e.currentTarget.style.color = '#aeaeb2')}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-gradient)' }}>

      {/* ── Search Palette ── */}
      <SearchPalette open={searchOpen} onClose={() => setSearch(false)} />

      {/* ── Customizations Drawer ── */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${drawerBorder}` }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: drawerHeadText }}>Customizations</span>
              <button onClick={() => setPalette(false)} style={{ color: drawerCloseClr, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: drawerLabelClr, letterSpacing: '0.10em', textTransform: 'uppercase', margin: '0 0 12px' }}>Appearance</p>
              <div style={{ marginBottom: 24 }}>
                <button
                  onClick={() => setTheme('black')}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '14px 10px', borderRadius: 16, cursor: 'pointer', width: '48%',
                    backgroundColor: theme === 'black' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                    border: theme === 'black' ? '2px solid #f5f5f7' : '1.5px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 60, height: 36, borderRadius: 10, background: '#181818', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 28, height: 14, borderRadius: 4, background: '#f5f5f7', opacity: 0.25 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: theme === 'black' ? 600 : 500, color: theme === 'black' ? '#f5f5f7' : drawerLabelClr }}>Black</span>
                </button>
              </div>

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
                        backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                        border: active ? `1.5px solid ${t.swatch}` : '1.5px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.swatch, boxShadow: active ? `0 0 0 2.5px #fff, 0 0 0 4.5px ${t.swatch}` : '0 2px 8px rgba(0,0,0,0.35)', transition: 'box-shadow 0.15s' }} />
                      <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#fff' : drawerLabelClr, letterSpacing: '0.02em' }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar — always visible ── */}
      <aside
        style={{
          width: 256,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: 'var(--sidebar-bg)',
          backdropFilter: 'saturate(160%) blur(28px)',
          WebkitBackdropFilter: 'saturate(160%) blur(28px)',
          borderRight: `1px solid ${sidebarBorder}`,
          boxShadow: '1px 0 0 rgba(0,0,0,0.08)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            background: 'var(--bg-gradient)',
            backgroundAttachment: 'fixed',
          }}
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
}
