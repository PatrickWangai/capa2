import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Minus, Star } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const INTERVALS = ['1d', '1w'];
const PERIODS = [
  { label: '1W', interval: '1d', days: 7 },
  { label: '1M', interval: '1d', days: 30 },
  { label: '3M', interval: '1d', days: 90 },
  { label: '1Y', interval: '1d', days: 365 },
];

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [period, setPeriod] = useState(PERIODS[1]);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);

  const { data: assetData } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => api.get(`/api/assets/${id}`).then(r => r.data),
    refetchInterval: 15_000,
  });

  const { data: histData } = useQuery({
    queryKey: ['price-history', id, period.label],
    queryFn: () => api.get(`/api/assets/${id}/history`, { params: { interval: period.interval, from: new Date(Date.now() - period.days * 86_400_000).toISOString() } }).then(r => r.data),
  });

  const asset = assetData?.asset;
  const price = asset?.price;
  const change = Number(price?.changePercent || 0);
  const isUp = change >= 0;
  const estimated = asset && qty ? (Number(price?.price || 0) * Number(qty)).toFixed(2) : null;

  const placeOrder = async () => {
    if (!qty || Number(qty) <= 0) return toast.error('Enter a valid quantity.');
    setLoading(true);
    try {
      await api.post('/api/orders', { assetId: id, side, orderType: 'MARKET', quantity: qty });
      toast.success(`${side} order placed for ${qty} ${asset.symbol}!`);
      setQty('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (watchlisted) {
        await api.delete(`/api/assets/watchlist/${id}`);
        toast.success('Removed from watchlist');
      } else {
        await api.post(`/api/assets/watchlist/${id}`);
        toast.success('Added to watchlist');
      }
      setWatchlisted(w => !w);
    } catch {}
  };

  if (!asset) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
    </div>
  );

  const chartData = histData?.history?.map((h: any) => ({ time: h.openTime, value: Number(h.close) })) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-800 flex items-center justify-center text-lg font-bold text-blue-400">
            {asset.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{asset.symbol}</h1>
              <span className="badge-blue">{asset.exchange}</span>
              <span className="badge-blue">{asset.assetClass}</span>
            </div>
            <p className="text-gray-400">{asset.name}</p>
          </div>
        </div>
        <button onClick={toggleWatchlist} className={clsx('p-2 rounded-lg transition-colors', watchlisted ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-yellow-400 bg-gray-800')}>
          <Star size={20} fill={watchlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-white">{asset.currency} {Number(price?.price || 0).toFixed(2)}</p>
              <p className={clsx('flex items-center gap-1 text-sm mt-1', isUp ? 'text-green-400' : 'text-red-400')}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isUp ? '+' : ''}{Number(price?.changeAmount || 0).toFixed(2)} ({change.toFixed(2)}%) today
              </p>
            </div>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button key={p.label} onClick={() => setPeriod(p)}
                  className={clsx('px-2.5 py-1 rounded text-xs font-medium', period.label === p.label ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-800')}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? '#28976d' : '#ef4444'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isUp ? '#28976d' : '#ef4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `${Number(v).toFixed(0)}`} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(v: any) => [`${asset.currency} ${Number(v).toFixed(2)}`, 'Price']} />
              <Area type="monotone" dataKey="value" stroke={isUp ? '#28976d' : '#ef4444'} strokeWidth={2} fill="url(#cg)" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Key stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
            {[
              { label: 'Open', value: price?.open ? `${asset.currency} ${Number(price.open).toFixed(2)}` : '—' },
              { label: '52W High', value: price?.weekHigh52 ? `${asset.currency} ${Number(price.weekHigh52).toFixed(2)}` : '—' },
              { label: '52W Low', value: price?.weekLow52 ? `${asset.currency} ${Number(price.weekLow52).toFixed(2)}` : '—' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-sm font-medium text-white mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order form */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">Place Order</h2>

          {/* Buy/Sell toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-4">
            <button onClick={() => setSide('BUY')} className={clsx('flex-1 py-2 text-sm font-semibold transition-colors', side === 'BUY' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800')}>
              Buy
            </button>
            <button onClick={() => setSide('SELL')} className={clsx('flex-1 py-2 text-sm font-semibold transition-colors', side === 'SELL' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800')}>
              Sell
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Order Type</label>
              <select className="input">
                <option>Market Order</option>
              </select>
            </div>
            <div>
              <label className="label">Quantity {asset.isFractional && <span className="text-gray-500">(fractional ok)</span>}</label>
              <div className="flex items-center gap-2">
                <button className="btn-secondary p-2" onClick={() => setQty(q => String(Math.max(0, Number(q) - 1)))}>
                  <Minus size={16} />
                </button>
                <input className="input text-center flex-1" type="number" min={asset.isFractional ? '0.001' : '1'} step={asset.isFractional ? '0.001' : '1'}
                  placeholder="0" value={qty} onChange={e => setQty(e.target.value)} />
                <button className="btn-secondary p-2" onClick={() => setQty(q => String(Number(q) + 1))}>
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {estimated && (
              <div className="p-3 bg-gray-800 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Value</span>
                  <span className="text-white font-medium">{asset.currency} {estimated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee (0.1%)</span>
                  <span className="text-white">{asset.currency} {(Number(estimated) * 0.001).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-700">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-white font-semibold">{asset.currency} {(Number(estimated) * 1.001).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button onClick={placeOrder} disabled={loading || !qty} className={clsx('w-full py-2.5 rounded-lg font-semibold text-white transition-colors disabled:opacity-50',
              side === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')}>
              {loading ? 'Placing…' : `Place ${side} Order`}
            </button>

            <p className="text-xs text-gray-500 text-center">Market orders execute immediately at current price.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
