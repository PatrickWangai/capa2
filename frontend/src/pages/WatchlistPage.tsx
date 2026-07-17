import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Star, Trash2, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { PageLoader, EmptyState } from '../components/ui';
import toast from 'react-hot-toast';
import { useState } from 'react';

function PctBadge({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-xs text-gray-500">—</span>;
  const up = pct >= 0;
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold"
      style={{ color: up ? '#34d399' : '#f87171' }}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}{pct.toFixed(2)}%
    </span>
  );
}

export default function WatchlistPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: wlData, isLoading: wlLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn:  () => api.get('/api/assets/watchlist').then(r => r.data),
    refetchInterval: 30_000,
  });

  const { data: searchData } = useQuery({
    queryKey: ['asset-search', search],
    queryFn:  () => search.length >= 2
      ? api.get(`/api/assets?search=${encodeURIComponent(search)}&limit=8`).then(r => r.data)
      : null,
    enabled: search.length >= 2,
  });

  const addMutation = useMutation({
    mutationFn: (assetId: string) => api.post(`/api/assets/watchlist/${assetId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      setSearch('');
      toast.success('Added to watchlist');
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Failed to add'),
  });

  const removeMutation = useMutation({
    mutationFn: (assetId: string) => api.delete(`/api/assets/watchlist/${assetId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    },
  });

  const items: any[] = wlData?.watchlist?.items ?? wlData?.items ?? [];
  const searchResults: any[] = searchData?.assets ?? [];
  const watchedIds = new Set(items.map((i: any) => i.assetId ?? i.asset?.id ?? i.id));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Watchlist</h1>
          <p className="text-gray-400 mt-1 text-sm">Track stocks you're interested in</p>
        </div>
        <span className="text-xs text-gray-500 mt-2">{items.length} stock{items.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search to add */}
      <div className="card space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-9"
            placeholder="Search by name or ticker (e.g. AAPL, Apple)…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {searchResults.map((a: any, i: number) => {
              const watched = watchedIds.has(a.id);
              return (
                <div key={a.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.04] transition-colors"
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{a.symbol} <span className="text-gray-400 font-normal">· {a.exchange}</span></p>
                    <p className="text-xs text-gray-500">{a.name}</p>
                  </div>
                  <button
                    onClick={() => watched ? null : addMutation.mutate(a.id)}
                    disabled={watched || addMutation.isPending}
                    className="text-xs px-3 py-1 rounded-lg font-semibold transition-all"
                    style={{
                      background: watched ? 'rgba(255,255,255,0.06)' : 'var(--accent)',
                      color:      watched ? 'rgba(255,255,255,0.4)' : 'var(--accent-text)',
                      cursor:     watched ? 'default' : 'pointer',
                    }}>
                    {watched ? 'Watching' : '+ Add'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Watchlist */}
      {wlLoading ? <PageLoader /> : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Star}
            title="Your watchlist is empty"
            description="Search for stocks above to start tracking them."
          />
        </div>
      ) : (
        <div className="card p-0">
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Watching</p>
          </div>
          {items.map((item: any, i: number) => {
            const asset = item.asset ?? item;
            const price = asset.price ?? asset.currentPrice;
            const pct   = price?.changePercent ? Number(price.changePercent) : null;
            const assetId = item.assetId ?? asset.id;
            return (
              <div key={item.id ?? assetId}
                className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.025] transition-colors"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <Link to={`/markets/${assetId}`} className="flex items-center gap-3 flex-1 min-w-0" style={{ textDecoration: 'none' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--accent-dim)' }}>
                    {asset.symbol?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                    <p className="text-xs text-gray-500 truncate">{asset.name} · {asset.exchange}</p>
                  </div>
                </Link>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {price?.price ? Number(price.price).toFixed(2) : '—'}
                    </p>
                    <PctBadge pct={pct} />
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(assetId)}
                    disabled={removeMutation.isPending}
                    className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    title="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
