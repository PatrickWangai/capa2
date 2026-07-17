import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, Smartphone, Building2, CheckCircle, Info } from 'lucide-react';
import { PageLoader } from '../components/ui';
import toast from 'react-hot-toast';

const CURRENCIES = ['KES','USD','GBP','EUR','CAD','AUD','JPY','CHF','HKD','SGD','ZAR'];
const FLAG: Record<string,string> = { KES:'🇰🇪',USD:'🇺🇸',GBP:'🇬🇧',EUR:'🇪🇺',CAD:'🇨🇦',AUD:'🇦🇺',JPY:'🇯🇵',CHF:'🇨🇭',HKD:'🇭🇰',SGD:'🇸🇬',ZAR:'🇿🇦' };
const QUICK_AMOUNTS: Record<string, number[]> = {
  KES:[500,1000,5000,10000,50000], USD:[10,50,100,500,1000],
  GBP:[10,50,100,500,1000],        EUR:[10,50,100,500,1000],
  default:[10,50,100,500,1000],
};

type Method = 'MPESA' | 'BANK_TRANSFER';

export default function DepositPage() {
  const qc = useQueryClient();
  const [method,    setMethod]   = useState<Method>('MPESA');
  const [currency,  setCurrency] = useState('KES');
  const [amount,    setAmount]   = useState('');
  const [phone,     setPhone]    = useState('');
  const [bank,      setBank]     = useState('');
  const [bankCode,  setBankCode] = useState('');
  const [busy,      setBusy]     = useState(false);
  const [success,   setSuccess]  = useState<any>(null);

  const { data: rateData } = useQuery({
    queryKey: ['fx-rates'],
    queryFn:  () => api.get('/api/wallets/fx-rates').then(r => r.data),
    staleTime: 60_000,
  });

  const { data: walletData, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn:  () => api.get('/api/wallets').then(r => r.data),
  });

  const balances: any[] = walletData?.balances ?? [];
  const currBal  = balances.find(b => b.currency === currency);
  const quickAmts = QUICK_AMOUNTS[currency] ?? QUICK_AMOUNTS.default;

  const handleDeposit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (method === 'MPESA' && !phone) return toast.error('Enter your M-Pesa phone number');
    setBusy(true);
    try {
      const { data } = await api.post('/api/wallets/deposit', {
        amount: amt, currency, method,
        ...(phone ? { phone } : {}),
        ...(bank  ? { bankAccount: bank, bankCode } : {}),
      });
      setSuccess(data);
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Deposit failed');
    } finally { setBusy(false); }
  };

  if (isLoading) return <PageLoader />;

  if (success) return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card text-center py-10 space-y-4">
        <CheckCircle size={48} className="mx-auto" style={{ color: '#34d399' }} />
        <h2 className="text-xl font-bold text-white">Deposit Successful</h2>
        <p className="text-gray-400 text-sm">{success.message}</p>
        <p className="text-3xl font-bold text-white">{currency} {parseFloat(amount).toLocaleString('en', { minimumFractionDigits: 2 })}</p>
        <p className="text-xs text-gray-600">{success.provider?.message}</p>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => { setSuccess(null); setAmount(''); }} className="btn-primary">Deposit Again</button>
          <Link to="/wallet" className="btn-secondary">Go to Wallet</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/wallet" style={{ color: 'var(--accent)', display: 'flex' }}>
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Deposit</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Add funds to your wallet</p>
        </div>
      </div>

      {/* Mock notice */}
      <div className="flex gap-2 px-4 py-2.5 rounded-xl text-sm"
        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span>Payment is simulated — no real money is moved. Balance is credited instantly.</span>
      </div>

      <div className="card space-y-5">
        {/* Currency */}
        <div>
          <label className="label">Currency</label>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: currency === c ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                  color:      currency === c ? 'var(--accent-text)' : 'rgba(255,255,255,0.65)',
                }}>
                {FLAG[c]} {c}
              </button>
            ))}
          </div>
          {currBal && (
            <p className="text-xs text-gray-500 mt-2">
              Current balance: {FLAG[currency]} {currency} {Number(currBal.available).toLocaleString('en', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Method */}
        <div>
          <label className="label">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            {([['MPESA','M-Pesa',Smartphone,'🟢'], ['BANK_TRANSFER','Bank Transfer',Building2,'🏦']] as const).map(
              ([val, label, Icon, emoji]) => (
                <button key={val} onClick={() => setMethod(val as Method)}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                  style={{
                    background:  method === val ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
                    border:      `1.5px solid ${method === val ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <Icon size={18} style={{ color: method === val ? 'var(--accent)' : 'rgba(255,255,255,0.5)' }} />
                  <span className="text-sm font-semibold" style={{ color: method === val ? 'var(--accent)' : 'rgba(255,255,255,0.75)' }}>
                    {label}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount</label>
          <input className="input" type="number" placeholder="0.00"
            value={amount} onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDeposit()} />
          <div className="flex flex-wrap gap-2 mt-2">
            {quickAmts.map(n => (
              <button key={n} onClick={() => setAmount(String(n))}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {n.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Method-specific fields */}
        {method === 'MPESA' ? (
          <div>
            <label className="label">M-Pesa Phone Number</label>
            <input className="input" type="tel" placeholder="e.g. 0712 345 678"
              value={phone} onChange={e => setPhone(e.target.value)} />
            <p className="text-xs text-gray-600 mt-1">You will receive an STK push on your phone to confirm.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="label">Bank Account Number</label>
              <input className="input" type="text" placeholder="e.g. 1234567890"
                value={bank} onChange={e => setBank(e.target.value)} />
            </div>
            <div>
              <label className="label">Bank Code (optional)</label>
              <input className="input" type="text" placeholder="e.g. 01 (KCB)"
                value={bankCode} onChange={e => setBankCode(e.target.value)} />
            </div>
            <div className="rounded-xl p-3 text-sm text-gray-400"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-semibold text-white mb-1">Bank Transfer Instructions</p>
              <p>Account Name: <strong className="text-white">CAPA Investments Ltd</strong></p>
              <p>Account No: <strong className="text-white">1100123456</strong></p>
              <p>Bank: <strong className="text-white">Kenya Commercial Bank (KCB)</strong></p>
              <p>Reference: <strong className="text-white">Your CAPA email</strong></p>
            </div>
          </div>
        )}

        <button className="btn-primary w-full" disabled={busy || !amount}
          onClick={handleDeposit} style={{ padding: '14px', fontSize: 15 }}>
          {busy ? 'Processing…' : `Deposit ${currency} ${amount ? Number(amount).toLocaleString() : ''}`}
        </button>
      </div>
    </div>
  );
}
