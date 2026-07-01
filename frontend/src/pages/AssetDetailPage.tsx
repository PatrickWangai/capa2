import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Minus, Star, Activity, Info } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { StockLogo } from '../components/ui/StockLogo';

const PERIODS = [
  { label: '1W', interval: '1d', days: 7 },
  { label: '1M', interval: '1d', days: 30 },
  { label: '3M', interval: '1d', days: 90 },
  { label: '1Y', interval: '1d', days: 365 },
];

function fmtNum(v: number | string | undefined, dp = 2) {
  if (v === undefined || v === null) return '—';
  return Number(v).toLocaleString('en', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

function fmtVol(v: number | string | undefined) {
  if (!v) return '—';
  const n = Number(v);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [period, setPeriod] = useState(PERIODS[1]);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);

  const { data: assetData, refetch: refetchAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => api.get(`/api/assets/${id}`).then(r => r.data),
    refetchInterval: 15_000,
  });

  const { data: histData } = useQuery({
    queryKey: ['price-history', id, period.label],
    queryFn: () => api.get(`/api/assets/${id}/history`, {
      params: { interval: period.interval, from: new Date(Date.now() - period.days * 86_400_000).toISOString() },
    }).then(r => r.data),
  });

  const asset = assetData?.asset;
  const price = asset?.price;
  const change = Number(price?.changePercent || 0);
  const isUp = change >= 0;
  const estimated = asset && qty ? (Number(price?.price || 0) * Number(qty)).toFixed(2) : null;

  // Flash on price update
  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => { setFlashKey(k => k + 1); }, [price?.price]);

  const placeOrder = async () => {
    if (!qty || Number(qty) <= 0) return toast.error('Enter a valid quantity.');
    setLoading(true);
    try {
      await api.post('/api/orders', { assetId: id, side, orderType: 'MARKET', quantity: qty });
      toast.success(`${side} order placed for ${qty} ${asset.symbol}!`);
      setQty('');
      refetchAsset();
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

  const keyStats = [
    { label: 'Open',          value: price?.open        ? `${asset.currency} ${fmtNum(price.open)}` : '—' },
    { label: 'Prev. Close',   value: price?.prevClose    ? `${asset.currency} ${fmtNum(price.prevClose)}` : '—' },
    { label: 'Day High',      value: price?.high         ? `${asset.currency} ${fmtNum(price.high)}` : '—' },
    { label: 'Day Low',       value: price?.low          ? `${asset.currency} ${fmtNum(price.low)}` : '—' },
    { label: '52W High',      value: price?.weekHigh52   ? `${asset.currency} ${fmtNum(price.weekHigh52)}` : '—' },
    { label: '52W Low',       value: price?.weekLow52    ? `${asset.currency} ${fmtNum(price.weekLow52)}` : '—' },
    { label: 'Volume',        value: fmtVol(price?.volume) },
    { label: 'Market Cap',    value: price?.marketCap    ? `${asset.currency} ${fmtVol(price.marketCap)}` : '—' },
    { label: 'P/E Ratio',     value: price?.peRatio      ? Number(price.peRatio).toFixed(1) : '—' },
    { label: 'Dividend Yield',value: price?.dividendYield ? `${Number(price.dividendYield).toFixed(2)}%` : '—' },
    { label: 'Beta',          value: price?.beta          ? Number(price.beta).toFixed(2) : '—' },
    { label: 'EPS',           value: price?.eps           ? `${asset.currency} ${fmtNum(price.eps)}` : '—' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <StockLogo symbol={asset.symbol} size="lg" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{asset.symbol}</h1>
              <span className="badge-blue">{asset.exchange}</span>
              <span className="badge-blue">{asset.assetClass}</span>
              {asset.isFractional && <span className="badge-gray">Fractional</span>}
            </div>
            <p className="text-gray-400 mt-0.5">{asset.name}</p>
            {asset.description && (
              <p className="text-gray-500 text-xs mt-1 max-w-md leading-relaxed">{asset.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={toggleWatchlist}
          className={clsx('p-2.5 rounded-xl transition-colors', watchlisted ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-yellow-400 bg-gray-800')}
        >
          <Star size={20} fill={watchlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p
                key={flashKey}
                className="text-3xl font-bold text-white"
                style={{ animation: 'flash 0.4s ease' }}
              >
                {asset.currency} {fmtNum(price?.price)}
              </p>
              <p className={clsx('flex items-center gap-1 text-sm mt-1', isUp ? 'text-green-400' : 'text-red-400')}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isUp ? '+' : ''}{fmtNum(price?.changeAmount)} ({change.toFixed(2)}%) today
              </p>
            </div>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setPeriod(p)}
                  className={clsx('px-2.5 py-1 rounded text-xs font-medium transition-colors', period.label === p.label ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-800')}
                >
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
              <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }}
                tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#6b7280', fontSize: 10 }}
                tickFormatter={v => `${Number(v).toFixed(0)}`} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(v: any) => [`${asset.currency} ${Number(v).toFixed(2)}`, 'Price']}
              />
              <Area type="monotone" dataKey="value" stroke={isUp ? '#28976d' : '#ef4444'} strokeWidth={2} fill="url(#cg)" />
            </AreaChart>
          </ResponsiveContainer>

          {/* Key stats grid */}
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Info size={13} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Key Statistics</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {keyStats.map(s => (
                <div key={s.label}>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-sm font-medium text-white mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-blue-400" />
            <h2 className="font-semibold text-white">Place Order</h2>
          </div>

          {/* Buy/Sell toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-700 mb-5">
            <button
              onClick={() => setSide('BUY')}
              className={clsx('flex-1 py-2.5 text-sm font-semibold transition-colors', side === 'BUY' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800')}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('SELL')}
              className={clsx('flex-1 py-2.5 text-sm font-semibold transition-colors', side === 'SELL' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800')}
            >
              Sell
            </button>
          </div>

          {/* Live price display */}
          <div className="p-3 rounded-xl bg-gray-800/60 mb-4 flex items-center justify-between">
            <span className="text-xs text-gray-400">Market Price</span>
            <span className="text-white font-semibold">{asset.currency} {fmtNum(price?.price)}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">
                Quantity {asset.isFractional && <span className="text-gray-500">(fractional ok)</span>}
              </label>
              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary p-2"
                  onClick={() => setQty(q => String(Math.max(0, Number(q) - 1)))}
                >
                  <Minus size={16} />
                </button>
                <input
                  className="input text-center flex-1"
                  type="number"
                  min={asset.isFractional ? '0.001' : '1'}
                  step={asset.isFractional ? '0.001' : '1'}
                  placeholder="0"
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                />
                <button
                  className="btn-secondary p-2"
                  onClick={() => setQty(q => String(Number(q) + 1))}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {estimated && (
              <div className="p-3 bg-gray-800 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Value</span>
                  <span className="text-white font-medium">{asset.currency} {fmtNum(estimated)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee (0.5%)</span>
                  <span className="text-white">{asset.currency} {fmtNum(Number(estimated) * 0.005)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-700">
                  <span className="text-gray-300 font-medium">Total</span>
                  <span className="text-white font-semibold">{asset.currency} {fmtNum(Number(estimated) * 1.005)}</span>
                </div>
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={loading || !qty}
              className={clsx(
                'w-full py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 text-sm',
                side === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700',
              )}
            >
              {loading ? 'Placing…' : `Place ${side} Order`}
            </button>
            <p className="text-xs text-gray-500 text-center">Market orders execute immediately at current price.</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes flash { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  );
}
