import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, Smartphone, Building2, CheckCircle, Info } from 'lucide-react';
import { PageLoader } from '../components/ui';
import toast from 'react-hot-toast';

const CURRENCIES = ['KES','USD','GBP','EUR','CAD','AUD','JPY','CHF','HKD','SGD','ZAR'];
const FLAG: Record<string,string> = { KES:'🇰🇪',USD:'🇺🇸',GBP:'🇬🇧',EUR:'🇪🇺',CAD:'🇨🇦',AUD:'🇦🇺',JPY:'🇯🇵',CHF:'🇨🇭',HKD:'🇭🇰',SGD:'🇸🇬',ZAR:'🇿🇦' };

type Method = 'MPESA' | 'BANK_TRANSFER';

export default function WithdrawPage() {
  const qc = useQueryClient();
  const [method,   setMethod]  = useState<Method>('MPESA');
  const [currency, setCurrency]= useState('KES');
  const [amount,   setAmount]  = useState('');
  const [phone,    setPhone]   = useState('');
  const [bank,     setBank]    = useState('');
  const [bankCode, setBankCode]= useState('');
  const [busy,     setBusy]    = useState(false);
  const [success,  setSuccess] = useState<any>(null);

  const { data: walletData, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn:  () => api.get('/api/wallets').then(r => r.data),
  });

  const balances: any[] = walletData?.balances ?? [];
  const currBal = balances.find(b => b.currency === currency);
  const avail   = Number(currBal?.available ?? 0);

  const setMax = () => setAmount(avail.toFixed(2));

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > avail) return toast.error(`Insufficient ${currency}. Available: ${avail.toFixed(2)}`);
    if (method === 'MPESA' && !phone) return toast.error('Enter your M-Pesa phone number');
    setBusy(true);
    try {
      const { data } = await api.post('/api/wallets/withdraw', {
        amount: amt, currency, method,
        ...(phone ? { phone } : {}),
        ...(bank  ? { bankAccount: bank, bankCode } : {}),
      });
      setSuccess(data);
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Withdrawal failed');
    } finally { setBusy(false); }
  };

  if (isLoading) return <PageLoader />;

  if (success) return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card text-center py-10 space-y-4">
        <CheckCircle size={48} className="mx-auto" style={{ color: '#34d399' }} />
        <h2 className="text-xl font-bold text-white">Withdrawal Submitted</h2>
        <p className="text-gray-400 text-sm">{success.message}</p>
        <p className="text-3xl font-bold text-white">{currency} {parseFloat(amount).toLocaleString('en', { minimumFractionDigits: 2 })}</p>
        <p className="text-xs text-gray-600 max-w-xs mx-auto">
          {method === 'MPESA' ? 'Funds will arrive on your M-Pesa within minutes once processed.' : 'Funds will arrive in your bank account within 1–2 business days.'}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => { setSuccess(null); setAmount(''); }} className="btn-primary">Withdraw Again</button>
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
          <h1 className="text-2xl font-bold text-white">Withdraw</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Withdraw funds from your wallet</p>
        </div>
      </div>

      {/* Mock notice */}
      <div className="flex gap-2 px-4 py-2.5 rounded-xl text-sm"
        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span>Withdrawals are simulated — funds are reserved and marked pending, no real transfer occurs.</span>
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
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              Available: <span className="text-white font-semibold">{currency} {avail.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
            </p>
            {avail > 0 && (
              <button onClick={setMax} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Max</button>
            )}
          </div>
        </div>

        {/* Method */}
        <div>
          <label className="label">Withdrawal Method</label>
          <div className="grid grid-cols-2 gap-3">
            {(['MPESA','BANK_TRANSFER'] as Method[]).map(m => {
              const Icon  = m === 'MPESA' ? Smartphone : Building2;
              const label = m === 'MPESA' ? 'M-Pesa' : 'Bank Transfer';
              return (
                <button key={m} onClick={() => setMethod(m)}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                  style={{
                    background: method === m ? 'var(--accent-dim)' : 'rgba(255,255,255,0.04)',
                    border:     `1.5px solid ${method === m ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <Icon size={18} style={{ color: method === m ? 'var(--accent)' : 'rgba(255,255,255,0.5)' }} />
                  <span className="text-sm font-semibold" style={{ color: method === m ? 'var(--accent)' : 'rgba(255,255,255,0.75)' }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">{currency}</span>
            <input className="input pl-14" type="number" placeholder="0.00"
              max={avail} value={amount} onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleWithdraw()} />
          </div>
        </div>

        {/* Method fields */}
        {method === 'MPESA' ? (
          <div>
            <label className="label">M-Pesa Phone Number</label>
            <input className="input" type="tel" placeholder="e.g. 0712 345 678"
              value={phone} onChange={e => setPhone(e.target.value)} />
            <p className="text-xs text-gray-600 mt-1">Funds will be sent directly to this number.</p>
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
          </div>
        )}

        {/* Summary */}
        {amount && Number(amount) > 0 && (
          <div className="rounded-xl p-4 space-y-1.5 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex justify-between"><span className="text-gray-400">You withdraw</span><span className="text-white font-semibold">{currency} {Number(amount).toLocaleString('en',{minimumFractionDigits:2})}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Remaining balance</span><span className="text-white">{currency} {Math.max(0, avail - Number(amount)).toLocaleString('en',{minimumFractionDigits:2})}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Method</span><span className="text-white">{method === 'MPESA' ? 'M-Pesa' : 'Bank Transfer'}</span></div>
          </div>
        )}

        <button className="btn-primary w-full" disabled={busy || !amount || Number(amount) > avail}
          onClick={handleWithdraw} style={{ padding: '14px', fontSize: 15 }}>
          {busy ? 'Processing…' : `Withdraw ${currency} ${amount ? Number(amount).toLocaleString() : ''}`}
        </button>
      </div>
    </div>
  );
}
