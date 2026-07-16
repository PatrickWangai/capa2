import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Briefcase, DollarSign, ArrowUpDown } from 'lucide-react';
import { StatCard, EmptyState, Badge, PageLoader } from '../components/ui';
import { StockLogo } from '../components/ui/StockLogo';
import clsx from 'clsx';

const TABS = ['Holdings', 'Performance', 'Transactions', 'Dividends'];
const PERIODS = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;
type Period = typeof PERIODS[number];
type SortKey = 'value' | 'pnl' | 'name';

const COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#06B6D4'];

export default function PortfolioPage() {
  const [tab, setTab] = useState('Holdings');
  const [period, setPeriod] = useState<Period>('1M');
  const [sort, setSort] = useState<SortKey>('value');

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: histData, isLoading: histLoading } = useQuery({
    queryKey: ['portfolio-history', period],
    queryFn: () => api.get(`/api/portfolio/history?period=${period}`).then(r => r.data),
    enabled: tab === 'Performance',
  });

  const { data: divData } = useQuery({
    queryKey: ['dividends'],
    queryFn: () => api.get('/api/portfolio/dividends').then(r => r.data),
    enabled: tab === 'Dividends',
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/api/orders?limit=100').then(r => r.data),
    enabled: tab === 'Transactions',
  });

  if (isLoading) return <PageLoader />;

  const summary = portfolio?.summary || {};
  const positions: any[] = portfolio?.positions || [];
  const balances: any[] = portfolio?.cashBalances || [];
  const gainLoss = Number(summary.totalGainLoss || 0);
  const isUp = gainLoss >= 0;

  const sortedPositions = [...positions].sort((a, b) => {
    if (sort === 'value') return Number(b.marketValue) - Number(a.marketValue);
    if (sort === 'pnl') return Number(b.gainLossPct) - Number(a.gainLossPct);
    return a.symbol.localeCompare(b.symbol);
  });

  const pieData = positions.map((p, i) => ({
    name: p.symbol, value: Number(p.marketValue), fill: COLORS[i % COLORS.length],
  }));

  const histPoints: any[] = histData?.history ?? [];
  const firstVal = histPoints[0]?.value;
  const lastVal = histPoints[histPoints.length - 1]?.value;
  const periodChange = firstVal != null && lastVal != null ? Number(lastVal) - Number(firstVal) : null;
  const periodColor = periodChange === null || periodChange >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <p className="text-gray-400 mt-1">Your holdings and performance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Value"
          value={`$${Number(summary.totalValue || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`}
          icon={Briefcase}
        />
        <StatCard
          label="Total Invested"
          value={`$${Number(summary.totalInvested || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <StatCard
          label="Total P&L"
          value={`${isUp ? '+' : ''}$${Math.abs(gainLoss).toFixed(2)}`}
          sub={`${summary.totalGainLossPct}%`}
          positive={isUp}
          icon={isUp ? TrendingUp : TrendingDown}
        />
        <StatCard
          label="Day Change"
          value={`${Number(summary.dailyChange || 0) >= 0 ? '+' : ''}$${Number(summary.dailyChange || 0).toFixed(2)}`}
          sub={`${summary.dailyChangePct}%`}
          positive={Number(summary.dailyChange || 0) >= 0}
        />
      </div>


      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx('px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                t === tab ? 'text-blue-400' : 'border-transparent text-gray-400 hover:text-white')}
              style={t === tab ? { borderBottomColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Holdings tab ── */}
      {tab === 'Holdings' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Sort controls */}
            {sortedPositions.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {sortedPositions.length} position{sortedPositions.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-500">Sort by</span>
                  {(['value', 'pnl', 'name'] as SortKey[]).map(s => (
                    <button key={s} onClick={() => setSort(s)}
                      className={clsx('text-xs px-2.5 py-1 rounded-lg font-medium transition-colors',
                        sort === s ? 'text-white' : 'text-gray-500 hover:text-gray-300')}
                      style={sort === s ? { backgroundColor: 'var(--accent)', opacity: 0.9 } : {}}>
                      {s === 'pnl' ? 'P&L' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sortedPositions.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={Briefcase}
                  title="No holdings yet"
                  description="Start investing to build your portfolio."
                  action={<Link to="/markets" className="btn-primary">Browse Markets</Link>}
                />
              </div>
            ) : sortedPositions.map((pos: any) => (
              <Link to={`/markets/${pos.assetId}`} key={pos.id}
                className="card flex items-center justify-between hover:border-gray-700 transition-colors cursor-pointer group"
                style={{ textDecoration: 'none' }}>
                <div className="flex items-center gap-3">
                  <StockLogo symbol={pos.symbol} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{pos.symbol}</span>
                      <Badge variant="blue">{pos.exchange}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Number(pos.quantity).toFixed(pos.quantity % 1 ? 4 : 0)} shares ·
                      avg {pos.currency} {Number(pos.avgCostPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {pos.currency} {Number(pos.marketValue).toLocaleString('en', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-3 justify-end mt-0.5">
                    <span className="text-xs text-gray-500">{pos.allocation}%</span>
                    <p className={clsx('text-sm', Number(pos.gainLoss) >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {Number(pos.gainLoss) >= 0 ? '+' : ''}{pos.gainLossPct}%
                      <span className="text-xs ml-1 opacity-70">
                        ({Number(pos.gainLoss) >= 0 ? '+' : ''}{Number(pos.gainLoss).toFixed(2)})
                      </span>
                    </p>
                  </div>
                  {Number(pos.dayGainLoss) !== 0 && (
                    <p className={clsx('text-xs mt-0.5', Number(pos.dayGainLoss) >= 0 ? 'text-green-400' : 'text-red-400')}>
                      Day: {Number(pos.dayGainLoss) >= 0 ? '+' : ''}{Number(pos.dayGainLoss).toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Allocation donut */}
          {sortedPositions.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Allocation</h2>
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="value" paddingAngle={2}>
                      {pieData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                      formatter={(v: any, _: any, props: any) => [`$${Number(v).toFixed(2)}`, props.payload.name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500">Total</p>
                    <p className="text-sm font-bold text-white">
                      ${Number(summary.totalValue || 0).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {positions.slice(0, 6).map((pos: any, i: number) => (
                  <div key={pos.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-300">{pos.symbol}</span>
                    </div>
                    <span className="text-gray-400">{pos.allocation}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Performance tab ── */}
      {tab === 'Performance' && (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-gray-800/60">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={clsx('px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
                    period === p ? 'text-white' : 'text-gray-500 hover:text-gray-300')}
                  style={period === p ? { backgroundColor: 'rgba(255,255,255,0.10)' } : {}}>
                  {p}
                </button>
              ))}
            </div>
            {periodChange !== null && (
              <div className="ml-auto text-right">
                <p className={clsx('text-sm font-semibold', periodChange >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {periodChange >= 0 ? '+' : ''}${Math.abs(periodChange).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{period} change</p>
              </div>
            )}
          </div>
          <div className="p-6">
            {histLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2" style={{ borderColor: 'var(--accent)' }} />
              </div>
            ) : histPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={histPoints}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={periodColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={periodColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `$${Number(v).toFixed(0)}`} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                    formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Portfolio Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke={periodColor} strokeWidth={2} fill="url(#pg)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} title="No performance data yet" description="Trade to start building history." />
            )}
          </div>
        </div>
      )}

      {/* ── Transactions tab ── */}
      {tab === 'Transactions' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Asset', 'Type', 'Order Type', 'Qty', 'Amount', 'Fee', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ordersData?.orders?.length > 0 ? ordersData.orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-800/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <StockLogo symbol={o.asset?.symbol ?? '?'} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-white">{o.asset?.symbol}</p>
                        <p className="text-xs text-gray-500">{o.asset?.exchange}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={o.side === 'BUY' ? 'blue' : 'red'}>{o.side}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 uppercase">{o.orderType}</td>
                  <td className="px-5 py-3 text-sm text-gray-300">{Number(o.quantity).toFixed(4)}</td>
                  <td className="px-5 py-3 text-sm font-medium text-white">
                    {o.currency} {Number(o.estimatedTotal).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">{Number(o.fee).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={
                      o.status === 'FILLED' ? 'green' :
                      o.status === 'CANCELLED' ? 'red' : 'yellow'
                    }>{o.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-500">No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Dividends tab ── */}
      {tab === 'Dividends' && (
        <div className="space-y-4">
          {divData?.totalDividends && (
            <div className="card">
              <p className="text-sm text-gray-400">Total Dividends Received</p>
              <p className="text-3xl font-bold text-white mt-1">${Number(divData.totalDividends).toFixed(2)}</p>
            </div>
          )}
          <div className="card overflow-x-auto p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Asset', 'Shares', 'Gross', 'Tax', 'Net', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {divData?.payments?.length > 0 ? divData.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-800/40">
                    <td className="px-5 py-3 font-medium text-white text-sm">{p.dividend?.asset?.symbol}</td>
                    <td className="px-5 py-3 text-gray-300 text-sm">{Number(p.sharesHeld).toFixed(4)}</td>
                    <td className="px-5 py-3 text-gray-300 text-sm">{p.currency} {Number(p.grossAmount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-red-400 text-sm">{Number(p.taxWithheld).toFixed(2)}</td>
                    <td className="px-5 py-3 text-green-400 font-medium text-sm">{p.currency} {Number(p.netAmount).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={p.status === 'COMPLETED' ? 'green' : 'yellow'}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-500">No dividends yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
