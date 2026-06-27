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
import OrangeIcon from '../ui/OrangeIcon';

const nav = [
  { to: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/markets',       label: 'Markets',      icon: TrendingUp },
  { to: '/portfolio',     label: 'Portfolio',    icon: Briefcase },
  { to: '/orders',        label: 'Orders',       icon: ArrowDownUp },
  { to: '/deposit',       label: 'Deposit',      icon: CreditCard },
  { to: '/notifications', label: 'Alerts',       icon: Bell },
  { to: '/kyc',           label: 'Verification', icon: ShieldCheck },
];

const SIDEBAR_BG  = '#ffffff';
const SIDEBAR_BDR = 'rgba(0,0,0,0.09)';
const MAIN_BG     = '#f0ede8';

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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: MAIN_BG, position: 'relative' }}>

      {/* Soft white blur blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '10%',  width: 700, height: 700, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '5%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', filter: 'blur(90px)'  }} />
        <div style={{ position: 'absolute', top: '35%', left: '45%',   width: 500, height: 500, borderRadius: '50%', background: 'rgba(245,130,31,0.06)', filter: 'blur(80px)'  }} />
      </div>

      {open && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BDR}`, position: 'relative', zIndex: 30, boxShadow: '4px 0 24px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2 px-5 h-16" style={{ borderBottom: `1px solid ${SIDEBAR_BDR}` }}>
          <OrangeIcon size={38} />
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: '0.1em', color: '#f5821f' }}>CAPA</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? '' : 'hover:bg-black/5'
              )}
              style={({ isActive }) => isActive
                ? { background: 'rgba(245,130,31,0.12)', color: '#f5821f', borderLeft: '2px solid #f5821f', paddingLeft: 10 }
                : { color: '#555' }
              }
            >
              <Icon size={18} />
              {label}
              {label === 'Verification' && kycBadge && (
                <span className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: '#f5821f' }} />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: `1px solid ${SIDEBAR_BDR}` }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f5821f, #ff4500)' }}
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
      <div className="flex-1 flex flex-col overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between h-14 px-4"
          style={{ backgroundColor: SIDEBAR_BG, borderBottom: `1px solid ${SIDEBAR_BDR}` }}
        >
          <button onClick={() => setOpen(true)} style={{ color: '#666' }}>
            <Menu size={22} />
          </button>
          <OrangeIcon size={34} />
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
