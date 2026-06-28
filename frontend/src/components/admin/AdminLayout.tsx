import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { LayoutDashboard, Users, ShieldCheck, ArrowDownUp, LogOut, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import CapaLogo from '../ui/CapaLogo';

const nav = [
  { to: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/users',        label: 'Users',        icon: Users },
  { to: '/admin/kyc',          label: 'KYC Review',   icon: ShieldCheck },
  { to: '/admin/transactions', label: 'Transactions', icon: ArrowDownUp },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000000' }}>
      <aside style={{
        width: 240, display: 'flex', flexDirection: 'column',
        backgroundColor: 'rgba(28,28,30,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderRight: '1px solid rgba(84,84,88,0.45)',
        boxShadow: '1px 0 0 rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid rgba(84,84,88,0.45)' }}>
          <CapaLogo size={32} />
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', margin: 0 }}>Capa</p>
            <p style={{ fontSize: 11, color: 'rgba(235,235,245,0.6)', margin: 0 }}>Admin Panel</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(245,130,31,0.15)' : 'transparent',
                color: isActive ? '#ff9f45' : 'rgba(235,235,245,0.85)',
                transition: 'background 0.15s',
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

        <div style={{ padding: 12, borderTop: '1px solid rgba(84,84,88,0.45)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, fontSize: 14, color: 'rgba(235,235,245,0.6)', textDecoration: 'none' }}>
            <ChevronLeft size={16} /> Back to App
          </NavLink>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, fontSize: 14, color: '#ff3b30', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
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
