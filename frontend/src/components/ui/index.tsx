import clsx from 'clsx';
export { StockLogo } from './StockLogo';

// ─── Badge ─────────────────────────────────────────────────
type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'gray';
export function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', {
      'bg-green-900/40 text-green-400': variant === 'green',
      'bg-red-900/40 text-red-400': variant === 'red',
      'bg-yellow-900/40 text-yellow-400': variant === 'yellow',
      'bg-blue-900/40 text-blue-400': variant === 'blue',
      'bg-gray-700 text-gray-300': variant === 'gray',
    })}>
      {children}
    </span>
  );
}

// ─── Spinner ───────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={clsx('animate-spin rounded-full border-b-2 border-blue-500', {
      'w-4 h-4': size === 'sm',
      'w-8 h-8': size === 'md',
      'w-12 h-12': size === 'lg',
    })} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────
export function StatCard({ label, value, sub, positive, icon: Icon }: {
  label: string; value: string; sub?: string; positive?: boolean; icon?: React.ElementType;
}) {
  return (
    <div className="card flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        {Icon && <Icon size={16} className="text-gray-600" />}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub !== undefined && (
        <p className={clsx('text-xs', positive === true ? 'text-green-400' : positive === false ? 'text-red-400' : 'text-gray-400')}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── EmptyState ────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }: {
  icon: React.ElementType; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <Icon size={40} className="mx-auto text-gray-700 mb-3" />
      <p className="font-medium text-gray-300">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
