import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { LayoutDashboard, Users, ShieldCheck, ArrowDownUp, LogOut, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import CapaIcon from '../ui/CapaIcon';

const nav = [
  { to: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/users',         label: 'Users',         icon: Users },
  { to: '/admin/kyc',           label: 'KYC Review',    icon: ShieldCheck },
  { to: '/admin/transactions',  label: 'Transactions',  icon: ArrowDownUp },
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
    <div className="flex h-screen" style={{ backgroundColor: '#152921' }}>
      <aside
        className="w-60 flex flex-col"
        style={{ backgroundColor: '#1a3028', borderRight: '1px solid #2a4a3c' }}
      >
        {/* Logo + admin label */}
        <div className="flex items-center gap-2.5 px-5 h-16" style={{ borderBottom: '1px solid #2a4a3c' }}>
          <CapaIcon className="h-8 w-8 flex-shrink-0" />
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'text-white' : 'text-gray-400 hover:text-white'
              )}
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))', color: '#c084fc' }
                : undefined
              }
            >
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-1" style={{ borderTop: '1px solid #2a4a3c' }}>
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            style={{ backgroundColor: 'transparent' }}
          >
            <ChevronLeft size={16} /> Back to App
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
