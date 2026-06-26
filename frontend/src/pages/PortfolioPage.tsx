import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, Briefcase, DollarSign } from 'lucide-react';
import { StatCard, EmptyState, Badge, PageLoader } from '../components/ui';
import clsx from 'clsx';

const TABS = ['Holdings', 'Performance', 'Dividends'];
const COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#06B6D4'];

export default function PortfolioPage() {
  const [tab, setTab] = useState('Holdings');

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: histData } = useQuery({
    queryKey: ['portfolio-history', '3M'],
    queryFn: () => api.get('/api/portfolio/history?period=3M').then(r => r.data),
    enabled: tab === 'Performance',
  });

  const { data: divData } = useQuery({
    queryKey: ['dividends'],
    queryFn: () => api.get('/api/portfolio/dividends').then(r => r.data),
    enabled: tab === 'Dividends',
  });

  if (isLoading) return <PageLoader />;

  const summary = portfolio?.summary || {};
  const positions = portfolio?.positions || [];
  const balances = portfolio?.cashBalances || [];
  const gainLoss = Number(summary.totalGainLoss || 0);
  const isUp = gainLoss >= 0;

  const pieData = positions.map((p: any, i: number) => ({
    name: p.symbol, value: Number(p.marketValue), fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <p className="text-gray-400 mt-1">Your holdings and performance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Value" value={`$${Number(summary.totalValue || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`} icon={Briefcase} />
        <StatCard label="Total Invested" value={`$${Number(summary.totalInvested || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`} icon={DollarSign} />
        <StatCard
          label="Total P&L"
          value={`${isUp ? '+' : ''}$${Math.abs(gainLoss).toFixed(2)}`}
          sub={`${summary.totalGainLossPct}%`}
          positive={isUp}
          icon={isUp ? TrendingUp : TrendingDown}
        />
        <StatCard label="Day Change" value={`${Number(summary.dailyChange || 0) >= 0 ? '+' : ''}$${Number(summary.dailyChange || 0).toFixed(2)}`}
          sub={`${summary.dailyChangePct}%`} positive={Number(summary.dailyChange || 0) >= 0} />
      </div>

      {/* Cash balances */}
      {balances.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-3">Cash Balances</h2>
          <div className="flex flex-wrap gap-4">
            {balances.map((b: any) => (
              <div key={b.currency} className="bg-gray-800 rounded-lg px-4 py-3 min-w-[140px]">
                <p className="text-xs text-gray-400">{b.currency} Available</p>
                <p className="text-lg font-bold text-white mt-0.5">{Number(b.available).toLocaleString('en', { minimumFractionDigits: 2 })}</p>
                {Number(b.reserved) > 0 && <p className="text-xs text-gray-500 mt-0.5">Reserved: {Number(b.reserved).toFixed(2)}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx('px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px', t === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Holdings tab */}
      {tab === 'Holdings' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {positions.length === 0 ? (
              <div className="card">
                <EmptyState icon={Briefcase} title="No holdings yet" description="Start investing to build your portfolio." action={<Link to="/markets" className="btn-primary">Browse Markets</Link>} />
              </div>
            ) : positions.map((pos: any) => (
              <Link to={`/markets/${pos.assetId}`} key={pos.id} className="card flex items-center justify-between hover:border-gray-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-sm font-bold text-blue-400 group-hover:bg-gray-700 transition-colors">
                    {pos.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{pos.symbol}</span>
                      <Badge variant="blue">{pos.exchange}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{Number(pos.quantity).toFixed(pos.quantity % 1 ? 4 : 0)} shares · avg {pos.currency} {Number(pos.avgCostPrice).toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{pos.currency} {Number(pos.marketValue).toLocaleString('en', { minimumFractionDigits: 2 })}</p>
                  <p className={clsx('text-sm mt-0.5', Number(pos.gainLoss) >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {Number(pos.gainLoss) >= 0 ? '+' : ''}{pos.gainLossPct}%
                    <span className="text-xs ml-1 opacity-70">({Number(pos.gainLoss) >= 0 ? '+' : ''}{Number(pos.gainLoss).toFixed(2)})</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Allocation pie */}
          {positions.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Allocation</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                    formatter={(v: any, _: any, props: any) => [`$${Number(v).toFixed(2)}`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
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

      {/* Performance tab */}
      {tab === 'Performance' && (
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Portfolio History (3 Months)</h2>
          {histData?.history?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={histData.history}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `$${Number(v).toFixed(0)}`} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Value']} />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#pg)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={TrendingUp} title="No performance data yet" description="Trade to start building history." />}
        </div>
      )}

      {/* Dividends tab */}
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
              <thead><tr className="border-b border-gray-800">
                {['Asset', 'Shares', 'Gross', 'Tax', 'Net', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-800">
                {divData?.payments?.length > 0 ? divData.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-800/40">
                    <td className="px-5 py-3 font-medium text-white text-sm">{p.dividend?.asset?.symbol}</td>
                    <td className="px-5 py-3 text-gray-300 text-sm">{Number(p.sharesHeld).toFixed(4)}</td>
                    <td className="px-5 py-3 text-gray-300 text-sm">{p.currency} {Number(p.grossAmount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-red-400 text-sm">{Number(p.taxWithheld).toFixed(2)}</td>
                    <td className="px-5 py-3 text-green-400 font-medium text-sm">{p.currency} {Number(p.netAmount).toFixed(2)}</td>
                    <td className="px-5 py-3"><Badge variant={p.status === 'COMPLETED' ? 'green' : 'yellow'}>{p.status}</Badge></td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-500">No dividends yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
