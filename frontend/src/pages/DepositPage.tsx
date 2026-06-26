import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Smartphone, Building2, ArrowUpCircle, Clock } from 'lucide-react';
import { Badge, PageLoader } from '../components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type Mode = 'mpesa' | 'bank' | 'withdraw';

export default function DepositPage() {
  const [mode, setMode] = useState<Mode>('mpesa');
  const [loading, setLoading] = useState(false);
  const [mpesaForm, setMpesaForm] = useState({ phone: '', amount: '' });
  const [bankForm, setBankForm] = useState({ amount: '', currency: 'USD' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', currency: 'USD', method: 'MPESA', phone: '', bankAccount: '', bankName: '' });
  const [bankInstructions, setBankInstructions] = useState<any>(null);

  const { data: histData, isLoading: histLoading, refetch } = useQuery({
    queryKey: ['deposit-history'],
    queryFn: () => api.get('/api/deposits/history').then(r => r.data),
  });

  const submitMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaForm.phone || !mpesaForm.amount) return toast.error('Fill in all fields.');
    setLoading(true);
    try {
      await api.post('/api/deposits/mpesa', { phone: mpesaForm.phone, amount: Number(mpesaForm.amount), currency: 'KES' });
      toast.success('M-Pesa prompt sent! Check your phone and enter your PIN.');
      setMpesaForm({ phone: '', amount: '' });
      setTimeout(() => refetch(), 5000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'M-Pesa request failed');
    } finally { setLoading(false); }
  };

  const submitBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/deposits/bank', { amount: Number(bankForm.amount), currency: bankForm.currency });
      setBankInstructions(data.bankDetails);
      toast.success('Bank transfer initiated. Use the reference below.');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Bank deposit failed');
    } finally { setLoading(false); }
  };

  const submitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/deposits/withdraw', { amount: Number(withdrawForm.amount), currency: withdrawForm.currency, method: withdrawForm.method, phone: withdrawForm.phone, bankAccount: withdrawForm.bankAccount, bankName: withdrawForm.bankName });
      toast.success('Withdrawal request submitted. Processing in 1-2 business days.');
      setWithdrawForm({ amount: '', currency: 'USD', method: 'MPESA', phone: '', bankAccount: '', bankName: '' });
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Withdrawal failed');
    } finally { setLoading(false); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, 'green'|'yellow'|'red'|'gray'> = { COMPLETED: 'green', PENDING: 'yellow', FAILED: 'red', PROCESSING: 'blue' as any };
    return <Badge variant={map[s] || 'gray'}>{s}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deposit & Withdraw</h1>
        <p className="text-gray-400 mt-1">Fund your account or cash out</p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'mpesa' as Mode, label: 'M-Pesa', icon: Smartphone, desc: 'Instant — KES' },
          { id: 'bank' as Mode,  label: 'Bank Transfer', icon: Building2, desc: 'USD · GBP · KES' },
          { id: 'withdraw' as Mode, label: 'Withdraw', icon: ArrowUpCircle, desc: 'Cash out funds' },
        ].map(({ id, label, icon: Icon, desc }) => (
          <button key={id} onClick={() => { setMode(id); setBankInstructions(null); }}
            className={clsx('p-4 rounded-xl border-2 text-left transition-all', mode === id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 bg-gray-900 hover:border-gray-700')}>
            <Icon size={22} className={mode === id ? 'text-blue-400' : 'text-gray-500'} />
            <p className={clsx('font-semibold mt-2 text-sm', mode === id ? 'text-white' : 'text-gray-300')}>{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Forms */}
        <div className="card">
          {/* M-Pesa */}
          {mode === 'mpesa' && (
            <form onSubmit={submitMpesa} className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="text-green-400" size={22} />
                  <h2 className="font-semibold text-white">M-Pesa Deposit</h2>
                </div>
                <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg text-sm text-green-300 mb-4">
                  You'll receive an STK push on your M-Pesa registered phone. Enter your PIN to complete.
                </div>
              </div>
              <div>
                <label className="label">M-Pesa Phone Number</label>
                <input className="input" placeholder="+254700000000 or 0700000000" value={mpesaForm.phone}
                  onChange={e => setMpesaForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Amount (KES)</label>
                <input className="input" type="number" min="10" placeholder="e.g. 5000" value={mpesaForm.amount}
                  onChange={e => setMpesaForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Sending prompt…' : 'Send M-Pesa Prompt'}
              </button>
            </form>
          )}

          {/* Bank Transfer */}
          {mode === 'bank' && !bankInstructions && (
            <form onSubmit={submitBank} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="text-blue-400" size={22} />
                <h2 className="font-semibold text-white">Bank Transfer</h2>
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input" value={bankForm.currency} onChange={e => setBankForm(f => ({ ...f, currency: e.target.value }))}>
                  <option value="USD">USD — US Dollar</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="KES">KES — Kenyan Shilling</option>
                </select>
              </div>
              <div>
                <label className="label">Amount</label>
                <input className="input" type="number" min="1" placeholder="e.g. 1000" value={bankForm.amount}
                  onChange={e => setBankForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Processing…' : 'Get Bank Details'}
              </button>
            </form>
          )}

          {mode === 'bank' && bankInstructions && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="text-blue-400" size={22} />
                <h2 className="font-semibold text-white">Transfer Instructions</h2>
              </div>
              <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg text-sm text-blue-200">
                Transfer funds arrive in 1-3 business days after confirmation.
              </div>
              {[
                ['Bank Name', bankInstructions.bankName],
                ['Account Number', bankInstructions.accountNumber],
                ['Sort Code', bankInstructions.sortCode],
                ['Reference', bankInstructions.reference],
                ['Amount', `${bankInstructions.currency} ${Number(bankInstructions.amount).toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                  <span className="text-sm text-gray-400">{k}</span>
                  <span className="text-sm font-medium text-white font-mono select-all">{v}</span>
                </div>
              ))}
              <button onClick={() => setBankInstructions(null)} className="btn-secondary w-full">Start New Transfer</button>
            </div>
          )}

          {/* Withdraw */}
          {mode === 'withdraw' && (
            <form onSubmit={submitWithdraw} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpCircle className="text-teal-400" size={22} />
                <h2 className="font-semibold text-white">Withdraw Funds</h2>
              </div>
              <div>
                <label className="label">Withdrawal Method</label>
                <select className="input" value={withdrawForm.method} onChange={e => setWithdrawForm(f => ({ ...f, method: e.target.value }))}>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount</label>
                  <input className="input" type="number" min="1" placeholder="0.00" value={withdrawForm.amount}
                    onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select className="input" value={withdrawForm.currency} onChange={e => setWithdrawForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="KES">KES</option>
                  </select>
                </div>
              </div>
              {withdrawForm.method === 'MPESA' && (
                <div>
                  <label className="label">M-Pesa Phone</label>
                  <input className="input" placeholder="+254700000000" value={withdrawForm.phone}
                    onChange={e => setWithdrawForm(f => ({ ...f, phone: e.target.value }))} required />
                </div>
              )}
              {withdrawForm.method === 'BANK_TRANSFER' && (
                <>
                  <div>
                    <label className="label">Bank Name</label>
                    <input className="input" placeholder="e.g. Equity Bank" value={withdrawForm.bankName}
                      onChange={e => setWithdrawForm(f => ({ ...f, bankName: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Account Number</label>
                    <input className="input" placeholder="Your account number" value={withdrawForm.bankAccount}
                      onChange={e => setWithdrawForm(f => ({ ...f, bankAccount: e.target.value }))} required />
                  </div>
                </>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Submitting…' : 'Submit Withdrawal'}
              </button>
            </form>
          )}
        </div>

        {/* Transaction history */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" /> Recent Transactions
          </h2>
          {histLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse" />)}</div>
          ) : histData?.transactions?.length > 0 ? (
            <div className="space-y-2">
              {histData.transactions.slice(0, 10).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{tx.type.replace('_', ' ')} via {tx.paymentInstruction?.paymentMethod?.replace('_', ' ') || '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={clsx('text-sm font-semibold', tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400')}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.currency} {Number(tx.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                    </p>
                    {statusBadge(tx.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 text-sm">No transactions yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
