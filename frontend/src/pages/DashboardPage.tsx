import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import {
  TrendingUp, DollarSign, Briefcase, ShieldCheck,
  ArrowRight, BarChart2, Star, Clock, Wallet, ArrowUpRight, ArrowDownLeft,
} from 'lucide-react';
import clsx from 'clsx';
import { StockLogo } from '../components/ui/StockLogo';
import { Badge } from '../components/ui';

const FLAG: Record<string, string> = {
  KES: '🇰🇪', USD: '🇺🇸', GBP: '🇬🇧', EUR: '🇪🇺',
  CAD: '🇨🇦', AUD: '🇦🇺', JPY: '🇯🇵', CHF: '🇨🇭',
  HKD: '🇭🇰', SGD: '🇸🇬', ZAR: '🇿🇦',
};

type MoverTab = 'gainers' | 'losers' | 'active';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-sm mt-1 text-gray-400">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [moverTab, setMoverTab] = useState<MoverTab>('gainers');

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    retry: false,
  });

const { data: wlData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/api/assets/watchlist').then(r => r.data),
    refetchInterval: 30_000,
    retry: false,
  });

  const { data: moversData } = useQuery({
    queryKey: ['movers', moverTab],
    queryFn: () => api.get(`/api/assets/movers?type=${moverTab}&limit=8&exchange=NSE`).then(r => r.data),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders-recent'],
    queryFn: () => api.get('/api/orders?limit=5').then(r => r.data),
    retry: false,
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => api.get('/api/wallets').then(r => r.data),
    retry: false,
    staleTime: 60_000,
  });

  const summary = portfolio?.summary;
  const watchlistItems: any[] = wlData?.watchlist?.items ?? [];
  const movers: any[] = moversData?.assets ?? [];
  const recentOrders: any[] = ordersData?.orders ?? [];
  const walletBalances: any[] = (walletData?.balances ?? []).filter((b: any) => Number(b.available) > 0 || b.currency === 'KES' || b.currency === 'USD');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Good {getGreeting()}, {user?.firstName}</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {(() => {
          const open = isNSEOpen();
          return (
            <div className={clsx(
              'hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border',
              open ? 'bg-green-900/20 text-green-400 border-green-800/40' : 'bg-gray-800/60 text-gray-500 border-gray-700/40',
            )}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', open ? 'bg-green-400 animate-pulse' : 'bg-gray-600')} />
              NSE {open ? 'Open · 09:00–15:00 EAT' : 'Closed'}
            </div>
          );
        })()}
      </div>

      {/* KYC banner */}
      {user?.kycStatus !== 'APPROVED' && (
        <div className="flex items-center gap-4 p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-xl">
          <ShieldCheck className="text-yellow-400 shrink-0" size={22} />
          <div className="flex-1">
            <p className="font-medium text-yellow-300">Complete Identity Verification</p>
            <p className="text-sm text-yellow-400/80 mt-0.5">Verify your identity to unlock deposits, withdrawals and trading.</p>
          </div>
          <Link to="/kyc" className="btn-primary whitespace-nowrap" style={{ fontSize: 14, padding: '8px 16px' }}>Verify Now</Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: TrendingUp,    label: 'Trade',     sub: 'Buy & sell',    to: '/markets',   color: 'var(--accent)' },
          { icon: BarChart2,     label: 'Portfolio', sub: 'View holdings', to: '/portfolio', color: '#bf5af2' },
          { icon: ArrowDownLeft, label: 'Deposit',   sub: 'Add funds',     to: '/deposit',   color: '#34d399' },
          { icon: ArrowUpRight,  label: 'Withdraw',  sub: 'Cash out',      to: '/withdraw',  color: '#fb923c' },
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

      {/* Wallet balances strip */}
      {walletBalances.length > 0 && (
        <div className="card" style={{ padding: '16px 20px' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Wallet size={14} style={{ color: 'var(--accent)' }} />
              Wallet
            </h2>
            <Link to="/wallet" className="text-sm flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {walletBalances.slice(0, 6).map((b: any) => (
              <div key={b.currency} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span>{FLAG[b.currency] ?? '💱'}</span>
                <span className="text-xs font-semibold text-white">{b.currency}</span>
                <span className="text-xs text-gray-400">{Number(b.available).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Value"
          value={`$${Number(summary?.totalValue || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Total Invested"
          value={`$${Number(summary?.totalInvested || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Positions"
          value={String(portfolio?.positions?.length || 0)}
          sub="Active holdings"
        />
      </div>

      {/* Watchlist */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Star size={14} className="text-yellow-400" fill="currentColor" />
              Watchlist
            </h2>
            <Link to="/markets" className="text-sm flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              Markets <ArrowRight size={14} />
            </Link>
          </div>
          {watchlistItems.length === 0 ? (
            <div className="text-center py-8">
              <Star size={28} className="mx-auto mb-2 text-gray-700" />
              <p className="text-sm text-gray-500">No watchlist items yet</p>
              <Link to="/markets" className="text-xs mt-2 inline-block" style={{ color: 'var(--accent)' }}>
                Star stocks in Markets →
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {watchlistItems.slice(0, 7).map((item: any) => {
                const a = item.asset;
                const chg = Number(a.price?.changePercent ?? 0);
                const up = chg >= 0;
                return (
                  <Link key={item.id ?? a.id} to={`/markets/${a.id}`} style={{ textDecoration: 'none' }}>
                    <div className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <StockLogo symbol={a.symbol} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-white">{a.symbol}</p>
                          <p className="text-[11px] text-gray-500 truncate max-w-[90px]">{a.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {a.price?.price != null ? Number(a.price.price).toFixed(2) : '—'}
                        </p>
                        <p className={clsx('text-xs font-medium', up ? 'text-green-400' : 'text-red-400')}>
                          {up ? '+' : ''}{chg.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Movers */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Top Movers</h2>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['gainers', 'losers', 'active'] as MoverTab[]).map(t => (
              <button key={t} onClick={() => setMoverTab(t)}
                className={clsx(
                  'px-3 py-1 text-xs font-semibold rounded-md transition-all',
                  moverTab === t ? 'text-white' : 'text-gray-500 hover:text-gray-300',
                )}
                style={moverTab === t ? { backgroundColor: 'rgba(255,255,255,0.10)' } : {}}>
                {t === 'gainers' ? 'Gainers' : t === 'losers' ? 'Losers' : 'Active'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="flex gap-3 min-w-max pb-1">
            {movers.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No data available</p>
            ) : movers.map((asset: any) => {
              const chg = Number(asset.price?.changePercent ?? 0);
              const up = chg >= 0;
              return (
                <Link key={asset.id} to={`/markets/${asset.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border transition-all hover:-translate-y-0.5 min-w-[120px]"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <StockLogo symbol={asset.symbol} size="sm" />
                      <span className="text-sm font-bold text-white">{asset.symbol}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {asset.price?.price != null
                        ? `${asset.currency} ${Number(asset.price.price).toFixed(2)}`
                        : '—'}
                    </p>
                    <span className={clsx(
                      'text-xs font-semibold px-2 py-0.5 rounded-full self-start',
                      up ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400',
                    )}>
                      {up ? '+' : ''}{chg.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: Top Holdings + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Top Holdings</h2>
            <Link to="/portfolio" className="text-sm flex items-center gap-1 hover:opacity-80" style={{ color: 'var(--accent)' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {portfolio?.positions?.length > 0 ? (
            <div className="space-y-1">
              {portfolio.positions.slice(0, 5).map((pos: any) => (
                <Link to={`/markets/${pos.assetId}`} key={pos.id} style={{ textDecoration: 'none' }}>
                  <div className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={pos.symbol} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-white">{pos.symbol}</p>
                        <p className="text-xs text-gray-500">
                          {Number(pos.quantity).toFixed(Number(pos.quantity) % 1 ? 4 : 0)} shares
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {pos.currency} {Number(pos.marketValue).toLocaleString('en', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">{pos.allocation}%</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase size={28} className="mx-auto mb-2 text-gray-700" />
              <p className="text-sm text-gray-500">No holdings yet</p>
              <Link to="/markets" className="btn-primary inline-flex items-center gap-1.5 mt-3"
                style={{ fontSize: 13, padding: '7px 16px' }}>
                <DollarSign size={13} />
                Browse Markets
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Clock size={15} className="text-gray-500" />
              Recent Orders
            </h2>
            <Link to="/orders" className="text-sm flex items-center gap-1 hover:opacity-80" style={{ color: 'var(--accent)' }}>
              All orders <ArrowRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={28} className="mx-auto mb-2 text-gray-700" />
              <p className="text-sm text-gray-500">No orders yet</p>
              <Link to="/markets" className="text-xs mt-2 inline-block" style={{ color: 'var(--accent)' }}>
                Start trading →
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <StockLogo symbol={order.asset?.symbol ?? '?'} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white">{order.asset?.symbol}</span>
                        <Badge variant={order.side === 'BUY' ? 'blue' : 'red'}>{order.side}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {order.currency} {Number(order.estimatedTotal).toFixed(2)}
                    </p>
                    <Badge variant={order.status === 'FILLED' ? 'green' : order.status === 'CANCELLED' ? 'red' : 'yellow'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function isNSEOpen(): boolean {
  const now = new Date();
  const eat = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
  const day = eat.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = eat.getHours() * 60 + eat.getMinutes();
  return minutes >= 9 * 60 && minutes < 15 * 60;
}
