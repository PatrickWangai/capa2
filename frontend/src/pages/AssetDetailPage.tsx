import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, TrendingDown, Star, ArrowLeft, Info, AlertCircle, CheckCircle,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { StockLogo } from '../components/ui/StockLogo';

// ── Types ─────────────────────────────────────────────────────
type Side    = 'BUY' | 'SELL';
type OrdType = 'MARKET' | 'LIMIT';
type InMode  = 'SHARES' | 'DOLLARS';

const PERIODS = [
  { label: '1W', interval: '1d', days: 7   },
  { label: '1M', interval: '1d', days: 30  },
  { label: '3M', interval: '1d', days: 90  },
  { label: '1Y', interval: '1d', days: 365 },
];

// ── Helpers ───────────────────────────────────────────────────
function fmtNum(v: number | string | undefined, dp = 2) {
  if (v === undefined || v === null) return '—';
  return Number(v).toLocaleString('en', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
function fmtVol(v: number | string | undefined) {
  if (!v) return '—';
  const n = Number(v);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

// ── Chart tooltip ─────────────────────────────────────────────
function ChartTip({ active, payload, currency }: any) {
  if (!active || !payload?.length) return null;
  const pt = payload[0];
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
      borderRadius: 10, padding: '8px 12px', backdropFilter: 'blur(12px)',
    }}>
      <p className="text-xs text-gray-400">
        {new Date(pt.payload.time).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <p className="font-semibold text-white text-sm mt-0.5">
        {currency} {Number(pt.value).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

// ── Stat row inside preview modal ─────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

// ── Order Preview Modal ───────────────────────────────────────
function PreviewModal({
  asset, side, ordType, qty, limitPriceStr, currentPrice, fee, total, currency,
  onCancel, onConfirm, loading, success,
}: {
  asset: any; side: Side; ordType: OrdType; qty: number;
  limitPriceStr: string; currentPrice: number; fee: number; total: number; currency: string;
  onCancel: () => void; onConfirm: () => void; loading: boolean; success: boolean;
}) {
  const displayPrice = ordType === 'LIMIT' ? (Number(limitPriceStr) || currentPrice) : currentPrice;
  const subtotal     = qty * displayPrice;
  const isBuy        = side === 'BUY';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 22, padding: 28, maxWidth: 400, width: '100%',
        backdropFilter: 'blur(24px)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}>
        {success ? (
          <div className="text-center py-2">
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(52,199,89,0.15)', border: '1px solid rgba(52,199,89,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <CheckCircle size={30} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Order Placed!</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your {side} order for {qty % 1 === 0 ? qty : qty.toFixed(4)} {asset.symbol} has been
              submitted and will fill shortly.
            </p>
            <button onClick={onCancel} className="btn-primary w-full mt-6 py-3">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Order Preview</h3>
              <button onClick={onCancel} className="text-gray-500 hover:text-white p-1 rounded-lg transition-colors text-lg">✕</button>
            </div>

            {/* Stock identity */}
            <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <StockLogo symbol={asset.symbol} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">{asset.symbol}</p>
                <p className="text-xs text-gray-400 truncate">{asset.name}</p>
              </div>
              <span
                className="text-sm font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: isBuy ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isBuy ? '#22c55e' : '#ef4444',
                }}
              >
                {side}
              </span>
            </div>

            {/* Details table */}
            <div className="space-y-3 mb-5 text-sm">
              <Row label="Order type" value={ordType === 'MARKET' ? 'Market Order' : 'Limit Order'} />
              <Row label="Shares"     value={qty % 1 === 0 ? String(qty) : qty.toFixed(6)} />
              <Row label={ordType === 'LIMIT' ? 'Limit price' : 'Est. price'} value={`${currency} ${fmtNum(displayPrice)}`} />
              <Row label="Subtotal"   value={`${currency} ${fmtNum(subtotal)}`} />
              <Row label="Fee (0.1%)" value={`${currency} ${fmtNum(fee)}`} />
              <div className="flex justify-between pt-3 font-bold" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-white">Est. {isBuy ? 'Total Cost' : 'Proceeds'}</span>
                <span style={{ color: 'var(--accent)' }}>{currency} {fmtNum(total)}</span>
              </div>
            </div>

            {ordType === 'MARKET' && (
              <div
                className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs text-yellow-400"
                style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)' }}
              >
                <Info size={13} className="mt-0.5 shrink-0" />
                Market orders fill at the current market price, which may differ slightly from the estimate shown.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(235,235,245,0.7)' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{ backgroundColor: isBuy ? '#22c55e' : '#ef4444', opacity: loading ? 0.65 : 1 }}
              >
                {loading ? 'Placing…' : `Confirm ${side}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc     = useQueryClient();

  const [period, setPeriod]     = useState(PERIODS[1]);
  const [side, setSide]         = useState<Side>('BUY');
  const [ordType, setOrdType]   = useState<OrdType>('MARKET');
  const [inMode, setInMode]     = useState<InMode>('SHARES');
  const [amount, setAmount]     = useState('');
  const [limitPrice, setLimitP] = useState('');
  const [watched, setWatched]   = useState(false);
  const [showPreview, setPreview] = useState(false);
  const [placing, setPlacing]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [flashKey, setFlash]    = useState(0);
  const prevPriceRef            = useRef<number | null>(null);

  // ── Queries ──────────────────────────────────────────────
  const { data: assetData, refetch: refetchAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => api.get(`/api/assets/${id}`).then(r => r.data),
    refetchInterval: 15_000,
  });

  const { data: histData } = useQuery({
    queryKey: ['price-history', id, period.label],
    queryFn: () =>
      api.get(`/api/assets/${id}/history`, {
        params: {
          interval: period.interval,
          from: new Date(Date.now() - period.days * 86_400_000).toISOString(),
        },
      }).then(r => r.data),
    staleTime: 30_000,
  });

  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: wlData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/api/assets/watchlist').then(r => r.data),
  });

  // ── Effects ──────────────────────────────────────────────
  const asset    = assetData?.asset;
  const priceNum = asset?.price ? Number(asset.price.price) : null;

  useEffect(() => {
    if (priceNum !== null && prevPriceRef.current !== null && priceNum !== prevPriceRef.current) {
      setFlash(k => k + 1);
    }
    prevPriceRef.current = priceNum;
  }, [priceNum]);

  useEffect(() => {
    const items = wlData?.watchlist?.items ?? [];
    setWatched(items.some((i: any) => i.assetId === id));
  }, [wlData, id]);

  useEffect(() => {
    if (asset?.price?.price && !limitPrice) {
      setLimitP(Number(asset.price.price).toFixed(2));
    }
  }, [asset?.price?.price]);

  // ── Loading state ─────────────────────────────────────────
  if (!asset) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent)' }} />
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────
  const price        = asset.price;
  const currentPrice = price ? Number(price.price)       : 0;
  const change       = Number(price?.changePercent       || 0);
  const changeAmt    = Number(price?.changeAmount        || 0);
  const isUp         = change >= 0;
  const currency     = asset.currency;

  const cashBal  = portfolioData?.cashBalances?.find((b: any) => b.currency === currency);
  const avail    = cashBal ? Number(cashBal.available) : 0;
  const pos      = portfolioData?.positions?.find((p: any) => p.assetId === id);
  const ownedQty = pos ? Number(pos.quantity) : 0;

  const rawAmt    = Number(amount) || 0;
  const sharesQty = inMode === 'SHARES' ? rawAmt : (currentPrice > 0 ? rawAmt / currentPrice : 0);
  const effPrice  = ordType === 'LIMIT' ? (Number(limitPrice) || currentPrice) : currentPrice;
  const subtotal  = sharesQty * effPrice;
  const fee       = subtotal * 0.001;
  const total     = side === 'BUY' ? subtotal + fee : subtotal - fee;
  const canOrder  = sharesQty > 0
    && (ordType === 'MARKET' || Number(limitPrice) > 0)
    && (side === 'BUY' ? total <= avail + 0.001 : sharesQty <= ownedQty + 0.000001);

  const chartData = (histData?.history ?? []).map((h: any) => ({ time: h.openTime, value: Number(h.close) }));
  const vals      = chartData.map((d: any) => d.value);
  const chartMin  = vals.length ? Math.min(...vals) * 0.997 : undefined;
  const chartMax  = vals.length ? Math.max(...vals) * 1.003 : undefined;

  const keyStats = [
    { label: 'Open',        value: price?.open          ? `${currency} ${fmtNum(price.open)}`         : '—' },
    { label: 'Prev. Close', value: price?.previousClose  ? `${currency} ${fmtNum(price.previousClose)}` : '—' },
    { label: 'Day High',    value: price?.high           ? `${currency} ${fmtNum(price.high)}`          : '—' },
    { label: 'Day Low',     value: price?.low            ? `${currency} ${fmtNum(price.low)}`           : '—' },
    { label: '52W High',    value: price?.weekHigh52     ? `${currency} ${fmtNum(price.weekHigh52)}`    : '—' },
    { label: '52W Low',     value: price?.weekLow52      ? `${currency} ${fmtNum(price.weekLow52)}`     : '—' },
    { label: 'Volume',      value: fmtVol(price?.volume) },
    { label: 'Market Cap',  value: price?.marketCap      ? `${currency} ${fmtVol(price.marketCap)}`    : '—' },
    { label: 'P/E Ratio',   value: price?.peRatio        ? Number(price.peRatio).toFixed(1)             : '—' },
    { label: 'Div. Yield',  value: price?.dividendYield  ? `${Number(price.dividendYield).toFixed(2)}%` : '—' },
    { label: 'Sector',      value: asset.sector          || '—' },
    { label: 'Exchange',    value: asset.exchange },
  ];

  // ── Actions ───────────────────────────────────────────────
  const toggleWatchlist = async () => {
    const next = !watched;
    setWatched(next);
    try {
      if (watched) {
        await api.delete(`/api/assets/watchlist/${id}`);
        toast.success('Removed from watchlist');
      } else {
        await api.post(`/api/assets/watchlist/${id}`);
        toast.success('Added to watchlist');
      }
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    } catch {
      setWatched(!next);
      toast.error('Failed');
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await api.post('/api/orders', {
        assetId: id,
        side,
        orderType: ordType,
        quantity: asset.isFractional ? sharesQty.toFixed(6) : String(Math.round(sharesQty)),
        ...(ordType === 'LIMIT' && { limitPrice: Number(limitPrice).toFixed(2) }),
      });
      setSuccess(true);
      setAmount('');
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Order failed. Please try again.');
      setPreview(false);
    } finally {
      setPlacing(false);
    }
  };

  const closeModal = () => {
    setPreview(false);
    setSuccess(false);
    if (success) refetchAsset();
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {showPreview && (
        <PreviewModal
          asset={asset} side={side} ordType={ordType}
          qty={sharesQty} limitPriceStr={limitPrice}
          currentPrice={currentPrice} fee={fee} total={total} currency={currency}
          onCancel={closeModal} onConfirm={handlePlaceOrder}
          loading={placing} success={success}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-5">
        {/* Back */}
        <Link to="/markets" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Markets
        </Link>

        {/* ── Stock header ─────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <StockLogo symbol={asset.symbol} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{asset.symbol}</h1>
                <span className="badge-blue">{asset.exchange}</span>
                <span className="badge-gray text-xs">{asset.assetClass}</span>
                {asset.isFractional && <span className="badge-gray text-xs">Fractional</span>}
              </div>
              <p className="text-gray-400 text-sm mt-0.5">{asset.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p key={flashKey} className="text-2xl font-bold text-white" style={{ animation: 'flash 0.35s ease' }}>
                {currency} {fmtNum(currentPrice)}
              </p>
              <p className={clsx('text-sm font-semibold flex items-center justify-end gap-1 mt-0.5', isUp ? 'text-green-400' : 'text-red-400')}>
                {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {isUp ? '+' : ''}{change.toFixed(2)}%
                <span className="font-normal opacity-70">({isUp ? '+' : ''}{fmtNum(changeAmt)})</span>
              </p>
            </div>
            <button
              onClick={toggleWatchlist}
              className="p-2.5 rounded-xl transition-all"
              style={{
                background: watched ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.06)',
                color: watched ? '#facc15' : 'rgba(235,235,245,0.4)',
              }}
            >
              <Star size={18} fill={watched ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* LEFT: chart + stats */}
          <div className="lg:col-span-2 space-y-5">

            {/* Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white text-sm">Price History</h2>
                <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {PERIODS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => setPeriod(p)}
                      className={clsx('px-3 py-1 rounded-md text-xs font-semibold transition-all', period.label === p.label ? 'text-white' : 'text-gray-500 hover:text-gray-300')}
                      style={period.label === p.label ? { backgroundColor: 'rgba(255,255,255,0.12)' } : {}}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0.22} />
                        <stop offset="95%" stopColor={isUp ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[chartMin, chartMax]} hide />
                    <Tooltip content={<ChartTip currency={currency} />} />
                    <Area
                      type="monotone" dataKey="value"
                      stroke={isUp ? '#22c55e' : '#ef4444'} strokeWidth={2}
                      fill="url(#cg)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[210px] flex items-center justify-center text-sm" style={{ color: 'rgba(235,235,245,0.3)' }}>
                  No chart data for this period
                </div>
              )}
            </div>

            {/* Key statistics */}
            <div className="card">
              <h2 className="font-semibold text-white mb-4">Key Statistics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                {keyStats.map(s => (
                  <div key={s.label}>
                    <p className="text-xs mb-0.5" style={{ color: 'rgba(235,235,245,0.38)' }}>{s.label}</p>
                    <p className="text-sm font-semibold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            {asset.description && (
              <div className="card">
                <h2 className="font-semibold text-white mb-3">About {asset.name}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{asset.description}</p>
                {(asset.sector || asset.industry) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {asset.sector   && <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(235,235,245,0.6)' }}>{asset.sector}</span>}
                    {asset.industry && <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(235,235,245,0.6)' }}>{asset.industry}</span>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: order panel */}
          <div className="space-y-4">
            <div className="card" style={{ padding: 20 }}>

              {/* BUY / SELL */}
              <div className="grid grid-cols-2 gap-1 mb-4 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {(['BUY', 'SELL'] as Side[]).map(s => (
                  <button
                    key={s}
                    onClick={() => { setSide(s); setAmount(''); }}
                    className="py-2.5 rounded-lg text-sm font-bold transition-all"
                    style={{
                      backgroundColor: side === s ? (s === 'BUY' ? '#22c55e' : '#ef4444') : 'transparent',
                      color: side === s ? '#fff' : 'rgba(235,235,245,0.4)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Order type */}
              <div className="mb-4">
                <p className="label">Order Type</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['MARKET', 'LIMIT'] as OrdType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => { setOrdType(t); setInMode('SHARES'); }}
                      className={clsx('py-2 rounded-lg text-xs font-semibold transition-all', ordType === t ? 'text-white' : 'text-gray-500 hover:text-white')}
                      style={ordType === t ? { backgroundColor: 'var(--accent)' } : { background: 'rgba(255,255,255,0.06)' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invest in (fractional + market only) */}
              {asset.isFractional && ordType === 'MARKET' && (
                <div className="mb-4">
                  <p className="label">Invest in</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['SHARES', 'DOLLARS'] as InMode[]).map(m => (
                      <button
                        key={m}
                        onClick={() => { setInMode(m); setAmount(''); }}
                        className={clsx('py-2 rounded-lg text-xs font-semibold transition-all', inMode === m ? 'text-white' : 'text-gray-500 hover:text-white')}
                        style={inMode === m ? { backgroundColor: 'var(--accent)' } : { background: 'rgba(255,255,255,0.06)' }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Limit price */}
              {ordType === 'LIMIT' && (
                <div className="mb-3">
                  <label className="label">Limit Price ({currency})</label>
                  <input type="number" className="input text-sm" placeholder="0.00" value={limitPrice} onChange={e => setLimitP(e.target.value)} min="0" step="0.01" />
                </div>
              )}

              {/* Amount */}
              <div className="mb-4">
                <label className="label">
                  {inMode === 'DOLLARS' ? `Amount (${currency})` : 'Number of Shares'}
                </label>
                <input
                  type="number"
                  className="input text-sm"
                  placeholder={inMode === 'DOLLARS' ? '0.00' : asset.isFractional ? '0.000001' : '1'}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="0"
                  step={inMode === 'DOLLARS' ? '1' : asset.isFractional ? '0.000001' : '1'}
                />
                {inMode === 'DOLLARS' && sharesQty > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'rgba(235,235,245,0.38)' }}>
                    ≈ {asset.isFractional ? sharesQty.toFixed(6) : Math.round(sharesQty)} shares
                  </p>
                )}
              </div>

              {/* Estimate breakdown */}
              {sharesQty > 0 && (
                <div className="rounded-xl p-3 mb-4 text-sm space-y-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(235,235,245,0.45)' }}>
                      {asset.isFractional ? sharesQty.toFixed(6) : Math.round(sharesQty)} shares × {currency} {fmtNum(effPrice)}
                    </span>
                    <span className="text-white">{currency} {fmtNum(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(235,235,245,0.45)' }}>Fee (0.1%)</span>
                    <span className="text-white">{currency} {fmtNum(fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-white">Est. {side === 'BUY' ? 'Cost' : 'Proceeds'}</span>
                    <span style={{ color: 'var(--accent)' }}>{currency} {fmtNum(total)}</span>
                  </div>
                </div>
              )}

              {/* Inline warnings */}
              {side === 'SELL' && ownedQty === 0 && (
                <div className="flex items-center gap-2 text-xs text-red-400 mb-3 p-2.5 rounded-xl bg-red-900/10 border border-red-900/20">
                  <AlertCircle size={12} /> You don't own any {asset.symbol}
                </div>
              )}
              {side === 'SELL' && ownedQty > 0 && sharesQty > ownedQty + 0.000001 && (
                <div className="flex items-center gap-2 text-xs text-orange-400 mb-3 p-2.5 rounded-xl bg-orange-900/10 border border-orange-900/20">
                  <AlertCircle size={12} /> Max {asset.isFractional ? ownedQty.toFixed(4) : Math.floor(ownedQty)} shares available
                </div>
              )}
              {side === 'BUY' && sharesQty > 0 && total > avail + 0.001 && (
                <div className="flex items-center gap-2 text-xs text-red-400 mb-3 p-2.5 rounded-xl bg-red-900/10 border border-red-900/20">
                  <AlertCircle size={12} /> Insufficient funds — {currency} {fmtNum(avail)} available
                </div>
              )}

              {/* Available / owned */}
              <div className="flex justify-between text-xs mb-4" style={{ color: 'rgba(235,235,245,0.4)' }}>
                <span>{side === 'BUY' ? `${currency} available` : 'Shares owned'}</span>
                <span className="text-white font-medium">
                  {side === 'BUY'
                    ? `${currency} ${fmtNum(avail)}`
                    : `${asset.isFractional ? ownedQty.toFixed(4) : Math.floor(ownedQty)} ${asset.symbol}`}
                </span>
              </div>

              {/* CTA */}
              <button
                disabled={!canOrder}
                onClick={() => canOrder && setPreview(true)}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: canOrder ? (side === 'BUY' ? '#22c55e' : '#ef4444') : 'rgba(255,255,255,0.06)',
                  color: canOrder ? '#fff' : 'rgba(235,235,245,0.28)',
                  cursor: canOrder ? 'pointer' : 'not-allowed',
                }}
              >
                {!amount
                  ? `Enter amount to ${side.toLowerCase()}`
                  : !canOrder
                  ? side === 'BUY' ? 'Insufficient funds' : 'Insufficient shares'
                  : `Review ${side} Order →`}
              </button>

              <p className="text-center text-xs mt-2" style={{ color: 'rgba(235,235,245,0.22)' }}>
                0.1% trading fee · No monthly charges
              </p>
            </div>

            {/* Your position */}
            {pos && (
              <div className="card" style={{ padding: '16px 20px' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(235,235,245,0.38)' }}>
                  Your Position
                </p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(235,235,245,0.45)' }}>Shares</span>
                    <span className="text-white font-semibold">
                      {asset.isFractional ? Number(pos.quantity).toFixed(4) : Math.floor(Number(pos.quantity))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(235,235,245,0.45)' }}>Market value</span>
                    <span className="text-white font-semibold">{currency} {fmtNum(pos.marketValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(235,235,245,0.45)' }}>Avg. cost</span>
                    <span className="text-white">{currency} {fmtNum(pos.avgCostPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(235,235,245,0.45)' }}>Total return</span>
                    <span className={clsx('font-semibold', Number(pos.gainLoss) >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {Number(pos.gainLoss) >= 0 ? '+' : ''}{currency} {fmtNum(pos.gainLoss)}
                      <span className="font-normal opacity-75 ml-1">({pos.gainLossPct}%)</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
