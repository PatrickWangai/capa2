import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { StockLogo } from '../ui/StockLogo';
import clsx from 'clsx';

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setDebouncedQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: ['palette-search', debouncedQuery],
    queryFn: () =>
      api.get('/api/assets', { params: { search: debouncedQuery, limit: 8 } }).then(r => r.data),
    enabled: debouncedQuery.length > 0,
    staleTime: 10_000,
  });

  const assets: any[] = data?.assets ?? [];

  const go = (assetId: string) => {
    navigate(`/markets/${assetId}`);
    onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, assets.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && assets[selectedIdx]) go(assets[selectedIdx].id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, assets, selectedIdx]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl"
        style={{
          background: 'rgba(20,20,22,0.97)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 96px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={17} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
            placeholder="Search stocks, ETFs..."
            style={{ flex: 1, background: 'transparent', color: 'var(--text)', outline: 'none', fontSize: 16, fontFamily: 'inherit' }}
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-gray-600 hover:text-gray-400 transition-colors">
              <X size={15} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs text-gray-600"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              ESC
            </kbd>
          )}
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {isFetching && debouncedQuery && (
            <div className="px-5 py-5 text-center text-sm text-gray-500">Searching…</div>
          )}
          {!isFetching && debouncedQuery && assets.length === 0 && (
            <div className="px-5 py-5 text-center text-sm text-gray-500">No results for "{debouncedQuery}"</div>
          )}
          {!debouncedQuery && (
            <div className="px-5 py-5 text-center text-sm text-gray-600">
              Search across all exchanges — NYSE, NASDAQ, NSE, LSE
            </div>
          )}
          {assets.map((asset: any, i: number) => {
            const chg = Number(asset.price?.changePercent ?? 0);
            const up = chg >= 0;
            return (
              <button
                key={asset.id}
                onClick={() => go(asset.id)}
                onMouseEnter={() => setSelectedIdx(i)}
                className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left"
                style={{ backgroundColor: i === selectedIdx ? 'rgba(255,255,255,0.06)' : 'transparent' }}
              >
                <StockLogo symbol={asset.symbol} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{asset.symbol}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(235,235,245,0.45)' }}>
                      {asset.exchange}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(235,235,245,0.35)' }}>
                      {asset.assetClass}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{asset.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-white">
                    {asset.price?.price != null
                      ? `${asset.currency} ${Number(asset.price.price).toFixed(2)}`
                      : '—'}
                  </p>
                  {asset.price?.changePercent != null && (
                    <p className={clsx('text-xs font-medium flex items-center gap-0.5 justify-end', up ? 'text-green-400' : 'text-red-400')}>
                      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {up ? '+' : ''}{chg.toFixed(2)}%
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {assets.length > 0 && (
          <div className="px-5 py-2.5 flex items-center justify-between text-xs text-gray-600"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span>↑↓ navigate · ↵ select · ESC close</span>
            <span>{assets.length} result{assets.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
