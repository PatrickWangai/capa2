import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowRightLeft, TrendingUp, History, Receipt, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { PageLoader } from '../components/ui';

const FLAG:  Record<string, string> = {
  KES:'🇰🇪',USD:'🇺🇸',GBP:'🇬🇧',EUR:'🇪🇺',
  CAD:'🇨🇦',AUD:'🇦🇺',JPY:'🇯🇵',CHF:'🇨🇭',HKD:'🇭🇰',SGD:'🇸🇬',ZAR:'🇿🇦',
};
const LABEL: Record<string, string> = {
  KES:'Kenyan Shilling',USD:'US Dollar',GBP:'British Pound',EUR:'Euro',
  CAD:'Canadian Dollar',AUD:'Australian Dollar',JPY:'Japanese Yen',
  CHF:'Swiss Franc',HKD:'Hong Kong Dollar',SGD:'Singapore Dollar',ZAR:'South African Rand',
};

export default function WalletPage() {
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wallets'],
    queryFn:  () => api.get('/api/wallets').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: recentData } = useQuery({
    queryKey: ['wallet-conversions-recent'],
    queryFn:  () => api.get('/api/wallets/conversions?limit=5').then(r => r.data),
  });

  const balances: any[] = data?.balances ?? [];
  const kesBal  = balances.find(b => b.currency === 'KES');
  const rate    = data?.rates?.USD_KES ?? 130;

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmt);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    setBusy(true);
    try {
      await api.post('/api/wallets/deposit-kes', { amount: amt });
      toast.success(`KES ${amt.toLocaleString()} deposited!`);
      setDepositAmt('');
      refetch();
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Deposit failed');
    } finally { setBusy(false); }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmt);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    setBusy(true);
    try {
      await api.post('/api/wallets/withdraw-kes', { amount: amt, phone: withdrawPhone || undefined });
      toast.success('Withdrawal request submitted. Funds arrive in 1–2 business days.');
      setWithdrawAmt('');
      setPhone('');
      refetch();
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Withdrawal failed');
    } finally { setBusy(false); }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 mt-1 text-sm">Your KES and USD balances</p>
      </div>

      {/* Live rate banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.18)', color: 'var(--accent)' }}>
        <ArrowRightLeft size={14} />
        <span>Live rate: 1 USD = {Number(rate).toFixed(4)} KES</span>
        <span className="ml-auto text-xs opacity-60">
          {data?.rates?.source === 'live' ? 'Live · updated hourly' : 'Fallback rate'}
        </span>
      </div>

      {/* Balance cards — all 11 currencies */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {balances.map(({ currency: ccy, available, reserved }: any) => (
          <div key={ccy} className="card" style={{ padding: '14px 16px' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xl">{FLAG[ccy] ?? '💱'}</span>
              <div>
                <p className="text-xs text-gray-500 leading-tight" style={{ fontSize: 10 }}>{LABEL[ccy] ?? ccy}</p>
                <p className="text-xs font-semibold text-white">{ccy}</p>
              </div>
            </div>
            <p className="text-lg font-bold text-white">
              {Number(available).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {Number(reserved) > 0 && (
              <p className="text-xs text-gray-600 mt-0.5">{Number(reserved).toFixed(2)} reserved</p>
            )}
          </div>
        ))}
      </div>


      {/* Quick actions */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { to: '/deposit',           icon: ArrowDownLeft,  label: 'Deposit',      sub: 'Add funds'     },
          { to: '/withdraw',          icon: ArrowUpRight,   label: 'Withdraw',     sub: 'Cash out'      },
          { to: '/wallet/convert',    icon: ArrowRightLeft, label: 'Convert',      sub: 'KES ↔ USD'    },
          { to: '/wallet/history',    icon: History,        label: 'FX History',   sub: 'Conversions'   },
          { to: '/wallet/transactions',icon:Receipt,        label: 'Transactions', sub: 'All activity'  },
          { to: '/markets',           icon: TrendingUp,     label: 'Invest',       sub: 'Markets'       },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card hover:border-gray-600 transition-all cursor-pointer text-center" style={{ padding: '12px 8px' }}>
              <Icon size={16} style={{ color: 'var(--accent)', margin: '0 auto 6px' }} />
              <p className="font-semibold text-white" style={{ fontSize: 11 }}>{label}</p>
              <p className="text-gray-500" style={{ fontSize: 10 }}>{sub}</p>
            </div>
          </Link>
        ))}
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
