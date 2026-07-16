import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowRightLeft, TrendingUp, Plus, History, ArrowUpRight, Receipt } from 'lucide-react';
import { PageLoader } from '../components/ui';
import toast from 'react-hot-toast';

const FLAG:  Record<string, string> = { KES: '🇰🇪', USD: '🇺🇸', GBP: '🇬🇧', EUR: '🇪🇺' };
const LABEL: Record<string, string> = { KES: 'Kenyan Shilling', USD: 'US Dollar', GBP: 'British Pound', EUR: 'Euro' };

type Tab = 'deposit' | 'withdraw';

export default function WalletPage() {
  const qc = useQueryClient();
  const [tab,          setTab]         = useState<Tab>('deposit');
  const [depositAmt,   setDepositAmt]  = useState('');
  const [withdrawAmt,  setWithdrawAmt] = useState('');
  const [withdrawPhone,setPhone]       = useState('');
  const [busy,         setBusy]        = useState(false);

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
  const kesBal = balances.find(b => b.currency === 'KES');
  const usdBal = balances.find(b => b.currency === 'USD');
  const rate   = data?.rates?.USD_KES ?? 130;

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
            {Number(bal?.reserved ?? 0) > 0 && (
              <p className="text-xs text-gray-500 mt-1">{Number(bal.reserved).toFixed(2)} reserved</p>
            )}
          </div>
        ))}
      </div>

      {/* Deposit / Withdraw card */}
      <div className="card space-y-4">
        {/* Tab toggle */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {(['deposit', 'withdraw'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
              style={{
                background: tab === t ? 'var(--accent)' : 'transparent',
                color:      tab === t ? 'var(--accent-text)' : 'rgba(255,255,255,0.55)',
              }}>
              {t === 'deposit' ? '+ Deposit KES' : '↑ Withdraw KES'}
            </button>
          ))}
        </div>

        {tab === 'deposit' ? (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">KES</span>
                <input className="input pl-12" type="number" placeholder="0.00"
                  value={depositAmt} onChange={e => setDepositAmt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDeposit()} />
              </div>
              <button className="btn-primary" disabled={busy} onClick={handleDeposit}
                style={{ padding: '0 20px', fontSize: 14 }}>
                {busy ? 'Processing…' : 'Deposit'}
              </button>
            </div>
            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2">
              {[500, 1000, 5000, 10000, 50000].map(n => (
                <button key={n} onClick={() => setDepositAmt(String(n))}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  KES {n.toLocaleString()}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Mock deposit — credited instantly. TODO: wire to M-Pesa STK push.
            </p>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">KES</span>
                <input className="input pl-12" type="number" placeholder="0.00"
                  value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} />
              </div>
              <button className="btn-primary" disabled={busy} onClick={handleWithdraw}
                style={{ padding: '0 20px', fontSize: 14 }}>
                {busy ? 'Processing…' : 'Withdraw'}
              </button>
            </div>
            <input className="input" type="tel" placeholder="M-Pesa phone (optional, e.g. 0712345678)"
              value={withdrawPhone} onChange={e => setPhone(e.target.value)} />
            <p className="text-xs text-gray-400">
              Available: KES {Number(kesBal?.available ?? 0).toLocaleString('en', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-600">
              Mock withdrawal — funds marked pending. TODO: wire to M-Pesa B2C disbursement.
            </p>
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/wallet/convert" style={{ textDecoration: 'none' }}>
          <div className="card hover:border-gray-600 transition-all cursor-pointer" style={{ padding: '14px 16px' }}>
            <ArrowRightLeft size={17} style={{ color: 'var(--accent)' }} className="mb-2" />
            <p className="font-semibold text-white text-sm">Convert</p>
            <p className="text-xs text-gray-500 mt-0.5">KES ↔ USD</p>
          </div>
        </Link>
        <Link to="/wallet/history" style={{ textDecoration: 'none' }}>
          <div className="card hover:border-gray-600 transition-all cursor-pointer" style={{ padding: '14px 16px' }}>
            <History size={17} style={{ color: 'var(--accent)' }} className="mb-2" />
            <p className="font-semibold text-white text-sm">FX History</p>
            <p className="text-xs text-gray-500 mt-0.5">Conversions</p>
          </div>
        </Link>
        <Link to="/wallet/transactions" style={{ textDecoration: 'none' }}>
          <div className="card hover:border-gray-600 transition-all cursor-pointer" style={{ padding: '14px 16px' }}>
            <Receipt size={17} style={{ color: 'var(--accent)' }} className="mb-2" />
            <p className="font-semibold text-white text-sm">Transactions</p>
            <p className="text-xs text-gray-500 mt-0.5">All activity</p>
          </div>
        </Link>
        <Link to="/markets" style={{ textDecoration: 'none' }}>
          <div className="card hover:border-gray-600 transition-all cursor-pointer" style={{ padding: '14px 16px' }}>
            <TrendingUp size={17} style={{ color: 'var(--accent)' }} className="mb-2" />
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
