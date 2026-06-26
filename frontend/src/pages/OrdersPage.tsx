import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowDownUp, X } from 'lucide-react';
import { Badge, EmptyState, PageLoader } from '../components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUS_VARIANT: Record<string, 'green'|'yellow'|'red'|'blue'|'gray'> = {
  FILLED: 'green', PENDING: 'yellow', OPEN: 'blue', CANCELLED: 'gray', REJECTED: 'red', EXPIRED: 'gray',
};

export default function OrdersPage() {
  const [filter, setFilter] = useState('ALL');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders', filter],
    queryFn: () => api.get('/api/orders', { params: filter !== 'ALL' ? { status: filter } : {} }).then(r => r.data),
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

  const orders = data?.orders || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 mt-1">Your trade history and open orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'OPEN', 'FILLED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', filter === s ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700')}>
            {s}
          </button>
        ))}
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Asset', 'Side', 'Type', 'Qty', 'Price', 'Total', 'Fee', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.length === 0 ? (
                <tr><td colSpan={10}>
                  <EmptyState icon={ArrowDownUp} title="No orders found" description="Place your first order from the Markets page." />
                </td></tr>
              ) : orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-blue-400">
                        {o.asset?.symbol?.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{o.asset?.symbol}</p>
                        <p className="text-xs text-gray-500">{o.asset?.exchange}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-sm font-semibold', o.side === 'BUY' ? 'text-green-400' : 'text-red-400')}>{o.side}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{o.orderType}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">
                    {Number(o.filledQuantity) > 0 ? <>{Number(o.filledQuantity).toFixed(4)}<span className="text-gray-500">/{Number(o.quantity).toFixed(4)}</span></> : Number(o.quantity).toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">
                    {o.avgFillPrice ? `${o.currency} ${Number(o.avgFillPrice).toFixed(2)}` : o.limitPrice ? `${o.currency} ${Number(o.limitPrice).toFixed(2)}` : 'Market'}
                  </td>
                  <td className="px-4 py-3 text-white text-sm font-medium">
                    {o.filledTotal ? `${o.currency} ${Number(o.filledTotal).toFixed(2)}` : o.estimatedTotal ? `~${o.currency} ${Number(o.estimatedTotal).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{Number(o.fee).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[o.status] || 'gray'}>{o.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {['PENDING', 'OPEN'].includes(o.status) && (
                      <button onClick={() => cancel(o.id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                        <X size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
