import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowDownUp, Bell,
  ShieldCheck, LogOut, User, ShieldAlert, X, Palette, Search, Menu, Wallet,
  Star, Settings, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import CapaLogo from '../ui/CapaLogo';
import { useTheme, THEMES, COLOUR_THEMES } from '../../context/ThemeContext';
import { SearchPalette } from './SearchPalette';

const nav = [
  { to: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/markets',       label: 'Markets',      icon: TrendingUp },
  { to: '/portfolio',     label: 'Portfolio',    icon: Briefcase },
  { to: '/orders',        label: 'Orders',       icon: ArrowDownUp },
  { to: '/wallet',        label: 'Wallet',       icon: Wallet },
  { to: '/watchlist',     label: 'Watchlist',    icon: Star },
  { to: '/notifications', label: 'Alerts',       icon: Bell },
  { to: '/kyc',           label: 'Verification', icon: ShieldCheck },
  { to: '/profile',       label: 'Profile',      icon: User },
  { to: '/settings',      label: 'Settings',     icon: Settings },
];

export default function AppLayout() {
  const { user, logout, setAuth, accessToken, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const [paletteOpen, setPalette] = useState(false);
  const [searchOpen, setSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    api.get('/api/auth/me').then(r => {
      if (r.data?.user && accessToken && refreshToken) {
        setAuth(r.data.user, accessToken, refreshToken);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    logout();
    navigate('/');
  };

  const kycBadge = user?.kycStatus !== 'APPROVED';

  const sidebarBorder  = 'rgba(255,255,255,0.10)';
  const navInactive    = 'var(--nav-text)';
  const drawerBg       = 'rgba(8,16,40,0.97)';
  const drawerBorder   = 'rgba(255,255,255,0.10)';
  const drawerHeadText = '#ffffff';
  const drawerLabelClr = 'rgba(235,235,245,0.38)';
  const drawerCloseClr = 'rgba(235,235,245,0.5)';

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

      {/* ── Desktop sidebar (hidden on mobile) ── */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 64 : 256, flexShrink: 0, display: 'flex', flexDirection: 'column',
          height: '100vh', overflowY: 'auto', overflowX: 'hidden',
          backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'saturate(160%) blur(28px)',
          WebkitBackdropFilter: 'saturate(160%) blur(28px)', borderRight: `1px solid ${sidebarBorder}`,
          boxShadow: '1px 0 0 rgba(0,0,0,0.08)',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}>

          {/* Logo row + collapse toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 12px 16px 20px', borderBottom: `1px solid ${sidebarBorder}`, flexShrink: 0 }}>
            {!collapsed && <CapaLogo size={44} />}
            <button
              onClick={toggleCollapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ color: 'rgba(235,235,245,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', flexShrink: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(235,235,245,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(235,235,245,0.45)')}>
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* Search — hidden when collapsed */}
          {!collapsed && (
            <div style={{ padding: '10px 12px 4px' }}>
              <button onClick={() => setSearch(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(235,235,245,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(235,235,245,0.8)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(235,235,245,0.5)'; }}>
                <Search size={15} /><span style={{ flex: 1 }}>Search stocks…</span>
                <kbd style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(235,235,245,0.4)' }}>⌘K</kbd>
              </button>
            </div>
          )}

          {/* Search icon only when collapsed */}
          {collapsed && (
            <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setSearch(true)} title="Search stocks"
                style={{ color: 'rgba(235,235,245,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, cursor: 'pointer', padding: 8, display: 'flex', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'rgba(235,235,245,0.9)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(235,235,245,0.5)'; }}>
                <Search size={16} />
              </button>
            </div>
          )}

          <nav style={{ flex: 1, padding: collapsed ? '8px 0' : '8px 12px', overflowY: 'auto' }}>
            {user?.adminRole && (
              <NavLink to="/admin/dashboard"
                title={collapsed ? 'Admin' : undefined}
                style={({ isActive }) => ({ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, padding: collapsed ? '10px 0' : '9px 12px', borderRadius: 10, marginBottom: 2, fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s', backgroundColor: isActive ? 'rgba(168,85,247,0.15)' : 'transparent', color: isActive ? '#c084fc' : navInactive })}>
                {({ isActive }) => <><ShieldAlert size={18} strokeWidth={isActive ? 2.2 : 1.8} />{!collapsed && 'Admin'}</>}
              </NavLink>
            )}
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                title={collapsed ? label : undefined}
                style={({ isActive }) => ({ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, padding: collapsed ? '10px 0' : '9px 12px', borderRadius: 10, marginBottom: 2, fontSize: 15, fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s', backgroundColor: isActive ? 'var(--accent-dim)' : 'transparent', color: isActive ? 'var(--accent)' : navInactive })}>
                {({ isActive }) => (<>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  {!collapsed && label}
                  {!collapsed && label === 'Verification' && kycBadge && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />}
                  {collapsed && label === 'Verification' && kycBadge && <span style={{ position: 'absolute', top: 6, right: 10, width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />}
                </>)}
              </NavLink>
            ))}
            <button onClick={() => setPalette(true)}
              title={collapsed ? 'Customizations' : undefined}
              style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, width: '100%', padding: collapsed ? '10px 0' : '9px 12px', borderRadius: 10, marginTop: 2, fontSize: 15, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: navInactive, transition: 'background 0.15s', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <Palette size={18} strokeWidth={1.8} />{!collapsed && 'Customizations'}
            </button>
          </nav>

          {/* User footer */}
          <div style={{ padding: collapsed ? '12px 0' : 12, borderTop: `1px solid ${sidebarBorder}`, flexShrink: 0 }}>
            {collapsed ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div title={`${user?.firstName} ${user?.lastName}`} style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-text)', fontSize: 13, fontWeight: 600 }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <button onClick={handleLogout} title="Sign out" style={{ color: '#aeaeb2', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ff3b30')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#aeaeb2')}>
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-text)', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                </div>
                <button onClick={handleLogout} style={{ color: '#aeaeb2', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ff3b30')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#aeaeb2')}>
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── Mobile: backdrop + slide-over sidebar ── */}
      {isMobile && mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} onClick={() => setMobileOpen(false)} />
      )}
      {isMobile && (
        <aside style={{ position: 'fixed', top: 0, left: 0, width: 256, height: '100vh', zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'saturate(160%) blur(28px)', WebkitBackdropFilter: 'saturate(160%) blur(28px)', borderRight: `1px solid ${sidebarBorder}`, boxShadow: '4px 0 24px rgba(0,0,0,0.4)', overflowY: 'auto', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${sidebarBorder}` }}>
            <CapaLogo size={44} />
            <button onClick={() => setMobileOpen(false)} style={{ color: 'rgba(235,235,245,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 8 }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '10px 12px 4px' }}>
            <button onClick={() => { setSearch(true); setMobileOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(235,235,245,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, textAlign: 'left' }}>
              <Search size={15} /><span style={{ flex: 1 }}>Search stocks…</span>
            </button>
          </div>
          <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
            {user?.adminRole && (
              <NavLink to="/admin/dashboard" onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, marginBottom: 2, fontSize: 16, fontWeight: 500, textDecoration: 'none', backgroundColor: isActive ? 'rgba(168,85,247,0.15)' : 'transparent', color: isActive ? '#c084fc' : navInactive })}>
                {({ isActive }) => <><ShieldAlert size={20} strokeWidth={isActive ? 2.2 : 1.8} />Admin</>}
              </NavLink>
            )}
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, marginBottom: 2, fontSize: 16, fontWeight: 500, textDecoration: 'none', backgroundColor: isActive ? 'var(--accent-dim)' : 'transparent', color: isActive ? 'var(--accent)' : navInactive })}>
                {({ isActive }) => (<><Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />{label}{label === 'Verification' && kycBadge && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />}</>)}
              </NavLink>
            ))}
            <button onClick={() => { setPalette(true); setMobileOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 12px', borderRadius: 10, marginTop: 2, fontSize: 16, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: navInactive, textAlign: 'left' }}>
              <Palette size={20} strokeWidth={1.8} />Customizations
            </button>
          </nav>
          <div style={{ padding: 12, borderTop: `1px solid ${sidebarBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-text)', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              </div>
              <button onClick={handleLogout} style={{ color: '#aeaeb2', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ff3b30')}
                onMouseLeave={e => (e.currentTarget.style.color = '#aeaeb2')}>
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── Main content area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Mobile top bar with hamburger */}
        {isMobile && (
          <header style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${sidebarBorder}` }}>
            <button onClick={() => setMobileOpen(true)} style={{ color: 'rgba(235,235,245,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8 }}>
              <Menu size={22} />
            </button>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <CapaLogo size={34} />
            </div>
            <button onClick={() => setSearch(true)} style={{ color: 'rgba(235,235,245,0.7)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8 }}>
              <Search size={20} />
            </button>
          </header>
        )}

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 12px' : '24px', background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
