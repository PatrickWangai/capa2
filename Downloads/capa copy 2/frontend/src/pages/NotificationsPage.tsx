import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Bell, Check, Trash2, TrendingUp, ShieldCheck, DollarSign, AlertCircle } from 'lucide-react';
import { EmptyState, Badge } from '../components/ui';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const TYPE_ICON: Record<string, React.ElementType> = {
  DIVIDEND: DollarSign,
  ORDER_FILLED: TrendingUp,
  KYC_UPDATE: ShieldCheck,
  PRICE_ALERT: AlertCircle,
  DEPOSIT: DollarSign,
  WITHDRAWAL: DollarSign,
  DEFAULT: Bell,
};

const TYPE_COLOR: Record<string, string> = {
  DIVIDEND: 'text-green-400 bg-green-900/30',
  ORDER_FILLED: 'text-blue-400 bg-blue-900/30',
  KYC_UPDATE: 'text-yellow-400 bg-yellow-900/30',
  PRICE_ALERT: 'text-orange-400 bg-orange-900/30',
  DEPOSIT: 'text-teal-400 bg-teal-900/30',
  WITHDRAWAL: 'text-red-400 bg-red-900/30',
  DEFAULT: 'text-gray-400 bg-gray-800',
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/notifications?limit=50').then(r => r.data),
    refetchInterval: 30_000,
  });

  const markAllRead = async () => {
    await api.post('/api/notifications/read', { ids: [] });
    qc.invalidateQueries({ queryKey: ['notifications'] });
    toast.success('All marked as read');
  };

  const deleteOne = async (id: string) => {
    await api.delete(`/api/notifications/${id}`);
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const notifications = data?.notifications || [];
  const unread = data?.unreadCount || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-1.5">
            <Check size={15} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse bg-gray-800" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up. Alerts will appear here." />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = TYPE_ICON[n.type] || TYPE_ICON.DEFAULT;
            const iconClass = TYPE_COLOR[n.type] || TYPE_COLOR.DEFAULT;
            return (
              <div key={n.id} className={clsx('card flex items-start gap-4 transition-colors', !n.isRead && 'border-blue-800/50 bg-blue-950/20')}>
                <div className={clsx('p-2 rounded-lg shrink-0', iconClass)}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx('text-sm font-medium', n.isRead ? 'text-gray-300' : 'text-white')}>{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => deleteOne(n.id)} className="text-gray-700 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
