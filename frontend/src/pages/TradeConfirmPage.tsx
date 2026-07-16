import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, AlertCircle, ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { StockLogo } from '../components/ui/StockLogo';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface TradeState {
  assetId: string;
  symbol: string;
  name: string;
  exchange: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  quantity: number;
  limitPrice?: number;
  currentPrice: number;
  fee: number;
  total: number;
  currency: string;
}

export default function TradeConfirmPage() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const state     = location.state as TradeState | null;

  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [orderId,  setOrderId]  = useState('');

  if (!state) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <AlertCircle size={40} className="mx-auto text-gray-600" />
        <p className="text-gray-400">No trade details found. Please go back to Markets.</p>
        <Link to="/markets" className="btn-primary inline-block">Browse Markets</Link>
      </div>
    );
  }

  const { assetId, symbol, name, exchange, side, orderType, quantity, limitPrice, currentPrice, fee, total, currency } = state;
  const displayPrice = orderType === 'LIMIT' ? (limitPrice ?? currentPrice) : currentPrice;
  const subtotal     = quantity * displayPrice;
  const isBuy        = side === 'BUY';

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const payload: any = { assetId, side, orderType, quantity };
      if (orderType === 'LIMIT' && limitPrice) payload.limitPrice = limitPrice;

      const { data } = await api.post('/api/orders', payload);
      setOrderId(data.order?.id ?? '');
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['orders-recent'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="card text-center py-12 space-y-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'rgba(52,211,153,0.12)' }}>
            <CheckCircle size={36} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Order Placed!</h2>
            <p className="text-gray-400 mt-1 text-sm">
              Your {orderType.toLowerCase()} order to {side.toLowerCase()} {quantity} {symbol} has been submitted.
            </p>
          </div>
          {orderId && (
            <p className="text-xs text-gray-600 font-mono">Order ID: {orderId.slice(0, 16)}…</p>
          )}
          <div className="rounded-xl p-4 space-y-2 text-sm" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <div className="flex justify-between">
              <span className="text-gray-400">Order</span>
              <span className="text-white font-semibold">{side} {quantity} × {symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated total</span>
              <span className="text-white font-semibold">{currency} {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-yellow-400 font-semibold">Pending</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/orders" className="btn-primary" style={{ fontSize: 14 }}>View Orders</Link>
            <Link to={`/markets/${assetId}`} className="btn-secondary" style={{ fontSize: 14 }}>Back to {symbol}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} style={{ color: 'var(--accent)', display: 'flex' }}>
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Confirm Order</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Review your trade before submitting</p>
        </div>
      </div>

      {/* Asset card */}
      <div className="card flex items-center gap-4" style={{ padding: '18px 20px' }}>
        <StockLogo symbol={symbol} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-bold text-white">{symbol}</p>
            <span className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(235,235,245,0.5)' }}>
              {exchange}
            </span>
          </div>
          <p className="text-sm text-gray-400 truncate">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">
            {currency} {currentPrice.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Market price</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="card space-y-4">
        {/* Side badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Trade type</span>
          <span className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
            isBuy ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {isBuy ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {side}
          </span>
        </div>

        <div className="border-t border-white/5 pt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Order type</span>
            <span className="text-white font-semibold">{orderType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quantity</span>
            <span className="text-white font-semibold">{quantity} shares</span>
          </div>
          {orderType === 'LIMIT' && limitPrice && (
            <div className="flex justify-between">
              <span className="text-gray-400">Limit price</span>
              <span className="text-white font-semibold">{currency} {limitPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Est. price</span>
            <span className="text-white">{currency} {displayPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">{currency} {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Fee (0.1%)</span>
            <span className="text-white">{currency} {fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-white/5 pt-3">
            <span className="text-white font-semibold">Total</span>
            <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
              {currency} {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Risk notice */}
      <div className="flex gap-2 px-4 py-3 rounded-xl text-xs"
        style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: 'rgba(251,191,36,0.8)' }}>
        <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
        <span>
          Investments carry risk. The final execution price may differ from the estimate.
          {orderType === 'LIMIT' ? ' Your limit order will only fill at your specified price or better.' : ' Market orders execute at the best available price.'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1"
          style={{ fontSize: 15, padding: '13px' }}>
          {loading
            ? 'Placing Order…'
            : `Confirm ${side === 'BUY' ? 'Purchase' : 'Sale'}`}
        </button>
      </div>
    </div>
  );
}
