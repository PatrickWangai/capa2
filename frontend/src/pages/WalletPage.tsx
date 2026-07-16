import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Wallet, ArrowRightLeft, TrendingDown, Plus, History } from 'lucide-react';
import { PageLoader, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const FLAG: Record<string, string> = { KES: '🇰🇪', USD: '🇺🇸', GBP: '🇬🇧', EUR: '🇪🇺' };
const LABEL: Record<string, string> = { KES: 'Kenyan Shilling', USD: 'US Dollar', GBP: 'British Pound', EUR: 'Euro' };

export default function WalletPage() {
  const qc = useQueryClient();
  const [depositAmt, setDepositAmt] = useState('');
  const [depositing, setDepositing]  = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wallets'],
    queryFn:  () => api.get('/api/wallets').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: recentData } = useQuery({
    queryKey: ['wallet-conversions-recent'],
    queryFn:  () => api.get('/api/wallets/conversions?limit=5').then(r => r.data),
  });

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmt);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    setDepositing(true);
    try {
      await api.post('/api/wallets/deposit-kes', { amount: amt });
      toast.success(`KES ${amt.toLocaleString()} deposited!`);
      setDepositAmt('');
      refetch();
      qc.invalidateQueries({ queryKey: ['wallet-conversions-recent'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Deposit failed');
    } finally { setDepositing(false); }
  };

  if (isLoading) return <PageLoader />;

  const balances: any[] = data?.balances ?? [];
  const kesBal = balances.find(b => b.currency === 'KES');
  const usdBal = balances.find(b => b.currency === 'USD');
  const rate   = data?.rates?.USD_KES || 130;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 mt-1">Your KES and USD balances</p>
      </div>

      {/* Rate banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.18)', color: 'var(--accent)' }}>
        <ArrowRightLeft size={14} />
        <span>Live rate: 1 USD = {Number(rate).toFixed(4)} KES</span>
        <span className="ml-auto text-xs opacity-60">Updated hourly · {data?.rates?.source === 'live' ? 'live' : 'fallback'}</span>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { currency: 'KES', bal: kesBal },
          { currency: 'USD', bal: usdBal },
        ].map(({ currency, bal }) => (
          <div key={currency} className="card">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{FLAG[currency]}</span>
              <div>
                <p className="text-xs text-gray-500">{LABEL[currency]}</p>
                <p className="text-sm font-semibold text-white">{currency}</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {Number(bal?.available ?? 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {bal?.reserved && Number(bal.reserved) > 0 && (
              <p className="text-xs text-gray-500 mt-1">{Number(bal.reserved).toFixed(2)} reserved</p>
            )}
          </div>
        ))}
      </div>

      {/* Deposit KES */}
      <div className="card">
        <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Plus size={15} style={{ color: 'var(--accent)' }} />
          Deposit KES
        </h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">KES</span>
            <input
              className="input pl-12"
              type="number"
              placeholder="0.00"
              value={depositAmt}
              onChange={e => setDepositAmt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeposit()}
            />
          </div>
          <button
            className="btn-primary"
            disabled={depositing}
            onClick={handleDeposit}
            style={{ padding: '0 20px', fontSize: 14 }}>
            {depositing ? 'Depositing…' : 'Deposit'}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Mock deposit — balance credited immediately. TODO: wire to real M-Pesa STK push.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link to="/wallet/convert" style={{ textDecoration: 'none' }}>
          <div className="card hover:border-gray-700 transition-all cursor-pointer" style={{ padding: '16px 18px' }}>
            <ArrowRightLeft size={18} style={{ color: 'var(--accent)' }} className="mb-2" />
            <p className="font-semibold text-white text-sm">Convert</p>
            <p className="text-xs text-gray-500 mt-0.5">KES ↔ USD</p>
          </div>
        </Link>
        <Link to="/wallet/history" style={{ textDecoration: 'none' }}>
          <div className="card hover:border-gray-700 transition-all cursor-pointer" style={{ padding: '16px 18px' }}>
            <History size={18} style={{ color: 'var(--accent)' }} className="mb-2" />
            <p className="font-semibold text-white text-sm">FX History</p>
            <p className="text-xs text-gray-500 mt-0.5">All conversions</p>
          </div>
        </Link>
        <Link to="/markets" style={{ textDecoration: 'none' }}>
          <div className="card hover:border-gray-700 transition-all cursor-pointer" style={{ padding: '16px 18px' }}>
            <TrendingDown size={18} style={{ color: 'var(--accent)' }} className="mb-2" />
            <p className="font-semibold text-white text-sm">Invest</p>
            <p className="text-xs text-gray-500 mt-0.5">Browse markets</p>
          </div>
        </Link>
      </div>

      {/* Recent conversions */}
      {(recentData?.conversions?.length ?? 0) > 0 && (
        <div className="card p-0">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="font-semibold text-white text-sm">Recent Conversions</h2>
            <Link to="/wallet/history" className="text-xs" style={{ color: 'var(--accent)' }}>View all</Link>
          </div>
          <div>
            {recentData.conversions.map((c: any, i: number) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{FLAG[c.fromCurrency]}</span>
                  <ArrowRightLeft size={12} className="text-gray-600" />
                  <span className="text-lg">{FLAG[c.toCurrency]}</span>
                  <div className="ml-1">
                    <p className="text-sm text-white">
                      {c.fromCurrency} {Number(c.fromAmount).toFixed(2)} → {c.toCurrency} {Number(c.toAmount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">@ {Number(c.rate).toFixed(4)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
