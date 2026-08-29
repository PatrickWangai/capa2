import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Search, X, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { StockLogo } from '../components/ui/StockLogo';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────
function fmtVol(v: number | string | undefined): string {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (isNaN(n)) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(2)}K`;
  return n.toLocaleString();
}

function fmtPrice(price: number | undefined, currency: string) {
  if (price == null) return '—';
  return `${Number(price).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isNSEOpen(): boolean {
  const now = new Date();
  const eat = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
  const day = eat.getDay();
  if (day === 0 || day === 6) return false;
  const m = eat.getHours() * 60 + eat.getMinutes();
  return m >= 9 * 60 && m < 15 * 60;
}

type SortKey = 'name' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'peRatio';
type SortDir = 'asc' | 'desc';

type View = 'all' | 'gainers' | 'losers' | 'active';

const TABS: { id: View; label: string }[] = [
  { id: 'all',     label: 'Overview' },
  { id: 'gainers', label: 'Gainers' },
  { id: 'losers',  label: 'Losers' },
  { id: 'active',  label: 'Most Active' },
];

// ── Page ─────────────────────────────────────────────────────
export default function MarketsPage() {
  const [view, setView]       = useState<View>('all');
  const [search, setSearch]   = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('marketCap');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [watchlistIds, setWIds] = useState<Set<string>>(new Set());
  const qc = useQueryClient();
  const nseOpen = isNSEOpen();

  const { data, isLoading } = useQuery({
    queryKey: ['assets', 'NSE'],
    queryFn: () => api.get('/api/assets', { params: { exchange: 'NSE', limit: 300 } }).then(r => r.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const { data: wlData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/api/assets/watchlist').then(r => r.data),
  });

  useEffect(() => {
    const ids = new Set<string>(
      (wlData?.watchlist?.items ?? []).map((i: any) => i.assetId as string),
    );
    setWIds(ids);
  }, [wlData]);

  const assets: any[] = data?.assets ?? [];

  const displayed = (() => {
    let list = [...assets];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a =>
        a.symbol?.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q),
      );
    }

    if (view === 'gainers') list = list.filter(a => Number(a.price?.changePercent ?? 0) > 0);
    if (view === 'losers')  list = list.filter(a => Number(a.price?.changePercent ?? 0) < 0);

    list.sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === 'name') {
        return sortDir === 'asc'
          ? (a.name ?? '').localeCompare(b.name ?? '')
          : (b.name ?? '').localeCompare(a.name ?? '');
      }
      av = Number(a.price?.[sortKey] ?? 0);
      bv = Number(b.price?.[sortKey] ?? 0);
      if (sortKey === 'changePercent' && view === 'losers') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    if (view === 'active') {
      list = list.filter(a => a.price?.volume != null)
        .sort((a, b) => Number(b.price.volume ?? 0) - Number(a.price.volume ?? 0));
    }

    return list;
  })();

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const toggleWatchlist = async (assetId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const isWatched = watchlistIds.has(assetId);
    setWIds(prev => { const n = new Set(prev); isWatched ? n.delete(assetId) : n.add(assetId); return n; });
    try {
      if (isWatched) { await api.delete(`/api/assets/watchlist/${assetId}`); toast.success('Removed from watchlist'); }
      else           { await api.post(`/api/assets/watchlist/${assetId}`);   toast.success('Added to watchlist'); }
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    } catch {
      setWIds(prev => { const n = new Set(prev); isWatched ? n.add(assetId) : n.delete(assetId); return n; });
      toast.error('Failed to update watchlist');
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortDir === 'desc' ? <ChevronDown size={11} className="inline ml-0.5 opacity-70" /> : <ChevronUp size={11} className="inline ml-0.5 opacity-70" />)
      : <ChevronDown size={11} className="inline ml-0.5 opacity-20" />;

  return (
    <div className="max-w-7xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Markets</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Nairobi Securities Exchange · 57 stocks</p>
        </div>
        <div className={clsx(
          'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border',
          nseOpen ? 'bg-green-900/20 text-green-400 border-green-800/40' : 'bg-gray-800/60 text-gray-500 border-gray-700/40',
        )}>
          <span className={clsx('w-1.5 h-1.5 rounded-full', nseOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-600')} />
          🇰🇪 NSE {nseOpen ? 'Open · 09:00–15:00 EAT' : 'Closed'}
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '2px solid var(--foreground)' }}>

        {/* Tabs + search bar */}
        <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 12, flexWrap: 'wrap', gap: 0 }}>
          <div style={{ display: 'flex' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setView(t.id); setSearch(''); }}
                style={{
                  padding: '12px 18px',
                  fontSize: 13,
                  fontWeight: view === t.id ? 600 : 400,
                  color: view === t.id ? '#ffffff' : 'rgba(235,235,245,0.45)',
                  background: 'none',
                  border: 'none',
                  borderBottom: view === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap' as const,
                  transition: 'color 0.15s',
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(235,235,245,0.3)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search symbol or name…"
              style={{
                paddingLeft: 30, paddingRight: search ? 28 : 10,
                paddingTop: 7, paddingBottom: 7,
                fontSize: 12, border: '1px solid var(--border)', borderRadius: 6,
                outline: 'none', background: 'var(--border)', color: '#ffffff', width: 210,
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(235,235,245,0.4)', lineHeight: 1 }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--border)' }}>
                <th style={TH}>#</th>
                <th style={{ ...TH, textAlign: 'left', paddingLeft: 12 }}>Symbol</th>
                <th style={{ ...TH, textAlign: 'left', cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                  Name <SortIcon k="name" />
                </th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => toggleSort('price')}>
                  Price <SortIcon k="price" />
                </th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => toggleSort('changePercent')}>
                  Chg % <SortIcon k="changePercent" />
                </th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => toggleSort('volume')}>
                  Volume <SortIcon k="volume" />
                </th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => toggleSort('marketCap')}>
                  Mkt Cap <SortIcon k="marketCap" />
                </th>
                <th style={{ ...TH, cursor: 'pointer' }} onClick={() => toggleSort('peRatio')}>
                  P/E <SortIcon k="peRatio" />
                </th>
                <th style={TH}>52W Range</th>
                <th style={TH}>Sector</th>
                <th style={TH} />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', width: 28, height: 28, borderRadius: '50%', borderTop: '2px solid #2962ff', borderRight: '2px solid transparent', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '60px 0', textAlign: 'center', color: 'rgba(235,235,245,0.35)', fontSize: 13 }}>
                    No stocks found
                  </td>
                </tr>
              ) : displayed.map((asset, idx) => {
                const chg      = Number(asset.price?.changePercent ?? 0);
                const up       = chg >= 0;
                const price    = asset.price?.price;
                const vol      = asset.price?.volume;
                const mktCap   = asset.price?.marketCap;
                const pe       = asset.price?.peRatio;
                const hi52     = asset.price?.weekHigh52;
                const lo52     = asset.price?.weekLow52;
                const watched  = watchlistIds.has(asset.id);

                // 52W progress bar
                const range = hi52 && lo52 && hi52 !== lo52
                  ? Math.max(0, Math.min(100, ((Number(price ?? lo52) - Number(lo52)) / (Number(hi52) - Number(lo52))) * 100))
                  : null;

                return (
                  <Link to={`/markets/${asset.id}`} key={asset.id} style={{ display: 'contents', textDecoration: 'none' }}>
                    <tr
                      style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      {/* # */}
                      <td style={{ ...TD, color: 'rgba(235,235,245,0.25)', width: 40, textAlign: 'center' }}>{idx + 1}</td>

                      {/* Symbol + logo */}
                      <td style={{ ...TD, paddingLeft: 12, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <StockLogo symbol={asset.symbol} size="sm" />
                          <span style={{ fontWeight: 700, color: '#ffffff', fontSize: 13 }}>{asset.symbol}</span>
                        </div>
                      </td>

                      {/* Name */}
                      <td style={{ ...TD, color: 'rgba(235,235,245,0.55)', maxWidth: 200 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</span>
                      </td>

                      {/* Price */}
                      <td style={{ ...TD, textAlign: 'right', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {price != null ? (
                          <>{fmtPrice(price, asset.currency)} <span style={{ fontSize: 10, color: 'rgba(235,235,245,0.3)', fontWeight: 400 }}>KES</span></>
                        ) : '—'}
                      </td>

                      {/* Chg % */}
                      <td style={{ ...TD, textAlign: 'right', fontWeight: 600, color: up ? '#30d158' : '#ff453a', whiteSpace: 'nowrap' }}>
                        {up ? '+' : ''}{chg.toFixed(2)}%
                      </td>

                      {/* Volume */}
                      <td style={{ ...TD, textAlign: 'right', color: 'rgba(235,235,245,0.55)' }}>{fmtVol(vol)}</td>

                      {/* Mkt Cap */}
                      <td style={{ ...TD, textAlign: 'right', color: 'rgba(235,235,245,0.55)', whiteSpace: 'nowrap' }}>
                        {mktCap ? <>{fmtVol(mktCap)} <span style={{ fontSize: 10, color: 'rgba(235,235,245,0.3)' }}>KES</span></> : '—'}
                      </td>

                      {/* P/E */}
                      <td style={{ ...TD, textAlign: 'right', color: 'rgba(235,235,245,0.55)' }}>
                        {pe ? Number(pe).toFixed(2) : '—'}
                      </td>

                      {/* 52W Range */}
                      <td style={{ ...TD, minWidth: 120 }}>
                        {range != null ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(235,235,245,0.3)', marginBottom: 3 }}>
                              <span>{Number(lo52).toFixed(0)}</span>
                              <span>{Number(hi52).toFixed(0)}</span>
                            </div>
                            <div style={{ height: 4, background: 'var(--secondary)', borderRadius: 2, position: 'relative' }}>
                              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${range}%`, background: 'var(--primary)', borderRadius: 2 }} />
                              <div style={{ position: 'absolute', top: -2, left: `calc(${range}% - 3px)`, width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--secondary)', boxShadow: '0 0 0 1px var(--primary)' }} />
                            </div>
                          </div>
                        ) : <span style={{ color: 'rgba(235,235,245,0.2)' }}>—</span>}
                      </td>

                      {/* Sector */}
                      <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                        {asset.assetClass ? (
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--accent-dim)', color: 'var(--primary)', fontWeight: 500 }}>
                            {asset.assetClass}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Watchlist */}
                      <td style={{ ...TD, textAlign: 'center', width: 40 }}>
                        <button
                          onClick={e => toggleWatchlist(asset.id, e)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: watched ? '#ffa00a' : 'rgba(235,235,245,0.2)', padding: 4, lineHeight: 1 }}
                        >
                          <Star size={13} fill={watched ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                    </tr>
                  </Link>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && displayed.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'rgba(235,235,245,0.40)' }}>{displayed.length} {displayed.length === 1 ? 'stock' : 'stocks'} · Nairobi Securities Exchange</span>
            <span style={{ fontSize: 11, color: 'rgba(235,235,245,0.25)' }}>Prices delayed up to 15 min</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Style constants ───────────────────────────────────────────
const TH: React.CSSProperties = {
  padding: '9px 12px',
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(235,235,245,0.40)',
  textAlign: 'right',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  borderBottom: '1px solid var(--border)',
  letterSpacing: '0.02em',
};

const TD: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  verticalAlign: 'middle',
};
