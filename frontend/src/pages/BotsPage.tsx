import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Bot, Play, Pause, Trash2, Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAlertStore } from '../store/alertStore';

const STRATEGIES = [
  { value: 'PRICE_THRESHOLD', label: 'Price Threshold',   desc: 'Buy below a price, sell above another' },
  { value: 'RSI',             label: 'RSI',               desc: 'Buy when oversold, sell when overbought' },
  { value: 'MA_CROSSOVER',    label: 'MA Crossover',      desc: 'Golden cross buy, death cross sell' },
  { value: 'STOP_LOSS_TP',    label: 'Stop Loss / Take Profit', desc: 'Auto-exit at % gain or loss' },
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: '#30d158',
  PAUSED: '#ff9f0a',
};

function StrategyParams({ strategy, params, setParams }: any) {
  const inp = (key: string, label: string, placeholder: string) => (
    <div key={key}>
      <label style={{ display: 'block', fontSize: 12, color: 'rgba(235,235,245,0.5)', marginBottom: 4 }}>{label}</label>
      <input
        type="number" step="any" placeholder={placeholder}
        value={params[key] ?? ''}
        onChange={e => setParams((p: any) => ({ ...p, [key]: Number(e.target.value) }))}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'rgba(44,44,46,0.9)', border: '1px solid rgba(84,84,88,0.5)', color: '#fff', fontSize: 14, boxSizing: 'border-box' as const }}
      />
    </div>
  );

  if (strategy === 'PRICE_THRESHOLD') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {inp('buyBelow',  'Buy Below (price)', 'e.g. 30.00')}
      {inp('sellAbove', 'Sell Above (price)', 'e.g. 40.00')}
    </div>
  );
  if (strategy === 'RSI') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
      {inp('period',     'Period',    '14')}
      {inp('oversold',   'Oversold',  '30')}
      {inp('overbought', 'Overbought','70')}
    </div>
  );
  if (strategy === 'MA_CROSSOVER') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {inp('shortPeriod', 'Short MA Period', '9')}
      {inp('longPeriod',  'Long MA Period',  '21')}
    </div>
  );
  if (strategy === 'STOP_LOSS_TP') return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {inp('stopLossPercent',   'Stop Loss %',   '5')}
      {inp('takeProfitPercent', 'Take Profit %', '10')}
    </div>
  );
  return null;
}

export default function BotsPage() {
  const qc = useQueryClient();
  const showAlert = useAlertStore(s => s.show);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', assetId: '', strategy: 'PRICE_THRESHOLD', quantity: '', params: {} as any });

  const { data: botsData } = useQuery({ queryKey: ['bots'], queryFn: () => api.get('/api/bots').then(r => r.data) });
  const { data: assetsData } = useQuery({ queryKey: ['assets-list'], queryFn: () => api.get('/api/assets?limit=100').then(r => r.data) });

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/api/bots', d).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bots'] }); setShowCreate(false); setForm({ name: '', assetId: '', strategy: 'PRICE_THRESHOLD', quantity: '', params: {} }); showAlert({ variant: 'success', title: 'Bot created!', message: 'Your trading bot is now active.' }); },
    onError: (e: any) => showAlert({ variant: 'error', title: 'Failed to create bot', message: e.response?.data?.error }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: any) => api.patch(`/api/bots/${id}`, { status }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bots'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/api/bots/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bots'] }); showAlert({ variant: 'info', title: 'Bot deleted' }); },
  });

  const bots = botsData?.bots ?? [];
  const assets = assetsData?.assets ?? [];

  const card: React.CSSProperties = { background: 'rgba(28,28,30,0.82)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 };

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bot size={24} color="var(--accent)" />
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Trading Bots</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(235,235,245,0.5)' }}>Automated strategies running 24/7</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={16} /> New Bot
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{ ...card, marginBottom: 20, borderColor: 'rgba(var(--accent-rgb),0.3)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: 16, fontWeight: 600 }}>Create Bot</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(235,235,245,0.5)', marginBottom: 4 }}>Bot Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. SCOM Scalper"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'rgba(44,44,46,0.9)', border: '1px solid rgba(84,84,88,0.5)', color: '#fff', fontSize: 14, boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'rgba(235,235,245,0.5)', marginBottom: 4 }}>Asset</label>
                <select value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'rgba(44,44,46,0.9)', border: '1px solid rgba(84,84,88,0.5)', color: '#fff', fontSize: 14, boxSizing: 'border-box' as const }}>
                  <option value="">Select asset...</option>
                  {assets.map((a: any) => <option key={a.id} value={a.id}>{a.symbol} — {a.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(235,235,245,0.5)', marginBottom: 6 }}>Strategy</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {STRATEGIES.map(s => (
                  <button key={s.value} onClick={() => setForm(f => ({ ...f, strategy: s.value, params: {} }))}
                    style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${form.strategy === s.value ? 'var(--accent)' : 'rgba(84,84,88,0.4)'}`, background: form.strategy === s.value ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(44,44,46,0.5)', color: form.strategy === s.value ? 'var(--accent)' : 'rgba(235,235,245,0.7)', cursor: 'pointer', textAlign: 'left' as const }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <StrategyParams strategy={form.strategy} params={form.params} setParams={(fn: any) => setForm(f => ({ ...f, params: fn(f.params) }))} />

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(235,235,245,0.5)', marginBottom: 4 }}>Quantity (shares per trade)</label>
              <input type="number" step="any" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 100"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, background: 'rgba(44,44,46,0.9)', border: '1px solid rgba(84,84,88,0.5)', color: '#fff', fontSize: 14, boxSizing: 'border-box' as const }} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(44,44,46,0.8)', border: '1px solid rgba(84,84,88,0.4)', color: 'rgba(235,235,245,0.7)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => createMut.mutate({ ...form, quantity: Number(form.quantity) })}
                disabled={!form.name || !form.assetId || !form.quantity || createMut.isPending}
                style={{ padding: '9px 18px', borderRadius: 10, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: createMut.isPending ? 0.7 : 1 }}>
                {createMut.isPending ? 'Creating…' : 'Create Bot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bots list */}
      {bots.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: 48 }}>
          <Bot size={40} color="rgba(235,235,245,0.2)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'rgba(235,235,245,0.4)', margin: 0, fontSize: 15 }}>No bots yet. Create one to start automated trading.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bots.map((bot: any) => (
            <div key={bot.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(var(--accent-rgb),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={18} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{bot.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[bot.status], background: `${STATUS_COLOR[bot.status]}20`, padding: '2px 8px', borderRadius: 20 }}>{bot.status}</span>
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(235,235,245,0.5)' }}>{bot.asset.symbol} · {STRATEGIES.find(s => s.value === bot.strategy)?.label} · {bot.tradesCount} trades</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => statusMut.mutate({ id: bot.id, status: bot.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' })}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(84,84,88,0.4)', background: 'rgba(44,44,46,0.8)', color: 'rgba(235,235,245,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    {bot.status === 'ACTIVE' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
                  </button>
                  <button onClick={() => deleteMut.mutate(bot.id)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.1)', color: '#ff3b30', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Recent trades */}
              {bot.trades.length > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Trades</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {bot.trades.map((t: any) => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(235,235,245,0.6)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {t.side === 'BUY' ? <TrendingUp size={12} color="#30d158" /> : <TrendingDown size={12} color="#ff3b30" />}
                          <span style={{ color: t.side === 'BUY' ? '#30d158' : '#ff3b30', fontWeight: 600 }}>{t.side}</span>
                          {t.quantity} @ {Number(t.price).toFixed(2)}
                        </span>
                        <span style={{ color: 'rgba(235,235,245,0.35)' }}>{t.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
