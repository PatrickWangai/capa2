import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { LayoutDashboard, Users, ShieldCheck, ArrowDownUp, LogOut, ChevronLeft, Wallet } from 'lucide-react';
import { useAlertStore } from '../../store/alertStore';
import CapaLogo from '../ui/CapaLogo';

const nav = [
  { to: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/users',        label: 'Users',        icon: Users },
  { to: '/admin/kyc',          label: 'KYC Review',   icon: ShieldCheck },
  { to: '/admin/transactions', label: 'Transactions', icon: ArrowDownUp },
  { to: '/admin/wallets',      label: 'Wallets',      icon: Wallet },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const showAlert = useAlertStore(s => s.show);

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    logout();
    showAlert({ variant: 'info', title: 'Signed out', message: 'You have been logged out successfully.' });
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)' }}>
      <aside style={{
        width: 240, display: 'flex', flexDirection: 'column',
        backgroundColor: 'var(--sidebar)',
        borderRight: '2px solid var(--sidebar-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <CapaLogo size={40} />
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', color: 'var(--foreground)', margin: 0 }}>Capa</p>
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: 0 }}>Admin Panel</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 10px' }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', marginBottom: 2,
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '-0.01em',
                textDecoration: 'none',
                borderLeft: `2px solid ${isActive ? 'var(--sidebar-primary)' : 'transparent'}`,
                backgroundColor: isActive ? 'var(--sidebar-accent)' : 'transparent',
                color: isActive ? 'var(--sidebar-foreground-active)' : 'var(--sidebar-foreground)',
                textShadow: isActive ? 'var(--glow)' : 'none',
                transition: 'background-color 0.15s, color 0.15s',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 12, borderTop: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--sidebar-foreground)', textDecoration: 'none' }}>
            <ChevronLeft size={16} /> Back to App
          </NavLink>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--destructive)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
