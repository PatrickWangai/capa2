import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Check } from 'lucide-react';
import { Badge, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TYPE_BADGE: Record<string, 'green'|'red'|'blue'|'yellow'|'gray'> = {
  DEPOSIT: 'green', WITHDRAWAL: 'red', BUY: 'blue', SELL: 'yellow', DIVIDEND: 'green',
};

export default function AdminTransactionsPage() {
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', type, status],
    queryFn: () => api.get('/api/admin/transactions', {
      params: { ...(type !== 'ALL' && { type }), ...(status !== 'ALL' && { status }), limit: 100 }
    }).then(r => r.data),
    refetchInterval: 20_000,
  });

  const confirm = async (id: string) => {
    try {
      await api.patch(`/api/admin/transactions/${id}/confirm`);
      toast.success('Transaction confirmed and balance updated.');
      qc.invalidateQueries({ queryKey: ['admin-transactions'] });
    } catch { toast.error('Confirm failed'); }
  };

  const txs = data?.transactions || [];

  return (
    <div className="space-y-5 max-w-7xl">
      <div><h1 className="text-2xl font-bold text-white">Transactions</h1><p className="text-gray-400 mt-1">All platform transactions</p></div>

      <div className="flex flex-wrap gap-2">
        {['ALL','DEPOSIT','WITHDRAWAL','BUY','SELL','DIVIDEND'].map(t => (
          <button key={t} onClick={() => setType(t)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium', type === t ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700')}>{t}</button>
        ))}
        <div className="w-px bg-gray-700 self-stretch" />
        {['ALL','PENDING','COMPLETED','FAILED'].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium', status === s ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700')}>{s}</button>
        ))}
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead><tr className="border-b border-gray-800">
              {['User', 'Type', 'Amount', 'Currency', 'Method', 'Status', 'Date', ''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-800">
              {txs.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{tx.account?.user?.firstName} {tx.account?.user?.lastName}</p>
                    <p className="text-xs text-gray-400">{tx.account?.user?.email}</p>
                  </td>
                  <td className="px-4 py-3"><Badge variant={TYPE_BADGE[tx.type] || 'gray'}>{tx.type}</Badge></td>
                  <td className="px-4 py-3 text-white font-medium text-sm">{Number(tx.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{tx.currency}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{tx.paymentInstruction?.paymentMethod?.replace('_',' ') || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={tx.status === 'COMPLETED' ? 'green' : tx.status === 'FAILED' ? 'red' : 'yellow'}>{tx.status}</Badge></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {tx.status === 'PENDING' && ['DEPOSIT','WITHDRAWAL'].includes(tx.type) && (
                      <button onClick={() => confirm(tx.id)} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300">
                        <Check size={13} /> Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {txs.length === 0 && <div className="text-center py-12 text-gray-500">No transactions found.</div>}
        </div>
      )}
    </div>
  );
}
