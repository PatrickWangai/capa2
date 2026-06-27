interface Props {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: Props) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.05) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
      ...style,
    }}>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ backgroundColor: '#1c1c1e', borderRadius: 18, padding: 24, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
      <Skeleton width="40%" height={14} style={{ marginBottom: 12 }} />
      <Skeleton width="70%" height={28} style={{ marginBottom: 8 }} />
      {lines > 2 && <Skeleton width="55%" height={14} />}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <Skeleton width={36} height={36} borderRadius={18} />
      <div style={{ flex: 1 }}>
        <Skeleton width="50%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="30%" height={12} />
      </div>
      <Skeleton width={80} height={14} />
    </div>
  );
}
