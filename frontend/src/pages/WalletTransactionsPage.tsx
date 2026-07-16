import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Receipt } from 'lucide-react';
import { PageLoader, EmptyState } from '../components/ui';

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  DEPOSIT:       { label: 'Deposit',    icon: ArrowDownLeft,  color: '#34d399' },
  WITHDRAWAL:    { label: 'Withdrawal', icon: ArrowUpRight,   color: '#f87171' },
  FX_CONVERSION: { label: 'FX Convert', icon: ArrowRightLeft, color: '#60a5fa' },
  BUY:           { label: 'Buy',        icon: ArrowUpRight,   color: '#f87171' },
  SELL:          { label: 'Sell',       icon: ArrowDownLeft,  color: '#34d399' },
  DIVIDEND:      { label: 'Dividend',   icon: ArrowDownLeft,  color: '#a78bfa' },
};

const FLAG: Record<string, string> = { KES: '🇰🇪', USD: '🇺🇸', GBP: '🇬🇧', EUR: '🇪🇺' };

const CURRENCIES = ['All', 'KES', 'USD'];

export default function WalletTransactionsPage() {
  const [currency, setCurrency] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['wallet-transactions', currency],
    queryFn:  () =>
      api.get(`/api/wallets/transactions?limit=100${currency !== 'All' ? `&currency=${currency}` : ''}`)
         .then(r => r.data),
    refetchInterval: 30_000,
  });

  const transactions: any[] = data?.transactions ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/wallet" style={{ color: 'var(--accent)', display: 'flex' }}>
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-0.5 text-sm">All wallet activity</p>
        </div>
      </div>

      {/* Currency filter */}
      <div className="flex gap-2">
        {CURRENCIES.map(c => (
          <button key={c} onClick={() => setCurrency(c)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: currency === c ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
              color:      currency === c ? 'var(--accent-text)' : 'rgba(255,255,255,0.65)',
              border:     '1px solid',
              borderColor: currency === c ? 'transparent' : 'rgba(255,255,255,0.08)',
            }}>
            {c !== 'All' && FLAG[c]} {c}
          </button>
        ))}
      </div>

      {isLoading ? <PageLoader /> : transactions.length === 0 ? (
        <div className="card">
          <EmptyState icon={Receipt} title="No transactions yet" description="Deposit KES to get started." />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card p-0 hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Type', 'Amount', 'Currency', 'Fee', 'Status', 'Description', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any, i: number) => {
                  const meta = TYPE_META[tx.type] ?? { label: tx.type, icon: Receipt, color: '#9ca3af' };
                  const Icon = meta.icon;
                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.025] transition-colors"
                      style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon size={14} style={{ color: meta.color, flexShrink: 0 }} />
                          <span className="text-sm text-white">{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: meta.color }}>
                        {['BUY', 'WITHDRAWAL'].includes(tx.type) ? '−' : '+'}{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{FLAG[tx.currency]} {tx.currency}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{Number(tx.fee ?? 0).toFixed(4)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: tx.status === 'COMPLETED' ? 'rgba(52,211,153,0.12)' : tx.status === 'PENDING' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                            color:      tx.status === 'COMPLETED' ? '#34d399' : tx.status === 'PENDING' ? '#fbbf24' : '#f87171',
                          }}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{tx.description ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' '}
                        {new Date(tx.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="block lg:hidden space-y-2">
            {transactions.map((tx: any) => {
              const meta = TYPE_META[tx.type] ?? { label: tx.type, icon: Receipt, color: '#9ca3af' };
              const Icon = meta.icon;
              return (
                <div key={tx.id} className="card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: meta.color }} />
                      <span className="text-sm font-semibold text-white">{meta.label}</span>
                      <span className="text-xs text-gray-500">{FLAG[tx.currency]} {tx.currency}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: meta.color }}>
                      {['BUY', 'WITHDRAWAL'].includes(tx.type) ? '−' : '+'}{Number(tx.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: tx.status === 'COMPLETED' ? 'rgba(52,211,153,0.12)' : tx.status === 'PENDING' ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                        color:      tx.status === 'COMPLETED' ? '#34d399' : tx.status === 'PENDING' ? '#fbbf24' : '#f87171',
                      }}>
                      {tx.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                      {' '}
                      {new Date(tx.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {tx.description && <p className="text-xs text-gray-600 mt-1.5 truncate">{tx.description}</p>}
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-600 pb-1">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}
