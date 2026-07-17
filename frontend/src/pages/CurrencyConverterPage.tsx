import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowRightLeft, ChevronLeft, Info } from 'lucide-react';
import { PageLoader } from '../components/ui';
import toast from 'react-hot-toast';

const FLAG: Record<string, string> = { KES: '🇰🇪', USD: '🇺🇸' };

export default function CurrencyConverterPage() {
  const qc = useQueryClient();
  const [from,      setFrom]      = useState<'KES' | 'USD'>('KES');
  const [amount,    setAmount]    = useState('');
  const [preview,   setPreview]   = useState<any>(null);
  const [loading,   setLoading]   = useState(false);
  const [confirming,setConfirming] = useState(false);

  const to = from === 'KES' ? 'USD' : 'KES';

  const { data: rateData, isLoading: ratesLoading } = useQuery({
    queryKey: ['fx-rates'],
    queryFn:  () => api.get('/api/wallets/fx-rates').then(r => r.data),
    staleTime: 60_000,
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallets'],
    queryFn:  () => api.get('/api/wallets').then(r => r.data),
    refetchInterval: 15_000,
  });

  const rate = rateData?.rates?.[`${from}_${to}`] ?? (from === 'KES' ? rateData?.rates?.KES_USD : rateData?.rates?.USD_KES) ?? null;
  const balances: any[] = walletData?.balances ?? [];
  const fromBal = balances.find(b => b.currency === from);

  // Live preview (no DB write)
  useEffect(() => {
    const n = parseFloat(amount);
    if (!n || n <= 0 || !rate) { setPreview(null); return; }
    const gross = n * rate;
    const fee   = gross * 0.01;
    const net   = gross - fee;
    setPreview({ gross, fee, net });
  }, [amount, rate]);

  const handleConvert = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      const { data } = await api.post('/api/wallets/convert', {
        fromCurrency: from, toCurrency: to, amount: amt,
      });
      setConfirming(true);
      toast.success(`Converted! ${to} ${Number(data.conversion.to.amount).toFixed(2)} added to your wallet.`);
      setAmount('');
      setPreview(null);
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['wallet-conversions-recent'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Conversion failed');
    } finally { setLoading(false); setConfirming(false); }
  };

  if (ratesLoading) return <PageLoader />;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/wallet" style={{ color: 'var(--accent)', display: 'flex' }}>
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Currency Converter</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Convert between KES and USD</p>
        </div>
      </div>

      {/* Rate info */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
        style={{ background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.18)', color: 'var(--accent)' }}>
        <Info size={14} />
        <span>1 USD = {rateData?.rates?.USD_KES ? Number(rateData.rates.USD_KES).toFixed(4) : '…'} KES &nbsp;·&nbsp; 1% conversion fee</span>
      </div>

      {/* Converter card */}
      <div className="card space-y-4">
        {/* Direction toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['KES', 'USD'] as const).map(c => (
              <button key={c} onClick={() => setFrom(c)}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: from === c ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                  color:      from === c ? 'var(--accent-text)' : 'rgba(255,255,255,0.6)',
                }}>
                {FLAG[c]} {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ArrowRightLeft size={12} />
            <span>to {FLAG[to]} {to}</span>
          </div>
        </div>

        {/* Available balance */}
        <p className="text-xs text-gray-500">
          Available {from}: {Number(fromBal?.available ?? 0).toLocaleString('en', { minimumFractionDigits: 2 })}
        </p>

        {/* Amount input */}
        <div>
          <label className="label">Amount to convert</label>
          <input
            className="input"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Fee (1%)</span>
              <span className="text-red-400">− {preview.fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
              <span className="text-gray-300">You receive ({to})</span>
              <span className="text-white">{preview.net.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button
          className="btn-primary w-full"
          disabled={!amount || !preview || loading}
          onClick={handleConvert}
          style={{ fontSize: 15, padding: '12px' }}>
          {loading ? 'Converting…' : `Convert ${from} → ${to}`}
        </button>
      </div>

      {/* Quick amounts */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Quick amounts</p>
        <div className="flex flex-wrap gap-2">
          {(from === 'KES' ? [500, 1000, 5000, 10000, 50000] : [5, 10, 50, 100, 500]).map(n => (
            <button key={n}
              onClick={() => setAmount(String(n))}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {from} {n.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
