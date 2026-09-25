import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowDownUp, Bell,
  ShieldCheck, LogOut, User, ShieldAlert, X, Search, Menu, Wallet,
  Star, Settings, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import CapaLogo from '../ui/CapaLogo';
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

const navItemStyle = (isActive: boolean, collapsed: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center',
  justifyContent: collapsed ? 'center' : 'flex-start', gap: 10,
  padding: collapsed ? '10px 0' : '9px 10px',
  marginBottom: 2, fontSize: 13, fontWeight: 700,
  fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '-0.01em',
  textDecoration: 'none', position: 'relative',
  borderLeft: `2px solid ${isActive ? 'var(--sidebar-primary)' : 'transparent'}`,
  backgroundColor: isActive ? 'var(--sidebar-accent)' : 'transparent',
  color: isActive ? 'var(--sidebar-foreground-active)' : 'var(--sidebar-foreground)',
  textShadow: isActive ? 'var(--glow)' : 'none',
  transition: 'background-color 0.15s, color 0.15s',
});

export default function AppLayout() {
  const { user, logout, setAuth, accessToken, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const [searchOpen, setSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };
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

  const SEP = '1px solid var(--sidebar-border)';
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;

  const avatarStyle: React.CSSProperties = {
    borderRadius: 'var(--radius)', background: 'var(--primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--primary-foreground)', fontSize: 13, fontWeight: 700,
    fontFamily: 'var(--font-display)', border: '2px solid var(--foreground)', flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>

      {/* ── Search Palette ── */}
      <SearchPalette open={searchOpen} onClose={() => setSearch(false)} />


      {/* ── Desktop sidebar (hidden on mobile) ── */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 64 : 256, flexShrink: 0, display: 'flex', flexDirection: 'column',
          height: '100vh', overflowY: 'auto', overflowX: 'hidden',
          backgroundColor: 'var(--sidebar)', borderRight: `2px solid var(--sidebar-border)`,
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}>

          {/* Logo row + collapse toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 12px 16px 20px', borderBottom: SEP, flexShrink: 0 }}>
            {!collapsed && <CapaLogo size={36} />}
            <button
              onClick={toggleCollapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ color: 'var(--sidebar-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 'var(--radius)', display: 'flex', flexShrink: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--sidebar-foreground-active)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--sidebar-foreground)')}>
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* Search — hidden when collapsed */}
          {!collapsed && (
            <div style={{ padding: '10px 12px 4px' }}>
              <button onClick={() => setSearch(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', background: 'var(--card)', border: `1px solid var(--sidebar-border)`, color: 'var(--sidebar-foreground)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, textAlign: 'left', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sidebar-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--sidebar-border)'; }}>
                <Search size={15} /><span style={{ flex: 1 }}>Search stocks…</span>
                <kbd style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'var(--secondary)', border: `1px solid var(--sidebar-border)`, color: 'var(--muted-foreground)' }}>⌘K</kbd>
              </button>
            </div>
          )}

          {/* Search icon only when collapsed */}
          {collapsed && (
            <div style={{ padding: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setSearch(true)} title="Search stocks"
                style={{ color: 'var(--sidebar-foreground)', background: 'var(--card)', border: `1px solid var(--sidebar-border)`, borderRadius: 'var(--radius)', cursor: 'pointer', padding: 8, display: 'flex', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sidebar-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--sidebar-border)'; }}>
                <Search size={16} />
              </button>
            </div>
          )}

          <nav style={{ flex: 1, padding: collapsed ? '8px 0' : '8px 10px', overflowY: 'auto' }}>
            {user?.adminRole && (
              <NavLink to="/admin/dashboard"
                title={collapsed ? 'Admin' : undefined}
                style={({ isActive }) => navItemStyle(isActive, collapsed)}>
                {({ isActive }) => <><ShieldAlert size={18} strokeWidth={isActive ? 2.2 : 1.8} />{!collapsed && 'Admin'}</>}
              </NavLink>
            )}
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                title={collapsed ? label : undefined}
                style={({ isActive }) => navItemStyle(isActive, collapsed)}>
                {({ isActive }) => (<>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  {!collapsed && label}
                  {!collapsed && label === 'Verification' && kycBadge && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--warning)' }} />}
                  {collapsed && label === 'Verification' && kycBadge && <span style={{ position: 'absolute', top: 6, right: 10, width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--warning)' }} />}
                </>)}
              </NavLink>
            ))}
          </nav>

          {/* User footer */}
          <div style={{ padding: collapsed ? '12px 0' : 12, borderTop: SEP, flexShrink: 0 }}>
            {collapsed ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div title={`${user?.firstName} ${user?.lastName}`} style={{ ...avatarStyle, width: 32, height: 32 }}>
                  {initials}
                </div>
                <button onClick={handleLogout} title="Sign out" style={{ color: 'var(--sidebar-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--destructive)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--sidebar-foreground)')}>
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius)', backgroundColor: 'var(--secondary)' }}>
                <div style={{ ...avatarStyle, width: 32, height: 32 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                </div>
                <button onClick={handleLogout} style={{ color: 'var(--sidebar-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--destructive)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--sidebar-foreground)')}>
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── Mobile: backdrop + slide-over sidebar ── */}
      {isMobile && mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={() => setMobileOpen(false)} />
      )}
      {isMobile && (
        <aside style={{ position: 'fixed', top: 0, left: 0, width: 256, height: '100vh', zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sidebar)', borderRight: `2px solid var(--sidebar-border)`, overflowY: 'auto', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: SEP }}>
            <CapaLogo size={36} />
            <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--sidebar-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 8 }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '10px 12px 4px' }}>
            <button onClick={() => { setSearch(true); setMobileOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 'var(--radius)', background: 'var(--card)', border: `1px solid var(--sidebar-border)`, color: 'var(--sidebar-foreground)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, textAlign: 'left' }}>
              <Search size={15} /><span style={{ flex: 1 }}>Search stocks…</span>
            </button>
          </div>
          <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
            {user?.adminRole && (
              <NavLink to="/admin/dashboard" onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({ ...navItemStyle(isActive, false), fontSize: 14, padding: '11px 10px' })}>
                {({ isActive }) => <><ShieldAlert size={20} strokeWidth={isActive ? 2.2 : 1.8} />Admin</>}
              </NavLink>
            )}
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({ ...navItemStyle(isActive, false), fontSize: 14, padding: '11px 10px' })}>
                {({ isActive }) => (<><Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />{label}{label === 'Verification' && kycBadge && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--warning)' }} />}</>)}
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: 12, borderTop: SEP }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius)', backgroundColor: 'var(--secondary)' }}>
              <div style={{ ...avatarStyle, width: 36, height: 36 }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</p>
                <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              </div>
              <button onClick={handleLogout} style={{ color: 'var(--sidebar-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--destructive)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--sidebar-foreground)')}>
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
          <header style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, backgroundColor: 'var(--card)', borderBottom: `2px solid var(--foreground)` }}>
            <button onClick={() => setMobileOpen(true)} style={{ color: 'var(--foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8 }}>
              <Menu size={22} />
            </button>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <CapaLogo size={28} />
            </div>
            <button onClick={() => setSearch(true)} style={{ color: 'var(--foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8 }}>
              <Search size={20} />
            </button>
          </header>
        )}

        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 12px' : '24px', background: 'var(--background)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
