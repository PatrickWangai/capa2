import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowDownUp, X, TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { Badge, EmptyState, PageLoader } from '../components/ui';
import { StockLogo } from '../components/ui/StockLogo';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray'> = {
  FILLED: 'green', PENDING: 'yellow', OPEN: 'blue', CANCELLED: 'gray', REJECTED: 'red', EXPIRED: 'gray',
};

type StatusFilter = 'ALL' | 'PENDING' | 'OPEN' | 'FILLED' | 'CANCELLED';
type SideFilter   = 'ALL' | 'BUY' | 'SELL';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sideFilter, setSideFilter]     = useState<SideFilter>('ALL');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () =>
      api.get('/api/orders', { params: statusFilter !== 'ALL' ? { status: statusFilter } : {} })
        .then(r => r.data),
    refetchInterval: 10_000,
  });

  const cancel = async (id: string) => {
    try {
      await api.delete(`/api/orders/${id}`);
      toast.success('Order cancelled.');
      qc.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Cancel failed');
    }
  };

  const allOrders: any[] = data?.orders ?? [];
  const orders = sideFilter === 'ALL' ? allOrders : allOrders.filter(o => o.side === sideFilter);

  // Stats
  const filled   = allOrders.filter(o => o.status === 'FILLED').length;
  const pending  = allOrders.filter(o => ['PENDING', 'OPEN'].includes(o.status)).length;
  const totalFees = allOrders.filter(o => o.status === 'FILLED')
    .reduce((s, o) => s + Number(o.fee || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 mt-1">Your trade history and open orders</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: String(allOrders.length) },
          { label: 'Filled',       value: String(filled),   positive: true  },
          { label: 'Pending',      value: String(pending),  warn: pending > 0 },
          { label: 'Total Fees',   value: `$${totalFees.toFixed(2)}` },
        ].map(({ label, value, positive, warn }) => (
          <div key={label} className="card" style={{ padding: '14px 18px' }}>
            <p className="text-xs text-gray-400">{label}</p>
            <p className={clsx('text-xl font-bold mt-1', positive ? 'text-green-400' : warn ? 'text-yellow-400' : 'text-white')}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', 'PENDING', 'OPEN', 'FILLED', 'CANCELLED'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
                statusFilter === s ? 'text-white' : 'text-gray-400 hover:text-white')}
              style={{
                background: statusFilter === s ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                border: statusFilter === s ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {s}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-700 hidden sm:block" />

        {/* Side filter */}
        <div className="flex gap-1.5">
          {(['ALL', 'BUY', 'SELL'] as SideFilter[]).map(s => (
            <button key={s} onClick={() => setSideFilter(s)}
              className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1',
                sideFilter === s ? 'text-white' : 'text-gray-400 hover:text-white')}
              style={{
                background: sideFilter === s
                  ? s === 'BUY' ? '#10b981' : s === 'SELL' ? '#ef4444' : 'rgba(255,255,255,0.12)'
                  : 'rgba(255,255,255,0.06)',
                border: sideFilter === s ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {s === 'BUY' && <TrendingUp size={10} />}
              {s === 'SELL' && <TrendingDown size={10} />}
              {s === 'ALL' && <Flame size={10} />}
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Asset', 'Side', 'Type', 'Qty', 'Price', 'Total', 'Fee', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={10}>
                  <EmptyState icon={ArrowDownUp} title="No orders found" description="Place your first order from the Markets page." />
                </td></tr>
              ) : orders.map((o: any, idx: number) => (
                <tr key={o.id}
                  className="hover:bg-white/[0.025] transition-colors"
                  style={{ borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={o.asset?.symbol ?? '?'} size="sm" />
                      <div>
                        <p className="font-semibold text-white text-sm">{o.asset?.symbol}</p>
                        <p className="text-xs text-gray-500">{o.asset?.exchange}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-sm font-bold', o.side === 'BUY' ? 'text-green-400' : 'text-red-400')}>{o.side}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs uppercase">{o.orderType}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">
                    {Number(o.filledQuantity) > 0
                      ? <>{Number(o.filledQuantity).toFixed(4)}<span className="text-gray-600">/{Number(o.quantity).toFixed(4)}</span></>
                      : Number(o.quantity).toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">
                    {o.avgFillPrice
                      ? `${o.currency} ${Number(o.avgFillPrice).toFixed(2)}`
                      : o.limitPrice
                        ? `${o.currency} ${Number(o.limitPrice).toFixed(2)}`
                        : <span className="text-gray-500">Market</span>}
                  </td>
                  <td className="px-4 py-3 text-white text-sm font-semibold">
                    {o.filledTotal
                      ? `${o.currency} ${Number(o.filledTotal).toFixed(2)}`
                      : o.estimatedTotal
                        ? <span className="text-gray-400">~{o.currency} {Number(o.estimatedTotal).toFixed(2)}</span>
                        : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{Number(o.fee).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[o.status] || 'gray'}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    {['PENDING', 'OPEN'].includes(o.status) && (
                      <button onClick={() => cancel(o.id)}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <p className="text-center text-xs pb-1 text-gray-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
          {sideFilter !== 'ALL' ? ` · ${sideFilter} only` : ''}
          {statusFilter !== 'ALL' ? ` · ${statusFilter}` : ''}
        </p>
      )}
    </div>
  );
}
