import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Bell, Check, Trash2, TrendingUp, ShieldCheck, DollarSign, AlertCircle, BellRing } from 'lucide-react';
import { EmptyState, Badge } from '../components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type FilterType = 'ALL' | 'PRICE_ALERT' | 'ORDER_FILLED' | 'DIVIDEND' | 'DEPOSIT' | 'KYC_UPDATE';

const TYPE_ICON: Record<string, React.ElementType> = {
  DIVIDEND:     DollarSign,
  ORDER_FILLED: TrendingUp,
  KYC_UPDATE:   ShieldCheck,
  PRICE_ALERT:  BellRing,
  DEPOSIT:      DollarSign,
  WITHDRAWAL:   DollarSign,
  DEFAULT:      Bell,
};

const TYPE_COLOR: Record<string, string> = {
  DIVIDEND:     'text-green-400 bg-green-900/30',
  ORDER_FILLED: 'text-blue-400 bg-blue-900/30',
  KYC_UPDATE:   'text-yellow-400 bg-yellow-900/30',
  PRICE_ALERT:  'text-orange-400 bg-orange-900/30',
  DEPOSIT:      'text-teal-400 bg-teal-900/30',
  WITHDRAWAL:   'text-red-400 bg-red-900/30',
  DEFAULT:      'text-gray-400 bg-gray-800',
};

const FILTER_TABS: { id: FilterType; label: string }[] = [
  { id: 'ALL',          label: 'All' },
  { id: 'PRICE_ALERT',  label: 'Price Alerts' },
  { id: 'ORDER_FILLED', label: 'Orders' },
  { id: 'DIVIDEND',     label: 'Dividends' },
  { id: 'DEPOSIT',      label: 'Deposits' },
  { id: 'KYC_UPDATE',   label: 'KYC' },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications?limit=100').then(r => r.data),
    refetchInterval: 30_000,
  });

  const markAllRead = async () => {
    await api.post('/api/notifications/read', { ids: [] });
    qc.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('All marked as read');
  };

  const markOne = async (id: string) => {
    await api.post('/api/notifications/read', { ids: [id] });
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const deleteOne = async (id: string) => {
    await api.delete(`/api/notifications/${id}`);
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const allNotifications: any[] = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  const notifications = filter === 'ALL'
    ? allNotifications
    : allNotifications.filter(n => n.type === filter);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {unread > 0 ? `${unread} unread` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-1.5"
            style={{ fontSize: 13, padding: '8px 14px' }}>
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTER_TABS.map(tab => {
          const count = tab.id === 'ALL'
            ? allNotifications.length
            : allNotifications.filter(n => n.type === tab.id).length;
          if (tab.id !== 'ALL' && count === 0) return null;
          return (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className={clsx('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                filter === tab.id ? 'text-white' : 'text-gray-400 hover:text-white')}
              style={{
                background: filter === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                border: filter === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
              {tab.label}
              {count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: filter === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.10)' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title={filter === 'ALL' ? 'No notifications' : `No ${FILTER_TABS.find(t => t.id === filter)?.label ?? ''} notifications`}
            description="You're all caught up. Alerts will appear here."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = TYPE_ICON[n.type] || TYPE_ICON.DEFAULT;
            const iconClass = TYPE_COLOR[n.type] || TYPE_COLOR.DEFAULT;
            return (
              <div
                key={n.id}
                className={clsx(
                  'card flex items-start gap-4 transition-colors cursor-pointer',
                  !n.isRead && 'border-blue-800/50',
                )}
                style={!n.isRead ? { backgroundColor: 'rgba(37,99,235,0.07)' } : {}}
                onClick={() => !n.isRead && markOne(n.id)}
              >
                <div className={clsx('p-2 rounded-lg shrink-0 mt-0.5', iconClass)}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx('text-sm font-medium', n.isRead ? 'text-gray-300' : 'text-white')}>{n.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.isRead && <span className="w-2 h-2 rounded-full mt-0.5" style={{ background: 'var(--accent)' }} />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-xs text-gray-600 mt-1.5">
                    {new Date(n.createdAt).toLocaleString('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteOne(n.id); }}
                  className="text-gray-700 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && notifications.length > 0 && (
        <p className="text-center text-xs pb-1 text-gray-600">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          {filter !== 'ALL' ? ` · ${FILTER_TABS.find(t => t.id === filter)?.label}` : ''}
        </p>
      )}
    </div>
  );
}
