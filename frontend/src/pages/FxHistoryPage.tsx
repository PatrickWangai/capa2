import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowRightLeft, ChevronLeft } from 'lucide-react';
import { PageLoader, EmptyState } from '../components/ui';

const FLAG: Record<string, string> = { KES: '🇰🇪', USD: '🇺🇸', GBP: '🇬🇧', EUR: '🇪🇺' };

export default function FxHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['fx-history'],
    queryFn:  () => api.get('/api/wallets/conversions?limit=100').then(r => r.data),
    refetchInterval: 30_000,
  });

  const conversions: any[] = data?.conversions ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/wallet" style={{ color: 'var(--accent)', display: 'flex' }}>
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">FX History</h1>
          <p className="text-gray-400 mt-0.5 text-sm">All currency conversions</p>
        </div>
      </div>

      {isLoading ? <PageLoader /> : conversions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ArrowRightLeft}
            title="No conversions yet"
            description="Convert KES to USD to start investing in US stocks."
            action={<Link to="/wallet/convert" className="btn-primary">Convert Now</Link>}
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-x-auto p-0 hidden lg:block">
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
                      <span className="text-lg mr-1">{FLAG[c.fromCurrency]}</span>
                      <span className="text-white font-semibold">{c.fromCurrency} {Number(c.fromAmount).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg mr-1">{FLAG[c.toCurrency]}</span>
                      <span className="text-green-400 font-semibold">{c.toCurrency} {Number(c.toAmount).toFixed(2)}</span>
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
          <div className="block lg:hidden space-y-2">
            {conversions.map((c: any) => (
              <div key={c.id} className="card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{FLAG[c.fromCurrency]}</span>
                    <ArrowRightLeft size={12} className="text-gray-600" />
                    <span className="text-xl">{FLAG[c.toCurrency]}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Spent</span><span className="text-xs text-white">{c.fromCurrency} {Number(c.fromAmount).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Received</span><span className="text-xs text-green-400">{c.toCurrency} {Number(c.toAmount).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Rate</span><span className="text-xs text-gray-400">{Number(c.rate).toFixed(4)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-500">Fee</span><span className="text-xs text-gray-400">{c.feeCurrency} {Number(c.fee).toFixed(4)}</span></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 pb-1">
            {conversions.length} conversion{conversions.length !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}
