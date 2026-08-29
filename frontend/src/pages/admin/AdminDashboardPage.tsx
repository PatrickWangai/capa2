import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Users, ShieldCheck, DollarSign, TrendingUp, Clock, AlertTriangle, Receipt, BarChart2 } from 'lucide-react';
import { StatCard, PageLoader } from '../../components/ui';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

type AnalyticsPeriod = 7 | 14 | 30 | 90;
const PERIODS: AnalyticsPeriod[] = [7, 14, 30, 90];

function MiniChart({ data, dataKey, color, label, formatter }: {
  data: any[]; dataKey: string; color: string; label: string;
  formatter?: (v: any) => string;
}) {
  if (!data.length) return (
    <div className="h-28 flex items-center justify-center text-xs text-gray-600">No data yet</div>
  );
  return (
    <ResponsiveContainer width="100%" height={110}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={d => d?.slice(5)} interval="preserveStartEnd" />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={32}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
        <Tooltip
          contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
          formatter={(v: any) => [formatter ? formatter(v) : v, label]}
          labelFormatter={d => d}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#grad-${dataKey})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboardPage() {
  const [analyticsDays, setAnalyticsDays] = useState<AnalyticsPeriod>(30);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/api/admin/dashboard').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics', analyticsDays],
    queryFn: () => api.get(`/api/admin/analytics?days=${analyticsDays}`).then(r => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) return <PageLoader />;

  const kycMap: Record<string, number> = {};
  (data?.kycBreakdown || []).forEach((k: any) => { kycMap[k.kycStatus] = k._count; });

  const signups: any[]  = analyticsData?.signups  ?? [];
  const orders: any[]   = analyticsData?.orders   ?? [];
  const deposits: any[] = analyticsData?.deposits ?? [];

  const totalNewUsers   = signups.reduce((s, r) => s + r.count, 0);
  const totalNewOrders  = orders.reduce((s, r) => s + r.count, 0);
  const totalNewDeposits = deposits.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"     value={String(data?.totalUsers || 0)} icon={Users} />
        <StatCard label="Orders Today"    value={String(data?.ordersToday || 0)} icon={TrendingUp} />
        <StatCard label="Pending KYC"     value={String(data?.pendingKycDocs || 0)} sub="Needs review" positive={data?.pendingKycDocs === 0} icon={AlertTriangle} />
        <StatCard label="Total Deposited" value={`$${Number(data?.totalDeposited || 0).toLocaleString('en', { minimumFractionDigits: 2 })}`} icon={DollarSign} />
      </div>

      {/* ── Growth & Activity Charts ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <BarChart2 size={16} className="text-violet-400" /> Growth &amp; Activity
          </h2>
          <div className="flex gap-1">
            {PERIODS.map(d => (
              <button key={d} onClick={() => setAnalyticsDays(d)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${analyticsDays === d ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                style={analyticsDays === d ? { backgroundColor: 'var(--primary)', opacity: 0.9 } : {}}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Signups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">New Users</p>
              <p className="text-sm font-bold text-white">{totalNewUsers}</p>
            </div>
            <MiniChart data={signups} dataKey="count" color="#8b5cf6" label="Signups" />
          </div>

          {/* Trades */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Trades Filled</p>
              <p className="text-sm font-bold text-white">{totalNewOrders}</p>
            </div>
            <MiniChart data={orders} dataKey="count" color="var(--primary)" label="Trades" />
          </div>

          {/* Deposits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Deposits</p>
              <p className="text-sm font-bold text-white">
                ${totalNewDeposits.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <MiniChart
              data={deposits} dataKey="amount" color="#10b981" label="Deposited"
              formatter={v => `$${Number(v).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            />
          </div>
        </div>
      </div>

      {/* Tax & Revenue */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Receipt size={16} className="text-emerald-400" /> Tax &amp; Revenue
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Fees Collected', value: Number(data?.totalFees || 0), color: 'text-white' },
            { label: 'Broker Revenue',        value: Number(data?.brokerRevenue || 0), color: 'text-emerald-400' },
            { label: 'Tax Collected',         value: Number(data?.taxCollected || 0), color: 'text-yellow-400' },
            { label: 'Trades (completed)',    value: null, count: Number(data?.totalTradeCount || 0), color: 'text-blue-400' },
          ].map(({ label, value, count, color }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>
                {count !== undefined
                  ? count.toLocaleString()
                  : `$${(value ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl p-3 text-xs" style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
          <p className="text-gray-500 mb-2 font-semibold uppercase tracking-wide">Tax breakdown per trade</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-gray-400">
            {[
              ['Broker commission', '1.00%'],
              ['VAT (on broker fee)', '0.16%'],
              ['NSE transaction levy', '0.12%'],
              ['CMA regulatory levy', '0.06%'],
              ['CDSC settlement levy', '0.05%'],
              ['Stamp duty (buys only)', '0.10%'],
            ].map(([name, rate]) => (
              <div key={name} className="flex justify-between gap-2">
                <span>{name}</span><span className="text-white font-medium">{rate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-blue-400" /> KYC Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Approved', key: 'APPROVED', color: 'bg-green-500' },
              { label: 'Pending', key: 'PENDING', color: 'bg-yellow-500' },
              { label: 'Rejected', key: 'REJECTED', color: 'bg-red-500' },
              { label: 'Not Started', key: 'NOT_STARTED', color: 'bg-gray-600' },
            ].map(({ label, key, color }) => {
              const count = kycMap[key] || 0;
              const total = data?.totalUsers || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-blue-400" /> Quick Stats</h2>
          <div className="space-y-3">
            {[
              { label: 'New users (7 days)', value: data?.newUsers7d || 0 },
              { label: 'Orders today', value: data?.ordersToday || 0 },
              { label: 'KYC docs pending', value: data?.pendingKycDocs || 0 },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-lg font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
