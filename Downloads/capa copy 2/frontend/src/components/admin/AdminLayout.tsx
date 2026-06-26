import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { LayoutDashboard, Users, ShieldCheck, ArrowDownUp, LogOut, Globe, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

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
    <div className="flex h-screen bg-gray-950">
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-800">
          <Globe className="text-blue-400" size={22} />
          <div>
            <p className="font-bold text-white text-sm leading-none">Capa</p>
            <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800 space-y-1">
          <NavLink to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <ChevronLeft size={16} /> Back to App
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
    </div>
  );
}
