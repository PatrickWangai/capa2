import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const EXCHANGES = ['All', 'NYSE', 'NASDAQ', 'LSE', 'NSE'];
const CLASSES = ['All', 'STOCK', 'ETF'];

export default function MarketsPage() {
  const [search, setSearch] = useState('');
  const [exchange, setExchange] = useState('All');
  const [assetClass, setAssetClass] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['assets', exchange, assetClass, search],
    queryFn: () => api.get('/api/assets', {
      params: {
        ...(exchange !== 'All' && { exchange }),
        ...(assetClass !== 'All' && { assetClass }),
        ...(search && { search }),
        limit: 100,
      }
    }).then(r => r.data),
    staleTime: 15_000,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Markets</h1>
        <p className="text-gray-400 mt-1">US, UK and Kenyan stocks & ETFs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input className="input pl-9" placeholder="Search by name or symbol…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {EXCHANGES.map(ex => (
            <button key={ex} onClick={() => setExchange(ex)}
              className={clsx('px-3 py-2 rounded-lg text-sm font-medium transition-colors', exchange === ex ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700')}>
              {ex}
            </button>
          ))}
          <div className="w-px bg-gray-700 self-stretch" />
          {CLASSES.map(c => (
            <button key={c} onClick={() => setAssetClass(c)}
              className={clsx('px-3 py-2 rounded-lg text-sm font-medium transition-colors', assetClass === c ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700')}>
              {c === 'All' ? 'All Types' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Asset', 'Exchange', 'Price', 'Change', 'Volume', ''].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td></tr>
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
                        <p className="text-gray-400 text-xs truncate max-w-[160px]">{asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="badge-blue">{asset.exchange}</span>
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
    </div>
  );
}
