import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { LayoutDashboard, Users, ShieldCheck, ArrowDownUp, LogOut, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import OrangeIcon from '../ui/OrangeIcon';

const nav = [
  { to: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/users',         label: 'Users',         icon: Users },
  { to: '/admin/kyc',           label: 'KYC Review',    icon: ShieldCheck },
  { to: '/admin/transactions',  label: 'Transactions',  icon: ArrowDownUp },
];

const SIDEBAR_BG  = '#ffffff';
const SIDEBAR_BDR = 'rgba(0,0,0,0.09)';

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
    <div className="flex h-screen" style={{ backgroundColor: '#0a0808', position: 'relative' }}>

      {/* Soft white blur blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%',  width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', filter: 'blur(90px)' }} />
      </div>

      <aside
        className="w-60 flex flex-col"
        style={{ backgroundColor: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BDR}`, position: 'relative', zIndex: 1, boxShadow: '4px 0 24px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2.5 px-5 h-16" style={{ borderBottom: `1px solid ${SIDEBAR_BDR}` }}>
          <OrangeIcon size={34} />
          <p className="text-xs text-gray-500" style={{ fontFamily: "'Orbitron',sans-serif", letterSpacing: '0.05em' }}>Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? '' : 'hover:bg-black/5'
              )}
              style={({ isActive }) => isActive
                ? { background: 'rgba(245,130,31,0.12)', color: '#f5821f', borderLeft: '2px solid #f5821f', paddingLeft: 10 }
                : { color: '#555' }
              }
            >
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${SIDEBAR_BDR}` }}>
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors hover:bg-white/5"
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

      <main className="flex-1 overflow-y-auto p-6" style={{ position: 'relative', zIndex: 1, backgroundColor: '#f0ede8' }}>
        <Outlet />
      </main>
    </div>
  );
}
