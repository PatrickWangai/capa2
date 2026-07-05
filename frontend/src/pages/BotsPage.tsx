import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Bot, Plus, Pause, Play, Trash2, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useAlertStore } from '../store/alertStore';

const STRATEGIES = [
  { value: 'PRICE_THRESHOLD', label: 'Price Threshold', desc: 'Buy below X, sell above Y' },
  { value: 'RSI',             label: 'RSI',             desc: 'Buy oversold, sell overbought' },
  { value: 'MA_CROSSOVER',    label: 'MA Crossover',    desc: 'Golden/death cross signals' },
  { value: 'STOP_LOSS_TP',    label: 'Stop Loss / Take Profit', desc: 'Auto exit on % change' },
];

const STRATEGY_PARAMS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  PRICE_THRESHOLD: [
    { key: 'buyBelow',  label: 'Buy Below Price',  placeholder: 'e.g. 30.00' },
    { key: 'sellAbove', label: 'Sell Above Price', placeholder: 'e.g. 45.00' },
  ],
  RSI: [
    { key: 'period',    label: 'RSI Period',   placeholder: '14' },
    { key: 'oversold',  label: 'Oversold (<)', placeholder: '30' },
    { key: 'overbought',label: 'Overbought (>', placeholder: '70' },
  ],
  MA_CROSSOVER: [
    { key: 'shortPeriod', label: 'Short MA Period', placeholder: '9' },
    { key: 'longPeriod',  label: 'Long MA Period',  placeholder: '21' },
  ],
  STOP_LOSS_TP: [
    { key: 'stopLossPercent',    label: 'Stop Loss %',    placeholder: '5' },
    { key: 'takeProfitPercent',  label: 'Take Profit %',  placeholder: '10' },
  ],
};

const STATUS_COLOR: Record<string, string> = { ACTIVE: '#30d158', PAUSED: '#ff9f0a' };

function BotCard({ bot, onToggle, onDelete }: any) {
  const [expanded, setExpanded] = useState(false);
  const lastTrade = bot.trades?.[0];

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '18px 20px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(var(--accent-rgb),0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color='var(--accent)' />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{bot.name}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
              {bot.asset.symbol} · {STRATEGIES.find(s => s.value === bot.strategy)?.label}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[bot.status] ?? '#888', background: `${STATUS_COLOR[bot.status] ?? '#888'}22`, borderRadius: 6, padding: '3px 8px' }}>
            {bot.status}
          </span>
          <button onClick={() => onToggle(bot)} title={bot.status === 'ACTIVE' ? 'Pause' : 'Resume'}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            {bot.status === 'ACTIVE' ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button onClick={() => onDelete(bot.id)} title="Delete"
            style={{ background: 'rgba(255,59,48,0.1)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#ff3b30', display: 'flex' }}>
            <Trash2 size={15} />
          </button>
          <button onClick={() => setExpanded(e => !e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
        <div><p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>Quantity</p><p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{Number(bot.quantity).toFixed(2)}</p></div>
        <div><p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>Trades</p><p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{bot.tradesCount}</p></div>
        <div><p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>Last trade</p><p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{lastTrade ? new Date(lastTrade.createdAt).toLocaleDateString() : '—'}</p></div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--card-border)', paddingTop: 14 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Parameters</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {Object.entries(bot.params as Record<string, any>).map(([k, v]) => (
              <div key={k}><p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{k}</p><p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{String(v)}</p></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BotsPage() {
  const qc = useQueryClient();
  const showAlert = useAlertStore(s => s.show);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', assetId: '', strategy: 'PRICE_THRESHOLD', quantity: '', params: {} as Record<string, string> });

  const { data: bots, isLoading } = useQuery({ queryKey: ['bots'], queryFn: () => api.get('/api/bots').then(r => r.data.bots) });
  const { data: assets } = useQuery({ queryKey: ['assets-list'], queryFn: () => api.get('/api/assets').then(r => r.data.assets ?? r.data) });

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/api/bots', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bots'] }); setShowForm(false); showAlert({ variant: 'success', title: 'Bot created', message: `${form.name} is now active.` }); },
    onError: (e: any) => showAlert({ variant: 'error', title: 'Failed', message: e.response?.data?.error || 'Could not create bot.' }),
  });

  const toggleMut = useMutation({
    mutationFn: (bot: any) => api.patch(`/api/bots/${bot.id}`, { status: bot.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bots'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/api/bots/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bots'] }); showAlert({ variant: 'info', title: 'Bot deleted' }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, number> = {};
    for (const [k, v] of Object.entries(form.params)) params[k] = Number(v);
    createMut.mutate({ name: form.name, assetId: form.assetId, strategy: form.strategy, quantity: Number(form.quantity), params });
  };

  const nseAssets = (assets ?? []).filter((a: any) => a.exchange === 'NSE');

  return (
    <div style={{ padding: '24px 28px', maxWidth: 780, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bot size={24} color='var(--accent)' />
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Trading Bots</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Automated strategies that trade on your behalf</p>
          </div>
        </div>
        <button onClick={() => setShowForm(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          <Plus size={16} /> New Bot
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <p style={{ margin: '0 0 16px', fontWeight: 700, color: 'var(--text)', fontSize: 16 }}>Create Bot</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Bot Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Safaricom RSI Bot"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Asset (NSE)</label>
              <select value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))} required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }}>
                <option value="">Select asset…</option>
                {nseAssets.map((a: any) => <option key={a.id} value={a.id}>{a.symbol} — {a.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Strategy</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {STRATEGIES.map(s => (
                <button type="button" key={s.value} onClick={() => setForm(f => ({ ...f, strategy: s.value, params: {} }))}
                  style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', background: form.strategy === s.value ? 'rgba(var(--accent-rgb),0.15)' : 'rgba(255,255,255,0.04)', border: form.strategy === s.value ? '1.5px solid var(--accent)' : '1.5px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)' }}>{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STRATEGY_PARAMS[form.strategy].length + 1}, 1fr)`, gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Quantity (shares)</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required placeholder="e.g. 100"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            {STRATEGY_PARAMS[form.strategy].map(p => (
              <div key={p.key}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{p.label}</label>
                <input type="number" step="any" placeholder={p.placeholder} value={form.params[p.key] ?? ''}
                  onChange={e => setForm(f => ({ ...f, params: { ...f.params, [p.key]: e.target.value } }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={createMut.isPending}
              style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              {createMut.isPending ? 'Creating…' : 'Create Bot'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ padding: '11px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>Loading bots…</p>}

      {!isLoading && (!bots || bots.length === 0) && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <TrendingUp size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 15 }}>No bots yet. Create one to start automated trading.</p>
        </div>
      )}

      {bots?.map((bot: any) => (
        <BotCard key={bot.id} bot={bot} onToggle={(b: any) => toggleMut.mutate(b)} onDelete={(id: string) => deleteMut.mutate(id)} />
      ))}
    </div>
  );
}
