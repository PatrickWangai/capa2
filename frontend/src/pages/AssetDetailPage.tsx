import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, TrendingDown, Star, ArrowLeft, Info, AlertCircle, CheckCircle, Bell, BellRing, X,
  Smartphone, Building2, ChevronRight, Plus, Trash2, WalletCards,
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

// ── Buy Flow Modal ─────────────────────────────────────────────
// Step 1: choose payment source (M-Pesa or Bank)
// Step 2a (M-Pesa): enter phone → STK push → enter PIN → confirm order
// Step 2b (Bank): see bank details (order placed when funds arrive)
type BuyStep = 'connect' | 'add-mpesa' | 'add-bank' | 'mpesa' | 'mpesa-sent' | 'bank' | 'review' | 'done';

interface SavedMethod { id: string; type: string; label: string; phone?: string; bankName?: string; bankAccount?: string; isDefault: boolean; }

function BuyFlowModal({
  asset, qty, ordType, limitPriceStr, currentPrice, fee, total, currency,
  onClose, onOrderSuccess,
}: {
  asset: any; qty: number; ordType: OrdType; limitPriceStr: string;
  currentPrice: number; fee: number; total: number; currency: string;
  onClose: () => void; onOrderSuccess: () => void;
}) {
  const [step, setStep]             = useState<BuyStep>('connect');
  const [savedMethods, setSaved]    = useState<SavedMethod[]>([]);
  const [methodsLoading, setMLoad]  = useState(true);
  const [selected, setSelected]     = useState<SavedMethod | null>(null);

  // add-mpesa form
  const [newPhone, setNewPhone]     = useState('');
  // add-bank form
  const [newBankName, setNewBankName]    = useState('');
  const [newBankAccount, setNewBankAcct] = useState('');

  const [mpesaPhone, setPhone]    = useState('');
  const [mpesaAmount, setMpesaAmt]= useState(String(Math.ceil(total * 130)));
  const [bankAmount, setBankAmt]  = useState(String(Math.ceil(total)));
  const [bankCur, setBankCur]     = useState(currency === 'KES' ? 'KES' : 'USD');
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [placing, setPlacing]     = useState(false);

  useEffect(() => {
    api.get('/api/payment-methods')
      .then(r => { setSaved(r.data.methods); })
      .catch(() => {})
      .finally(() => setMLoad(false));
  }, []);

  const effPrice = ordType === 'LIMIT' ? (Number(limitPriceStr) || currentPrice) : currentPrice;
  const subtotal = qty * effPrice;

  // shared styles
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
  const card: React.CSSProperties   = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 22, padding: 26, maxWidth: 400, width: '100%', backdropFilter: 'blur(24px)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', maxHeight: '92vh', overflowY: 'auto' };
  const btnGreen: React.CSSProperties  = { width: '100%', padding: '13px', borderRadius: 12, border: 'none', backgroundColor: '#22c55e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
  const btnAccent: React.CSSProperties = { width: '100%', padding: '13px', borderRadius: 12, border: 'none', backgroundColor: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' };
  const btnGhost: React.CSSProperties  = { width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.07)', color: 'rgba(235,235,245,0.65)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };

  const Header = ({ title, sub, back }: { title: string; sub?: string; back?: () => void }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {back && <button onClick={back} style={{ background: 'none', border: 'none', color: 'rgba(235,235,245,0.5)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1, marginTop: -1 }}>‹</button>}
        <div>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: 17, margin: 0 }}>{title}</p>
          {sub && <p style={{ fontSize: 12, color: 'rgba(235,235,245,0.42)', margin: '3px 0 0' }}>{sub}</p>}
        </div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(235,235,245,0.38)', cursor: 'pointer', fontSize: 20, padding: 0, lineHeight: 1 }}>✕</button>
    </div>
  );

  const OrderSummaryRows = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13, marginBottom: 18 }}>
      {([
        ['Shares', qty % 1 === 0 ? String(qty) : qty.toFixed(6)],
        [ordType === 'LIMIT' ? 'Limit price' : 'Est. price', `${currency} ${fmtNum(effPrice)}`],
        ['Subtotal', `${currency} ${fmtNum(subtotal)}`],
        ['Fee (0.1%)', `${currency} ${fmtNum(fee)}`],
      ] as [string, string][]).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(235,235,245,0.45)' }}>{k}</span>
          <span style={{ color: '#fff' }}>{v}</span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 9, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ color: '#fff' }}>Total</span>
        <span style={{ color: 'var(--accent)' }}>{currency} {fmtNum(total)}</span>
      </div>
    </div>
  );

  const submitMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/deposits/mpesa', { phone: mpesaPhone, amount: Number(mpesaAmount), currency: 'KES' });
      setStep('mpesa-sent');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'M-Pesa request failed');
    } finally { setLoading(false); }
  };

  const submitBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/deposits/bank', { amount: Number(bankAmount), currency: bankCur });
      setBankDetails(data.bankDetails);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Bank deposit failed');
    } finally { setLoading(false); }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await api.post('/api/orders', {
        assetId: asset.id, side: 'BUY', orderType: ordType,
        quantity: asset.isFractional ? qty.toFixed(6) : String(Math.round(qty)),
        ...(ordType === 'LIMIT' && { limitPrice: Number(limitPriceStr).toFixed(2) }),
      });
      setStep('done');
      onOrderSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Order failed — make sure your PIN was accepted then try again.');
    } finally { setPlacing(false); }
  };

  const addMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/payment-methods', { type: 'MPESA', phone: newPhone });
      setSaved(prev => [...prev, data.method]);
      setNewPhone('');
      setStep('connect');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save M-Pesa number');
    } finally { setLoading(false); }
  };

  const addBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/payment-methods', { type: 'BANK_TRANSFER', bankName: newBankName, bankAccount: newBankAccount });
      setSaved(prev => [...prev, data.method]);
      setNewBankName(''); setNewBankAcct('');
      setStep('connect');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save bank account');
    } finally { setLoading(false); }
  };

  const removeMethod = async (id: string) => {
    try {
      await api.delete(`/api/payment-methods/${id}`);
      setSaved(prev => prev.filter(m => m.id !== id));
    } catch { toast.error('Could not remove method'); }
  };

  const selectMethod = (m: SavedMethod) => {
    setSelected(m);
    if (m.type === 'MPESA') { setPhone(m.phone || ''); setStep('mpesa'); }
    else { setStep('bank'); }
  };

  /* ── STEP: connect (mandatory first step) ── */
  if (step === 'connect') return (
    <div style={overlay}><div style={card}>
      <Header
        title="Connect a payment method"
        sub={`Buying ${qty % 1 === 0 ? qty : qty.toFixed(4)} ${asset.symbol} · ${currency} ${fmtNum(total)}`}
      />

      {methodsLoading ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(235,235,245,0.4)', fontSize: 13 }}>Loading…</div>
      ) : (
        <>
          {savedMethods.length > 0 ? (
            <>
              <p style={{ fontSize: 12, color: 'rgba(235,235,245,0.4)', marginBottom: 10 }}>Your connected methods — choose one to pay with:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {savedMethods.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: m.type === 'MPESA' ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {m.type === 'MPESA' ? <Smartphone size={18} style={{ color: '#4ade80' }} /> : <Building2 size={18} style={{ color: 'rgba(165,180,252,1)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{m.type === 'MPESA' ? 'M-Pesa' : 'Bank Transfer'}</p>
                      <p style={{ fontSize: 11, color: 'rgba(235,235,245,0.38)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</p>
                    </div>
                    <button onClick={() => selectMethod(m)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', backgroundColor: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>Pay</button>
                    <button onClick={() => removeMethod(m.id)} style={{ background: 'none', border: 'none', color: 'rgba(235,235,245,0.3)', cursor: 'pointer', padding: 4, flexShrink: 0 }} title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(235,235,245,0.38)', marginBottom: 8, textAlign: 'center' }}>or add a new method</p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <WalletCards size={26} style={{ color: 'rgba(235,235,245,0.5)' }} />
              </div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 14, margin: '0 0 6px' }}>No payment method connected</p>
              <p style={{ color: 'rgba(235,235,245,0.4)', fontSize: 12, margin: '0 0 20px', lineHeight: 1.5 }}>Connect M-Pesa or a bank account to start buying.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { step: 'add-mpesa' as BuyStep, Icon: Smartphone, label: 'Connect M-Pesa', sub: 'Instant STK push', iconBg: 'rgba(34,197,94,0.15)', iconColor: '#4ade80' },
              { step: 'add-bank'  as BuyStep, Icon: Building2,  label: 'Connect Bank Account', sub: 'USD · GBP · KES', iconBg: 'rgba(99,102,241,0.15)', iconColor: 'rgba(165,180,252,1)' },
            ].map(({ step: s, Icon, label, sub, iconBg, iconColor }) => (
              <button key={s} onClick={() => setStep(s)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 14, border: '1px dashed rgba(255,255,255,0.14)', background: 'transparent', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: iconColor }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 11, color: 'rgba(235,235,245,0.38)', margin: '2px 0 0' }}>{sub}</p>
                </div>
                <Plus size={15} style={{ color: 'rgba(235,235,245,0.3)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </>
      )}
    </div></div>
  );

  /* ── STEP: add M-Pesa ── */
  if (step === 'add-mpesa') return (
    <div style={overlay}><div style={card}>
      <Header title="Connect M-Pesa" sub="We'll send an STK push to this number" back={() => setStep('connect')} />
      <form onSubmit={addMpesa} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#4ade80', lineHeight: 1.5 }}>
          Your phone number is saved to your account so you only need to enter it once.
        </div>
        <div>
          <label className="label">M-Pesa Phone Number</label>
          <input className="input text-sm" placeholder="+254700000000 or 0700000000" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} style={{ ...btnAccent, opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving…' : 'Connect M-Pesa'}
        </button>
      </form>
    </div></div>
  );

  /* ── STEP: add Bank ── */
  if (step === 'add-bank') return (
    <div style={overlay}><div style={card}>
      <Header title="Connect Bank Account" sub="Your details are saved for future transfers" back={() => setStep('connect')} />
      <form onSubmit={addBank} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: 'rgba(165,180,252,1)', lineHeight: 1.5 }}>
          Add your bank details once. Your order will be placed when funds arrive (1–3 business days).
        </div>
        <div>
          <label className="label">Bank Name</label>
          <input className="input text-sm" placeholder="e.g. KCB, Equity, Barclays" value={newBankName} onChange={e => setNewBankName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Account Number</label>
          <input className="input text-sm" placeholder="Your bank account number" value={newBankAccount} onChange={e => setNewBankAcct(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} style={{ ...btnAccent, opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Saving…' : 'Connect Bank Account'}
        </button>
      </form>
    </div></div>
  );

  /* ── STEP: M-Pesa form ── */
  if (step === 'mpesa') return (
    <div style={overlay}><div style={card}>
      <Header title="Pay with M-Pesa" sub="You'll get a prompt on your phone" back={() => setStep('connect')} />
      <OrderSummaryRows />
      <form onSubmit={submitMpesa} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#4ade80' }}>
          An STK push will be sent to your phone. Enter your M-Pesa PIN to authorise payment.
        </div>
        <div>
          <label className="label">M-Pesa Phone Number</label>
          <input className="input text-sm" placeholder="+254700000000 or 0700000000" value={mpesaPhone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="label">Amount (KES)</label>
          <input className="input text-sm" type="number" min="10" value={mpesaAmount} onChange={e => setMpesaAmt(e.target.value)} required />
          <p style={{ fontSize: 11, color: 'rgba(235,235,245,0.35)', marginTop: 4 }}>Approximate KES equivalent of {currency} {fmtNum(total)}</p>
        </div>
        <button type="submit" disabled={loading} style={{ ...btnAccent, opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Sending prompt…' : 'Send M-Pesa Prompt'}
        </button>
      </form>
    </div></div>
  );

  /* ── STEP: M-Pesa sent — waiting for PIN ── */
  if (step === 'mpesa-sent') return (
    <div style={overlay}><div style={card}>
      <Header title="Check Your Phone" />
      <div style={{ textAlign: 'center', margin: '8px 0 24px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Smartphone size={28} style={{ color: '#4ade80' }} />
        </div>
        <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: '0 0 8px' }}>M-Pesa prompt sent!</p>
        <p style={{ color: 'rgba(235,235,245,0.45)', fontSize: 13, lineHeight: 1.55 }}>
          Enter your <strong style={{ color: '#fff' }}>M-Pesa PIN</strong> on your phone to authorise the payment. Once confirmed, tap the button below to complete your purchase.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => setStep('review')} style={btnGreen}>I've entered my PIN — Place Order</button>
        <button onClick={onClose} style={btnGhost}>Do this later</button>
      </div>
    </div></div>
  );

  /* ── STEP: Bank Transfer ── */
  if (step === 'bank') return (
    <div style={overlay}><div style={card}>
      <Header title="Bank Transfer" sub="Funds arrive in 1–3 business days" back={() => setStep('connect')} />
      <OrderSummaryRows />
      {!bankDetails ? (
        <form onSubmit={submitBank} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: 'rgba(165,180,252,1)' }}>
            Transfer to CAPA's account. Your order will be placed once funds are confirmed.
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input text-sm" value={bankCur} onChange={e => setBankCur(e.target.value)}>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="KES">KES — Kenyan Shilling</option>
            </select>
          </div>
          <div>
            <label className="label">Amount</label>
            <input className="input text-sm" type="number" min="1" value={bankAmount} onChange={e => setBankAmt(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} style={{ ...btnAccent, opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Getting details…' : 'Get Bank Details'}
          </button>
        </form>
      ) : (
        <div>
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: 'rgba(165,180,252,1)', marginBottom: 16 }}>
            Use the reference below when making the transfer so we can match your payment.
          </div>
          {([
            ['Bank', bankDetails.bankName], ['Account Name', bankDetails.accountName],
            ['Account No.', bankDetails.accountNumber], ['Reference', bankDetails.reference],
            ['Amount', `${bankDetails.currency} ${Number(bankDetails.amount).toFixed(2)}`],
          ] as [string, string][]).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 13, color: 'rgba(235,235,245,0.45)' }}>{k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'monospace', userSelect: 'all' }}>{v}</span>
            </div>
          ))}
          <button onClick={onClose} style={{ ...btnGhost, marginTop: 18 }}>Done — I'll complete the transfer</button>
        </div>
      )}
    </div></div>
  );

  /* ── STEP: Order Review (after M-Pesa PIN) ── */
  if (step === 'review') return (
    <div style={overlay}><div style={card}>
      <Header title="Confirm Your Order" back={() => setStep('mpesa-sent')} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <StockLogo symbol={asset.symbol} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: '#fff', margin: 0 }}>{asset.symbol}</p>
          <p style={{ fontSize: 12, color: 'rgba(235,235,245,0.4)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>BUY</span>
      </div>
      <OrderSummaryRows />
      {ordType === 'MARKET' && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.15)', fontSize: 12, color: '#facc15', marginBottom: 16 }}>
          <Info size={13} style={{ marginTop: 1, flexShrink: 0 }} /> Market orders fill at live price and may differ slightly.
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setStep('mpesa-sent')} disabled={placing} style={{ ...btnGhost, flex: 1 }}>Back</button>
        <button onClick={placeOrder} disabled={placing} style={{ ...btnGreen, flex: 1, opacity: placing ? 0.65 : 1, cursor: placing ? 'not-allowed' : 'pointer' }}>
          {placing ? 'Placing…' : 'Confirm BUY'}
        </button>
      </div>
    </div></div>
  );

  /* ── STEP: done ── */
  return (
    <div style={overlay}><div style={card}>
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <CheckCircle size={32} style={{ color: '#4ade80' }} />
        </div>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 20, margin: '0 0 8px' }}>Order Placed!</h3>
        <p style={{ color: 'rgba(235,235,245,0.45)', fontSize: 13, lineHeight: 1.5 }}>
          Your BUY order for {qty % 1 === 0 ? qty : qty.toFixed(4)} {asset.symbol} has been submitted and will fill shortly.
        </p>
        <button onClick={onClose} style={{ ...btnGreen, marginTop: 26 }}>Done</button>
      </div>
    </div></div>
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
  const [watched, setWatched]     = useState(false);
  const [showBuyFlow, setBuyFlow] = useState(false);
  const [flashKey, setFlash]      = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertCond, setAlertCond] = useState<'above' | 'below'>('above');
  const [alertPrice, setAlertPriceVal] = useState('');
  const [savingAlert, setSavingAlert] = useState(false);
  const prevPriceRef              = useRef<number | null>(null);

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

  const { data: alertsData, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts', id],
    queryFn: () => api.get('/api/alerts').then(r => r.data),
  });
  const assetAlerts = (alertsData?.alerts ?? []).filter((a: any) => a.assetId === id && a.isActive);

  const createAlert = async () => {
    if (!alertPrice) return;
    setSavingAlert(true);
    try {
      await api.post('/api/alerts', { assetId: id, condition: alertCond, targetPrice: alertPrice });
      toast.success(`Alert set — notify when price goes ${alertCond} ${alertPrice}`);
      setShowAlert(false);
      setAlertPriceVal('');
      refetchAlerts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create alert');
    } finally { setSavingAlert(false); }
  };

  const deleteAlert = async (alertId: string) => {
    await api.delete(`/api/alerts/${alertId}`);
    toast.success('Alert removed');
    refetchAlerts();
  };

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
  const canBuy    = sharesQty > 0 && (ordType === 'MARKET' || Number(limitPrice) > 0);
  const canOrder  = sharesQty > 0
    && (ordType === 'MARKET' || Number(limitPrice) > 0)
    && sharesQty <= ownedQty + 0.000001;

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


  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {/* Price Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAlert(false)} />
          <div className="relative w-full max-w-sm" style={{ background: 'rgba(20,20,22,0.97)', backdropFilter: 'blur(24px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)', padding: 24 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white flex items-center gap-2"><Bell size={16} style={{ color: 'var(--accent)' }} /> Set Price Alert</h3>
              <button onClick={() => setShowAlert(false)} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['above', 'below'] as const).map(c => (
                    <button key={c} onClick={() => setAlertCond(c)}
                      className="py-2.5 rounded-xl text-sm font-semibold capitalize transition-all"
                      style={{
                        background: alertCond === c ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                        color: alertCond === c ? '#fff' : 'rgba(235,235,245,0.5)',
                        border: alertCond === c ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      }}>
                      Price goes {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Target Price ({currency})</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={alertPrice}
                  onChange={e => setAlertPriceVal(e.target.value)}
                  placeholder={currentPrice.toFixed(2)}
                />
                <p className="text-xs text-gray-500 mt-1">Current price: {currency} {currentPrice.toFixed(2)}</p>
              </div>

              {/* Existing alerts for this asset */}
              {assetAlerts.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Active alerts for {asset?.symbol}</p>
                  <div className="space-y-1.5">
                    {assetAlerts.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <span className="text-xs text-gray-300">
                          <span style={{ color: 'var(--accent)' }}>{a.condition}</span> {currency} {Number(a.targetPrice).toFixed(2)}
                        </span>
                        <button onClick={() => deleteAlert(a.id)} className="text-gray-600 hover:text-red-400 transition-colors"><X size={13} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAlert(false)} className="btn-secondary flex-1" style={{ fontSize: 14, padding: '10px' }}>Cancel</button>
                <button
                  onClick={createAlert}
                  disabled={!alertPrice || savingAlert}
                  className="btn-primary flex-1"
                  style={{ fontSize: 14, padding: '10px' }}
                >
                  {savingAlert ? 'Setting…' : 'Set Alert'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBuyFlow && (
        <BuyFlowModal
          asset={asset} qty={sharesQty} ordType={ordType}
          limitPriceStr={limitPrice} currentPrice={currentPrice}
          fee={fee} total={total} currency={currency}
          onClose={() => { setBuyFlow(false); refetchAsset(); }}
          onOrderSuccess={() => { qc.invalidateQueries({ queryKey: ['portfolio'] }); qc.invalidateQueries({ queryKey: ['orders'] }); setAmount(''); }}
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
              onClick={() => { setAlertPriceVal(currentPrice.toFixed(2)); setShowAlert(true); }}
              className="p-2.5 rounded-xl transition-all"
              title="Set price alert"
              style={{
                background: assetAlerts.length > 0 ? 'rgba(var(--accent-rgb),0.12)' : 'rgba(255,255,255,0.06)',
                color: assetAlerts.length > 0 ? 'var(--accent)' : 'rgba(235,235,245,0.4)',
              }}
            >
              {assetAlerts.length > 0 ? <BellRing size={18} /> : <Bell size={18} />}
            </button>
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
                    <YAxis domain={[chartMin ?? 'auto', chartMax ?? 'auto']} hide />
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
              {side === 'BUY' ? (
                <button
                  disabled={!canBuy}
                  onClick={() => canBuy && setBuyFlow(true)}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor: canBuy ? '#22c55e' : 'rgba(255,255,255,0.06)',
                    color: canBuy ? '#fff' : 'rgba(235,235,245,0.28)',
                    cursor: canBuy ? 'pointer' : 'not-allowed',
                  }}
                >
                  {!amount ? 'Enter amount to buy' : 'Buy →'}
                </button>
              ) : (
                <button
                  disabled={!canOrder}
                  onClick={() => canOrder && setBuyFlow(true)}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor: canOrder ? '#ef4444' : 'rgba(255,255,255,0.06)',
                    color: canOrder ? '#fff' : 'rgba(235,235,245,0.28)',
                    cursor: canOrder ? 'pointer' : 'not-allowed',
                  }}
                >
                  {!amount ? 'Enter amount to sell' : !canOrder ? 'Insufficient shares' : 'Review SELL Order →'}
                </button>
              )}

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
