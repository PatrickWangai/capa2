import { Link } from 'react-router-dom';

interface ReceiptRow {
  label: string;
  value: string;
  accent?: boolean;
}

interface ReceiptAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

interface ReceiptCardProps {
  title: string;
  amount: string;
  note?: string;
  rows: ReceiptRow[];
  actions: ReceiptAction[];
}

export function ReceiptCard({ title, amount, note, rows, actions }: ReceiptCardProps) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '2px solid var(--foreground)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      {/* Top section: icon + amount */}
      <div style={{ padding: '40px 28px 32px', textAlign: 'center' }}>
        {/* Document icon with green badge */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
          <div style={{
            width: 70, height: 80,
            background: 'var(--border)',
            borderRadius: 10,
            border: '1px solid var(--secondary)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            {[38, 38, 24].map((w, i) => (
              <div key={i} style={{
                height: 2.5, width: w,
                background: 'var(--secondary)',
                borderRadius: 2,
              }} />
            ))}
          </div>
          <div style={{
            position: 'absolute', bottom: -7, right: -7,
            width: 26, height: 26,
            background: '#22c55e',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 3px var(--bg-1)',
          }}>
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 6 }}>
          {title}
        </p>
        <p style={{
          fontSize: 38, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em',
          fontFamily: 'var(--font-sans)',
        }}>
          {amount}
        </p>
        {note && (
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 8 }}>
            {note}
          </p>
        )}
      </div>

      {/* Detail rows */}
      <div style={{
        borderTop:    '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '4px 28px',
      }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '13px 0',
            borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
              {row.label}
            </span>
            <span style={{
              fontSize: 14, fontWeight: 500,
              color: row.accent ? 'var(--primary)' : 'var(--muted-foreground)',
              fontFamily: 'var(--font-sans)',
            }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{
        padding: '20px 28px',
        display: 'flex', gap: 10,
      }}>
        {actions.map((action, i) => {
          const style: React.CSSProperties = {
            flex: 1, fontSize: 14, padding: '12px 0', textAlign: 'center',
            display: 'block', textDecoration: 'none',
          };
          const cls = (action.variant ?? 'secondary') === 'primary'
            ? 'btn-primary' : 'btn-secondary';

          return action.href ? (
            <Link key={i} to={action.href} className={cls} style={style}>
              {action.label}
            </Link>
          ) : (
            <button key={i} onClick={action.onClick} className={cls} style={style}>
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
