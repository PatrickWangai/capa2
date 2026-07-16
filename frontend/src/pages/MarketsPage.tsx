import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  TrendingUp, TrendingDown, Flame, Star,
  BarChart2, Activity, Clock,
} from 'lucide-react';
import clsx from 'clsx';
import { StockLogo } from '../components/ui/StockLogo';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────
function fmtVol(v: number | string | undefined): string {
  if (!v) return '—';
  const n = Number(v);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function isNSEOpen(): boolean {
  const now = new Date();
  const eat = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
  const day = eat.getDay();
  if (day === 0 || day === 6) return false;
  const m = eat.getHours() * 60 + eat.getMinutes();
  return m >= 9 * 60 && m < 15 * 60;
}

// ── Config ────────────────────────────────────────────────────
const EXCHANGES = [
  { id: 'NSE',    label: 'Nairobi',     flag: '🇰🇪', currency: 'KES', comingSoon: false },
  { id: 'NYSE',   label: 'New York',    flag: '🇺🇸', currency: 'USD', comingSoon: true  },
  { id: 'NASDAQ', label: 'NASDAQ',      flag: '🇺🇸', currency: 'USD', comingSoon: true  },
  { id: 'LSE',    label: 'London',      flag: '🇬🇧', currency: 'GBP', comingSoon: true  },
  { id: 'TSE',    label: 'Tokyo',       flag: '🇯🇵', currency: 'JPY', comingSoon: true  },
  { id: 'TSX',    label: 'Toronto',     flag: '🇨🇦', currency: 'CAD', comingSoon: true  },
  { id: 'ASX',    label: 'Sydney',      flag: '🇦🇺', currency: 'AUD', comingSoon: true  },
  { id: 'FSE',    label: 'Frankfurt',   flag: '🇩🇪', currency: 'EUR', comingSoon: true  },
  { id: 'SIX',    label: 'Zurich',      flag: '🇨🇭', currency: 'CHF', comingSoon: true  },
  { id: 'HKEX',   label: 'Hong Kong',   flag: '🇭🇰', currency: 'HKD', comingSoon: true  },
  { id: 'SGX',    label: 'Singapore',   flag: '🇸🇬', currency: 'SGD', comingSoon: true  },
  { id: 'JSE',    label: 'Johannesburg',flag: '🇿🇦', currency: 'ZAR', comingSoon: true  },
];

type View = 'all' | 'gainers' | 'losers' | 'active';
const VIEWS: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'all',     label: 'All',         icon: BarChart2   },
  { id: 'gainers', label: 'Gainers',     icon: TrendingUp  },
  { id: 'losers',  label: 'Losers',      icon: TrendingDown },
  { id: 'active',  label: 'Most Active', icon: Flame        },
];

// ── Page ─────────────────────────────────────────────────────
export default function MarketsPage() {
  const [exchange, setExchange] = useState('NSE');
  const [view, setView]         = useState<View>('all');
  const [watchlistIds, setWIds] = useState<Set<string>>(new Set());
  const qc = useQueryClient();

  const switchExchange = (ex: string) => { setExchange(ex); setView('all'); };

  const currEx = EXCHANGES.find(e => e.id === exchange)!;

  const { data, isLoading } = useQuery({
    queryKey: ['assets', exchange],
    queryFn: () =>
      api.get('/api/assets', { params: { exchange, limit: 300 } }).then(r => r.data),
    staleTime: 15_000,
    refetchInterval: 30_000,
    enabled: !currEx.comingSoon,
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
    if (view === 'gainers') {
      list = list
        .filter(a => a.price?.changePercent != null)
        .sort((a, b) => Number(b.price.changePercent) - Number(a.price.changePercent));
    } else if (view === 'losers') {
      list = list
        .filter(a => a.price?.changePercent != null)
        .sort((a, b) => Number(a.price.changePercent) - Number(b.price.changePercent));
    } else if (view === 'active') {
      list = list
        .filter(a => a.price?.volume != null)
        .sort((a, b) => Number(b.price.volume || 0) - Number(a.price.volume || 0));
    }
    return list;
  })();

  const toggleWatchlist = async (assetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isWatched = watchlistIds.has(assetId);
    setWIds(prev => {
      const next = new Set(prev);
      isWatched ? next.delete(assetId) : next.add(assetId);
      return next;
    });
    try {
      if (isWatched) {
        await api.delete(`/api/assets/watchlist/${assetId}`);
        toast.success('Removed from watchlist');
      } else {
        await api.post(`/api/assets/watchlist/${assetId}`);
        toast.success('Added to watchlist');
      }
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    } catch {
      setWIds(prev => {
        const next = new Set(prev);
        isWatched ? next.add(assetId) : next.delete(assetId);
        return next;
      });
      toast.error('Failed to update watchlist');
    }
  };

  const nseOpen = isNSEOpen();;

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Markets</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Global stocks and ETFs</p>
        </div>
        {exchange === 'NSE' && (
          <div className={clsx(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border',
            nseOpen
              ? 'bg-green-900/20 text-green-400 border-green-800/40'
              : 'bg-gray-800/60 text-gray-500 border-gray-700/40',
          )}>
            <span className={clsx('w-1.5 h-1.5 rounded-full', nseOpen ? 'bg-green-400 animate-pulse' : 'bg-gray-600')} />
            NSE {nseOpen ? 'Open · 09:00–15:00 EAT' : 'Closed'}
          </div>
        )}
      </div>

      {/* Exchange tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {EXCHANGES.map(ex => (
          <button
            key={ex.id}
            onClick={() => switchExchange(ex.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              exchange === ex.id
                ? 'text-white shadow-lg'
                : ex.comingSoon
                  ? 'bg-gray-800/40 text-gray-600 cursor-pointer'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60',
            )}
            style={exchange === ex.id ? { backgroundColor: ex.comingSoon ? 'rgba(255,255,255,0.08)' : 'var(--accent)' } : {}}
          >
            <span role="img" aria-label={ex.label}>{ex.flag}</span>
            {ex.label}
            {ex.comingSoon && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(235,235,245,0.35)' }}>
                SOON
              </span>
            )}
          </button>
        ))}
      </div>

      {/* View tabs — hidden when exchange is Coming Soon */}
      {!currEx.comingSoon && (
        <div
          className="flex gap-0.5 p-1 rounded-xl self-start"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {VIEWS.map(v => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                  view === v.id ? 'text-white' : 'text-gray-500 hover:text-gray-300',
                )}
                style={view === v.id ? { backgroundColor: 'rgba(255,255,255,0.10)' } : {}}
              >
                <Icon size={12} />
                {v.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Coming Soon placeholder */}
      {currEx.comingSoon ? (
        <div className="card py-24 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Clock size={26} className="text-gray-500" />
          </div>
          <p className="text-lg font-semibold text-white">{currEx.label} — Coming Soon</p>
          <p className="text-sm text-gray-500 mt-2 max-w-xs">
            We're working on bringing {currEx.label} ({currEx.id}) stocks to CAPA. Stay tuned for updates.
          </p>
        </div>
      ) : (
        <>
      {/* Stock list */}
      <div className="card overflow-hidden p-0">
        {/* Table header */}
        <div
          className="hidden sm:grid px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
          style={{
            gridTemplateColumns: '2.5fr 1fr 90px 90px 100px 36px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span>Stock</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change</span>
          <span className="text-right hidden lg:block">Volume</span>
          <span className="text-right hidden xl:block">Mkt Cap</span>
          <span />
        </div>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2" style={{ borderColor: 'var(--accent)' }} />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-20 text-center">
            <Activity size={32} className="mx-auto mb-3 text-gray-700" />
            <p className="text-gray-400 font-semibold">No stocks found</p>
            <p className="text-gray-600 text-sm mt-1">No data available for this exchange yet</p>
          </div>
        ) : (
          displayed.map((asset: any, idx: number) => {
            const chg     = Number(asset.price?.changePercent ?? 0);
            const up      = chg >= 0;
            const price   = asset.price?.price;
            const watched = watchlistIds.has(asset.id);

            return (
              <Link
                to={`/markets/${asset.id}`}
                key={asset.id}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  className="group sm:grid flex items-center justify-between px-5 py-3.5 transition-colors sm:items-center cursor-pointer"
                  style={{
                    gridTemplateColumns: '2.5fr 1fr 90px 90px 100px 36px',
                    borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                >
                  {/* Stock identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <StockLogo symbol={asset.symbol} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-sm">{asset.symbol}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-md hidden sm:inline-block"
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(235,235,245,0.45)' }}
                        >
                          {asset.assetClass}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: 'rgba(235,235,245,0.45)' }}>{asset.name}</p>
                    </div>
                  </div>

                  {/* Price — desktop */}
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white">
                      {price != null
                        ? `${asset.currency} ${Number(price).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '—'}
                    </p>
                  </div>

                  {/* Mobile: price+change stacked */}
                  <div className="sm:hidden text-right mr-2">
                    <p className="text-sm font-semibold text-white">{price != null ? Number(price).toFixed(2) : '—'}</p>
                    <p className={clsx('text-xs font-semibold', up ? 'text-green-400' : 'text-red-400')}>
                      {up ? '+' : ''}{chg.toFixed(2)}%
                    </p>
                  </div>

                  {/* Change % — desktop */}
                  <div className="hidden sm:flex justify-end">
                    <span className={clsx(
                      'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
                      up ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400',
                    )}>
                      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {up ? '+' : ''}{chg.toFixed(2)}%
                    </span>
                  </div>

                  {/* Volume */}
                  <p className="text-xs text-right hidden lg:block" style={{ color: 'rgba(235,235,245,0.4)' }}>
                    {fmtVol(asset.price?.volume)}
                  </p>

                  {/* Mkt Cap */}
                  <p className="text-xs text-right hidden xl:block" style={{ color: 'rgba(235,235,245,0.4)' }}>
                    {asset.price?.marketCap ? fmtVol(asset.price.marketCap) : '—'}
                  </p>

                  {/* Watchlist */}
                  <div className="flex justify-end">
                    <button
                      onClick={e => toggleWatchlist(asset.id, e)}
                      className={clsx(
                        'p-1.5 rounded-lg transition-all',
                        watched ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-400 group-hover:text-gray-500',
                      )}
                    >
                      <Star size={13} fill={watched ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Footer */}
      {!isLoading && displayed.length > 0 && (
        <p className="text-center text-xs pb-1" style={{ color: 'rgba(235,235,245,0.25)' }}>
          {displayed.length} {displayed.length === 1 ? 'stock' : 'stocks'} · {currEx.label}
        </p>
      )}
        </>
      )}
    </div>
  );
}
