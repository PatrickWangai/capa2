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

  const SEP         = '1px dashed rgba(255,255,255,0.08)';
  const navInactive = 'var(--nav-text)';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-gradient)' }}>

      {/* ── Search Palette ── */}
      <SearchPalette open={searchOpen} onClose={() => setSearch(false)} />


      {/* ── Desktop sidebar (hidden on mobile) ── */}
      {!isMobile && (
        <aside style={{
          width: collapsed ? 64 : 256, flexShrink: 0, display: 'flex', flexDirection: 'column',
          height: '100vh', overflowY: 'auto', overflowX: 'hidden',
          backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'saturate(160%) blur(28px)',
          WebkitBackdropFilter: 'saturate(160%) blur(28px)', borderRight: `1px solid ${SEP}`,
          boxShadow: '1px 0 0 rgba(0,0,0,0.08)',
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}>

          {/* Logo row + collapse toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '16px 0' : '16px 12px 16px 20px', borderBottom: `1px solid ${SEP}`, flexShrink: 0 }}>
            {!collapsed && <CapaLogo size={44} />}
            <button
              onClick={toggleCollapsed}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ color: '#aeaeb2', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', flexShrink: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(235,235,245,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = '#aeaeb2')}>
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
          </nav>

          {/* User footer */}
          <div style={{ padding: collapsed ? '12px 0' : 12, borderTop: `1px solid ${SEP}`, flexShrink: 0 }}>
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
        <aside style={{ position: 'fixed', top: 0, left: 0, width: 256, height: '100vh', zIndex: 50, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'saturate(160%) blur(28px)', WebkitBackdropFilter: 'saturate(160%) blur(28px)', borderRight: `1px solid ${SEP}`, boxShadow: '4px 0 24px rgba(0,0,0,0.4)', overflowY: 'auto', transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${SEP}` }}>
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
          </nav>
          <div style={{ padding: 12, borderTop: SEP }}>
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
          <header style={{ height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: SEP }}>
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
