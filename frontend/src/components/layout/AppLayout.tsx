import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowDownUp, Bell,
  CreditCard, ShieldCheck, LogOut, Menu
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import CapaIcon from '../ui/CapaIcon';

const nav = [
  { to: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/markets',       label: 'Markets',      icon: TrendingUp },
  { to: '/portfolio',     label: 'Portfolio',    icon: Briefcase },
  { to: '/orders',        label: 'Orders',       icon: ArrowDownUp },
  { to: '/deposit',       label: 'Deposit',      icon: CreditCard },
  { to: '/notifications', label: 'Alerts',       icon: Bell },
  { to: '/kyc',           label: 'Verification', icon: ShieldCheck },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const kycBadge = user?.kycStatus !== 'APPROVED';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#152921' }}>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: '#1a3028', borderRight: '1px solid #2a4a3c' }}
      >
        <div className="flex items-center px-5 h-16" style={{ borderBottom: '1px solid #2a4a3c' }}>
          <CapaIcon className="h-9 w-9" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'text-white' : 'text-gray-400 hover:text-white'
              )}
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))', color: '#c084fc' }
                : undefined
              }
            >
              <Icon size={18} />
              {label}
              {label === 'Verification' && kycBadge && (
                <span className="ml-auto w-2 h-2 bg-yellow-400 rounded-full" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: '1px solid #2a4a3c' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between h-14 px-4"
          style={{ backgroundColor: '#1a3028', borderBottom: '1px solid #2a4a3c' }}
        >
          <button onClick={() => setOpen(true)} className="text-gray-400">
            <Menu size={22} />
          </button>
          <CapaIcon className="h-8 w-8" />
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
