import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Bell, ShieldCheck, ArrowRight, CreditCard, BarChart2, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { StockLogo } from '../components/ui/StockLogo';

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && (
        <p className={clsx('text-sm mt-1 flex items-center gap-1', positive ? 'text-green-400' : positive === false ? 'text-red-400' : 'text-gray-400')}>
          {positive === true && <TrendingUp size={14} />}
          {positive === false && <TrendingDown size={14} />}
          {sub}
        </p>
      )}
    </div>
  );
}

const MARKET_HIGHLIGHTS = [
  { sym: 'SCOM', name: 'Safaricom',   price: 'KES 26.15', change: '+1.82%', up: true  },
  { sym: 'AAPL', name: 'Apple',       price: '$198.45',   change: '+0.92%', up: true  },
  { sym: 'NVDA', name: 'NVIDIA',      price: '$1,312.50', change: '+5.23%', up: true  },
  { sym: 'EQTY', name: 'Equity Bank', price: 'KES 42.50', change: '-0.61%', up: false },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    retry: false,
  });

  const { data: history } = useQuery({
    queryKey: ['portfolio-history'],
    queryFn: () => api.get('/api/portfolio/history?period=1M').then(r => r.data),
    retry: false,
  });

  const { data: notifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications?limit=5').then(r => r.data),
    retry: false,
  });

  const summary = portfolio?.summary;
  const isUp = summary ? Number(summary.dailyChange) >= 0 : true;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Good {getGreeting()}, {user?.firstName} 👋</h1>
          <p className="text-gray-400 mt-1">Here's your portfolio overview</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {(() => {
            const open = isNSEOpen();
            return (
              <p className={clsx('text-xs mt-0.5 flex items-center gap-1 justify-end', open ? 'text-green-400' : 'text-gray-500')}>
                <span className={clsx('w-1.5 h-1.5 rounded-full inline-block', open ? 'bg-green-400 animate-pulse' : 'bg-gray-600')} />
                {open ? 'NSE Markets Open' : 'NSE Markets Closed'}
              </p>
            );
          })()}
        </div>
      </div>

      {/* KYC banner */}
      {user?.kycStatus !== 'APPROVED' && (
        <div className="flex items-center gap-4 p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-xl">
          <ShieldCheck className="text-yellow-400 shrink-0" size={22} />
          <div className="flex-1">
            <p className="font-medium text-yellow-300">Complete Identity Verification</p>
            <p className="text-sm text-yellow-400/80 mt-0.5">Verify your identity to unlock deposits, withdrawals and trading.</p>
          </div>
          <Link to="/kyc" className="btn-primary text-sm whitespace-nowrap">Verify Now</Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: CreditCard,  label: 'Deposit',      sub: 'via M-Pesa',      to: '/deposit',    color: '#30d158' },
          { icon: TrendingUp,  label: 'Trade',        sub: 'Buy & sell',       to: '/markets',    color: 'var(--accent)' },
          { icon: BarChart2,   label: 'Portfolio',    sub: 'View holdings',    to: '/portfolio',  color: '#bf5af2' },
          { icon: RefreshCw,   label: 'Withdraw',     sub: 'Cash out',         to: '/deposit',    color: '#ff9f0a' },
        ].map(({ icon: Icon, label, sub, to, color }) => (
          <Link key={label} to={to} style={{ textDecoration: 'none' }}>
            <div className="card hover:border-gray-700 transition-all hover:-translate-y-0.5 cursor-pointer" style={{ padding: '16px 18px' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: `${color}18` }}>
                <Icon size={18} style={{ color }} strokeWidth={1.8} />
              </div>
              <p className="font-semibold text-white text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Market snapshot */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-white text-sm">Market Snapshot</h2>
          <Link to="/markets" className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">
            All markets <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MARKET_HIGHLIGHTS.map(m => (
            <div key={m.sym} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-800/50">
              <StockLogo symbol={m.sym} size="sm" />
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold">{m.sym}</p>
                <p className="text-gray-400 text-xs truncate">{m.price}</p>
              </div>
              <span className={clsx('text-xs font-semibold ml-auto shrink-0', m.up ? 'text-green-400' : 'text-red-400')}>
                {m.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Value"
          value={`$${Number(summary?.totalValue || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={summary ? `${isUp ? '+' : ''}$${Number(summary.dailyChange).toFixed(2)} today` : undefined}
          positive={isUp}
        />
        <StatCard
          label="Total Invested"
          value={`$${Number(summary?.totalInvested || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Total P&L"
          value={`${Number(summary?.totalGainLoss || 0) >= 0 ? '+' : ''}$${Number(summary?.totalGainLoss || 0).toFixed(2)}`}
          sub={summary ? `${summary.totalGainLossPct}%` : undefined}
          positive={Number(summary?.totalGainLoss || 0) >= 0}
        />
        <StatCard
          label="Positions"
          value={String(portfolio?.positions?.length || 0)}
          sub="Active holdings"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-white mb-4">Portfolio Performance</h2>
          {history?.history?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={history.history}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `$${Number(v).toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Briefcase size={36} className="mx-auto mb-2 opacity-30" />
                <p>No history yet. Make your first trade!</p>
                <Link to="/markets" className="text-blue-400 text-sm mt-2 inline-block">Browse Markets →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Alerts</h2>
            <Link to="/notifications" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
              All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {notifs?.notifications?.length > 0 ? notifs.notifications.map((n: any) => (
              <div key={n.id} className={clsx('p-3 rounded-lg text-sm', n.isRead ? 'bg-gray-800/50' : 'bg-blue-500/10 border border-blue-600/20')}>
                <p className="font-medium text-white">{n.title}</p>
                <p className="text-gray-400 mt-0.5 text-xs">{n.body}</p>
              </div>
            )) : (
              <div className="text-center py-6 text-gray-500">
                <Bell size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top positions */}
      {portfolio?.positions?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Top Holdings</h2>
            <Link to="/portfolio" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {portfolio.positions.slice(0, 5).map((pos: any) => (
              <Link to={`/markets/${pos.assetId}`} key={pos.id} style={{ textDecoration: 'none' }}>
                <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <StockLogo symbol={pos.symbol} size="md" />
                    <div>
                      <p className="font-medium text-white text-sm">{pos.symbol}</p>
                      <p className="text-xs text-gray-400">{pos.quantity} shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white text-sm">{pos.currency} {Number(pos.marketValue).toLocaleString('en', { minimumFractionDigits: 2 })}</p>
                    <p className={clsx('text-xs', Number(pos.gainLoss) >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {Number(pos.gainLoss) >= 0 ? '+' : ''}{pos.gainLossPct}%
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/markets" className="btn-primary w-full mt-4 text-center text-sm py-2.5" style={{ display: 'block' }}>
            <DollarSign size={14} className="inline mr-1.5" />
            Browse Markets &amp; Trade
          </Link>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// NSE trades Mon–Fri, 09:00–15:00 East Africa Time (UTC+3)
function isNSEOpen(): boolean {
  const now = new Date();
  const eat = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
  const day = eat.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false;
  const minutes = eat.getHours() * 60 + eat.getMinutes();
  return minutes >= 9 * 60 && minutes < 15 * 60;
}
