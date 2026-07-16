import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { PageLoader } from '../../components/ui';
import { ArrowRightLeft, Users, DollarSign } from 'lucide-react';

const FLAG: Record<string, string> = { KES: '🇰🇪', USD: '🇺🇸', GBP: '🇬🇧', EUR: '🇪🇺' };

export default function AdminWalletsPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-wallet-stats'],
    queryFn:  () => api.get('/api/admin/wallet-stats').then(r => r.data).catch(() => null),
    refetchInterval: 60_000,
  });

  const { data: conversionsData, isLoading: convsLoading } = useQuery({
    queryKey: ['admin-wallet-conversions'],
    queryFn:  () => api.get('/api/admin/wallet-conversions?limit=50').then(r => r.data).catch(() => null),
    refetchInterval: 60_000,
  });

  const conversions: any[] = conversionsData?.conversions ?? [];
  const stats = statsData?.stats ?? null;

  // Aggregate from conversions if admin endpoint not yet wired
  const totalKesToUsd = conversions
    .filter(c => c.fromCurrency === 'KES' && c.toCurrency === 'USD')
    .reduce((s, c) => s + Number(c.fromAmount), 0);
  const totalUsdToKes = conversions
    .filter(c => c.fromCurrency === 'USD' && c.toCurrency === 'KES')
    .reduce((s, c) => s + Number(c.fromAmount), 0);
  const totalFees = conversions.reduce((s, c) => s + Number(c.fee), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet Admin</h1>
        <p className="text-gray-400 mt-1 text-sm">FX volume, conversion history, and user balances</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">KES → USD Volume</span>
          </div>
          <p className="text-2xl font-bold text-white">KES {totalKesToUsd.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500 mt-1">{conversions.filter(c => c.fromCurrency === 'KES').length} conversions</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">USD → KES Volume</span>
          </div>
          <p className="text-2xl font-bold text-white">USD {totalUsdToKes.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500 mt-1">{conversions.filter(c => c.fromCurrency === 'USD').length} conversions</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Fees Collected</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalFees.toFixed(4)}</p>
          <p className="text-xs text-gray-500 mt-1">Across {conversions.length} conversions</p>
        </div>
      </div>

      {/* Conversion history */}
      <div className="card p-0">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-semibold text-white">Conversion History</h2>
          <p className="text-xs text-gray-500 mt-0.5">All user FX conversions platform-wide</p>
        </div>

        {convsLoading ? <div className="p-6"><PageLoader /></div> : conversions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No conversions yet.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['From', 'To', 'Rate', 'Fee', 'Date'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((c: any, i: number) => (
                    <tr key={c.id} className="hover:bg-white/[0.025] transition-colors"
                      style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <td className="px-4 py-3">
                        <span className="mr-1">{FLAG[c.fromCurrency]}</span>
                        <span className="text-white font-medium">{c.fromCurrency} {Number(c.fromAmount).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="mr-1">{FLAG[c.toCurrency]}</span>
                        <span className="text-green-400 font-medium">{c.toCurrency} {Number(c.toAmount).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{Number(c.rate).toFixed(4)}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{c.feeCurrency} {Number(c.fee).toFixed(4)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' '}
                        {new Date(c.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="block lg:hidden p-4 space-y-2">
              {conversions.map((c: any) => (
                <div key={c.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1 text-sm">
                      <span>{FLAG[c.fromCurrency]}</span>
                      <span className="text-gray-500 mx-1">→</span>
                      <span>{FLAG[c.toCurrency]}</span>
                      <span className="text-white font-medium ml-1">{c.fromCurrency} {Number(c.fromAmount).toFixed(2)}</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Received: <span className="text-green-400">{c.toCurrency} {Number(c.toAmount).toFixed(2)}</span></span>
                    <span>Rate: {Number(c.rate).toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
