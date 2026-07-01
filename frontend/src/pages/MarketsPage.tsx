import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { TrendingUp, TrendingDown, Clock, Flame } from 'lucide-react';
import clsx from 'clsx';
import { StockLogo } from '../components/ui/StockLogo';

// Symbols stored as .svg in /public/logos/
const SVG_LOGOS = new Set(['ABSA','BOC','EVRD','ISF','JUB']);
// All symbols that have a real logo file in /public/logos/
const LOCAL_LOGOS = new Set([
  'AAPL','ABSA','AMZN','AZN','BARC','BATK','BKG','BOC','BP','BRIT','CARB',
  'CIC','COOP','CRWN','CTUM','DTK','EABL','EGAD','EQTY','EVRD','FMLY','FTGH',
  'GOOGL','IMH','ISF','JPM','JUB','KCB','KEGN','KNRE','KPC','KPLC','KQ',
  'KUKZ','LBTY','LKL','LLOY','META','MSFT','NCBA','NMG','NSE','NVDA',
  'QQQ','SASN','SCAN','SCBK','SCOM','SGL','SHEL','SLAM','SMER',
  'SMWF','SPY','TOTL','TPSE','TSLA','UMME','VOD','VTI','VUKE','VWO','XPRS',
]);
// Re-export for StockLogo to pick up (used by the shared component imported below)
export { SVG_LOGOS, LOCAL_LOGOS };

function formatVolume(v: number | string | undefined): string {
  if (!v) return '—';
  const n = Number(v);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const EXCHANGES = ['NSE', 'NYSE', 'NASDAQ', 'LSE'];
const COMING_SOON = ['NYSE', 'NASDAQ', 'LSE'];
const EXCHANGE_LABELS: Record<string, string> = {
  NSE: 'Nairobi (NSE)', NYSE: 'New York (NYSE)', NASDAQ: 'NASDAQ', LSE: 'London (LSE)',
};

type Period = '1D' | '1W' | '1M';
const PERIODS: { id: Period; label: string }[] = [
  { id: '1D', label: '1D' },
  { id: '1W', label: '1W' },
  { id: '1M', label: '1M' },
];

export default function MarketsPage() {
  const [search, setSearch] = useState('');
  const [exchange, setExchange] = useState('NSE');
  const [period, setPeriod] = useState<Period>('1D');

  const isComingSoon = COMING_SOON.includes(exchange);

  const { data, isLoading } = useQuery({
    queryKey: ['assets', exchange, search],
    queryFn: () => api.get('/api/assets', {
      params: { exchange, ...(search && { search }), limit: 100 },
    }).then(r => r.data),
    enabled: !isComingSoon,
    staleTime: 15_000,
  });

  const assets: any[] = data?.assets || [];

  // Top movers — sorted by abs(changePercent), top 4
  const topMovers = [...assets]
    .filter(a => a.price?.changePercent != null)
    .sort((a, b) => Math.abs(Number(b.price.changePercent)) - Math.abs(Number(a.price.changePercent)))
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Markets</h1>
        <p className="text-gray-400 mt-1">Nairobi Securities Exchange — live prices</p>
      </div>

      {/* Exchange tabs */}
      <div className="flex gap-2 flex-wrap">
        {EXCHANGES.map(ex => (
          <button key={ex} onClick={() => setExchange(ex)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              exchange === ex ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
            )}>
            {EXCHANGE_LABELS[ex]}
            {COMING_SOON.includes(ex) && (
              <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">Soon</span>
            )}
          </button>
        ))}
      </div>

      {/* Coming soon state */}
      {isComingSoon ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
            <Clock size={24} className="text-gray-500" />
          </div>
          <div>
            <h2 className="text-white text-lg font-semibold">{EXCHANGE_LABELS[exchange]} — Coming Soon</h2>
            <p className="text-gray-400 mt-1 text-sm max-w-xs">
              We're working on bringing {exchange} stocks to the platform. Check back soon.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Movers */}
          {!isLoading && topMovers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame size={15} className="text-orange-400" />
                <span className="text-sm font-semibold text-white">Top Movers</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topMovers.map((asset: any) => {
                  const chg = Number(asset.price?.changePercent ?? 0);
                  const up = chg >= 0;
                  return (
                    <Link to={`/markets/${asset.id}`} key={asset.id} style={{ textDecoration: 'none' }}>
                      <div className={clsx('card hover:border-gray-700 transition-all cursor-pointer', up ? 'hover:border-green-800' : 'hover:border-red-800')} style={{ padding: '14px 16px' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <StockLogo symbol={asset.symbol} size="sm" />
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm">{asset.symbol}</p>
                            <p className="text-gray-400 text-xs truncate">{asset.name}</p>
                          </div>
                        </div>
                        <p className="text-white font-semibold text-sm">{asset.currency} {Number(asset.price?.price || 0).toFixed(2)}</p>
                        <span className={clsx('text-xs font-bold flex items-center gap-0.5 mt-0.5', up ? 'text-green-400' : 'text-red-400')}>
                          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {up ? '+' : ''}{chg.toFixed(2)}%
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search + period toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative max-w-sm flex-1">
              <input
                className="input w-full"
                placeholder="Search by name or symbol…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 shrink-0">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={clsx(
                    'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
                    period === p.id ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-x-auto p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Asset', 'Price', `Change (${period})`, 'Volume', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-4">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : assets.map((asset: any) => {
                  const price = asset.price;
                  const change =
                    period === '1D' ? Number(price?.changePercent ?? 0) :
                    period === '1W' ? (asset.changeWeekly  ?? null) :
                                     (asset.changeMonthly ?? null);
                  const hasChange = change !== null;
                  const up = (change ?? 0) >= 0;
                  return (
                    <tr key={asset.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <StockLogo symbol={asset.symbol} />
                          <div>
                            <p className="font-semibold text-white text-sm">{asset.symbol}</p>
                            <p className="text-gray-400 text-xs truncate max-w-[180px]">{asset.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-white text-sm">
                        {asset.currency} {price ? Number(price.price).toFixed(2) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {hasChange ? (
                          <span className={clsx('flex items-center gap-1 text-sm font-medium', up ? 'text-green-400' : 'text-red-400')}>
                            {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {up ? '+' : ''}{(change as number).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-600 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-sm">
                        {formatVolume(price?.volume)}
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/markets/${asset.id}`} className="btn-primary text-xs px-3 py-1.5">Trade</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!isLoading && !assets.length && (
              <div className="text-center py-12 text-gray-500">No assets found.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
