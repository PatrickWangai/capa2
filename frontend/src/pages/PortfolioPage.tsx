import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Briefcase, DollarSign, ArrowUpDown, Download, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { StatCard, EmptyState, Badge, PageLoader } from '../components/ui';
import { StockLogo } from '../components/ui/StockLogo';
import clsx from 'clsx';

const TABS = ['Holdings', 'Transactions', 'Dividends'];
type SortKey = 'value' | 'name';
type Period = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
const PERIODS: Period[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

const COLORS = ['#2563EB', '#14B8A6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#06B6D4'];

export default function PortfolioPage() {
  const [tab, setTab] = useState('Holdings');
  const [sort, setSort] = useState<SortKey>('value');
  const [period, setPeriod] = useState<Period>('1M');

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: historyData } = useQuery({
    queryKey: ['portfolio-history', period],
    queryFn: () => api.get(`/api/portfolio/history?period=${period}`).then(r => r.data),
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

  const totalGainLoss = Number(summary.totalGainLoss || 0);
  const totalGainLossPct = Number(summary.totalGainLossPct || 0);
  const dailyChange = Number(summary.dailyChange || 0);
  const dailyChangePct = Number(summary.dailyChangePct || 0);

  const sortedPositions = [...positions].sort((a, b) => {
    if (sort === 'value') return Number(b.marketValue) - Number(a.marketValue);
    return a.symbol.localeCompare(b.symbol);
  });

  const pieData = positions.map((p, i) => ({
    name: p.symbol, value: Number(p.marketValue), fill: COLORS[i % COLORS.length],
  }));

  // Best & worst performers
  let bestPerformer: any = null, worstPerformer: any = null;
  for (const p of positions) {
    const pct = Number(p.gainLossPct);
    if (!bestPerformer || pct > Number(bestPerformer.gainLossPct)) bestPerformer = p;
    if (!worstPerformer || pct < Number(worstPerformer.gainLossPct)) worstPerformer = p;
  }

  // Chart
  const chartPoints = (historyData?.history || []).map((h: any) => ({
    date: new Date(h.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: Number(h.value),
  }));
  const chartColor = totalGainLoss >= 0 ? 'var(--primary)' : '#ef4444';

  const downloadCSV = () => {
    const rows = [
      ['Symbol', 'Name', 'Exchange', 'Shares', 'Avg Cost', 'Current Price', 'Market Value', 'Gain/Loss', 'Gain/Loss %', 'Currency'],
      ...sortedPositions.map(p => [
        p.symbol, p.name, p.exchange,
        p.quantity, p.avgCostPrice, p.currentPrice,
        p.marketValue, p.gainLoss, p.gainLossPct + '%', p.currency,
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capa-portfolio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400 mt-1">Your holdings and performance</p>
        </div>
        {sortedPositions.length > 0 && (
          <button onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--border)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
            <Download size={14} /> Export CSV
          </button>
        )}
      </div>

      {/* Summary — 4 stat cards */}
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
          label="Total Return"
          value={`${totalGainLoss >= 0 ? '+' : '−'}$${Math.abs(totalGainLoss).toLocaleString('en', { minimumFractionDigits: 2 })}`}
          icon={totalGainLoss >= 0 ? TrendingUp : TrendingDown}
          positive={totalGainLoss >= 0}
          sub={`${totalGainLossPct >= 0 ? '+' : ''}${totalGainLossPct.toFixed(2)}% all time`}
        />
        <StatCard
          label="Today's Change"
          value={`${dailyChange >= 0 ? '+' : '−'}$${Math.abs(dailyChange).toLocaleString('en', { minimumFractionDigits: 2 })}`}
          icon={BarChart2}
          positive={dailyChange >= 0}
          sub={`${dailyChangePct >= 0 ? '+' : ''}${dailyChangePct.toFixed(2)}% today`}
        />
      </div>

      {/* P&L Chart */}
      {chartPoints.length > 1 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Portfolio Value</h2>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={clsx('text-xs px-2.5 py-1 rounded-lg font-medium transition-colors',
                    period === p ? 'text-white' : 'text-gray-500 hover:text-gray-300')}
                  style={period === p ? { backgroundColor: 'var(--primary)', opacity: 0.9 } : {}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartPoints} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} width={44} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`$${Number(v).toLocaleString('en', { minimumFractionDigits: 2 })}`, 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill="url(#portGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Best / Worst performers */}
      {positions.length >= 2 && bestPerformer && worstPerformer && bestPerformer.id !== worstPerformer.id && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Best Performer</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StockLogo symbol={bestPerformer.symbol} size="sm" />
                <div>
                  <p className="font-semibold text-white text-sm">{bestPerformer.symbol}</p>
                  <p className="text-xs text-gray-500">{bestPerformer.exchange}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold text-sm">
                  +{Number(bestPerformer.gainLossPct).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500">
                  +${Number(bestPerformer.gainLoss).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Worst Performer</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StockLogo symbol={worstPerformer.symbol} size="sm" />
                <div>
                  <p className="font-semibold text-white text-sm">{worstPerformer.symbol}</p>
                  <p className="text-xs text-gray-500">{worstPerformer.exchange}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={clsx('font-bold text-sm', Number(worstPerformer.gainLossPct) < 0 ? 'text-red-400' : 'text-green-400')}>
                  {Number(worstPerformer.gainLossPct) >= 0 ? '+' : ''}{Number(worstPerformer.gainLossPct).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500">
                  {Number(worstPerformer.gainLoss) >= 0 ? '+' : ''}${Number(worstPerformer.gainLoss).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={clsx('px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                t === tab ? 'text-blue-400' : 'border-transparent text-gray-400 hover:text-white')}
              style={t === tab ? { borderBottomColor: 'var(--primary)', color: 'var(--primary)' } : {}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Holdings tab ── */}
      {tab === 'Holdings' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {sortedPositions.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {sortedPositions.length} position{sortedPositions.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-500">Sort by</span>
                  {(['value', 'name'] as SortKey[]).map(s => (
                    <button key={s} onClick={() => setSort(s)}
                      className={clsx('text-xs px-2.5 py-1 rounded-lg font-medium transition-colors',
                        sort === s ? 'text-white' : 'text-gray-500 hover:text-gray-300')}
                      style={sort === s ? { backgroundColor: 'var(--primary)', opacity: 0.9 } : {}}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
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
                  <p className={clsx('text-xs font-medium', Number(pos.gainLossPct) >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {Number(pos.gainLossPct) >= 0 ? '+' : ''}{Number(pos.gainLossPct).toFixed(2)}%
                  </p>
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
