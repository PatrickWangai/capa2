import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Search, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import clsx from 'clsx';

const EXCHANGES = ['NSE', 'NYSE', 'NASDAQ', 'LSE'];
const COMING_SOON = ['NYSE', 'NASDAQ', 'LSE'];

const EXCHANGE_LABELS: Record<string, string> = {
  NSE: 'Nairobi (NSE)',
  NYSE: 'New York (NYSE)',
  NASDAQ: 'NASDAQ',
  LSE: 'London (LSE)',
};

export default function MarketsPage() {
  const [search, setSearch] = useState('');
  const [exchange, setExchange] = useState('NSE');

  const isComingSoon = COMING_SOON.includes(exchange);

  const { data, isLoading } = useQuery({
    queryKey: ['assets', exchange, search],
    queryFn: () => api.get('/api/assets', {
      params: { exchange, ...(search && { search }), limit: 100 },
    }).then(r => r.data),
    enabled: !isComingSoon,
    staleTime: 15_000,
  });

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
              exchange === ex ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input className="input pl-9" placeholder="Search by name or symbol…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Table */}
          <div className="card overflow-x-auto p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Asset', 'Price', 'Change', 'Volume', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td></tr>
                  ))
                ) : data?.assets?.map((asset: any) => {
                  const price = asset.price;
                  const change = Number(price?.changePercent || 0);
                  const isUp = change >= 0;
                  return (
                    <tr key={asset.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-blue-400">
                            {asset.symbol.slice(0, 2)}
                          </div>
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
                        <span className={clsx('flex items-center gap-1 text-sm font-medium', isUp ? 'text-green-400' : 'text-red-400')}>
                          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isUp ? '+' : ''}{change.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-400 text-sm">
                        {price?.volume ? Number(price.volume).toLocaleString() : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/markets/${asset.id}`} className="btn-primary text-xs px-3 py-1.5">Trade</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!isLoading && !data?.assets?.length && (
              <div className="text-center py-12 text-gray-500">No assets found.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
