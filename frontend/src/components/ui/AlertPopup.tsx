import { useEffect, useRef } from 'react';
import { useAlertStore, AlertVariant } from '../../store/alertStore';

const VARIANT_CONFIG: Record<AlertVariant, {
  bg: string;
  border: string;
  iconBg: string;
  iconFg: string;
  icon: string;
  label: string;
  progressColor: string;
}> = {
  success: {
    bg: 'var(--success-muted)',
    border: 'var(--foreground)',
    iconBg: 'var(--success)',
    iconFg: 'var(--success-foreground)',
    icon: '✓',
    label: 'SUCCESS',
    progressColor: 'var(--success)',
  },
  error: {
    bg: 'var(--destructive-muted)',
    border: 'var(--foreground)',
    iconBg: 'var(--destructive)',
    iconFg: 'var(--destructive-foreground)',
    icon: '✕',
    label: 'ERROR',
    progressColor: 'var(--destructive)',
  },
  warning: {
    bg: 'var(--warning-muted)',
    border: 'var(--foreground)',
    iconBg: 'var(--warning)',
    iconFg: 'var(--warning-foreground)',
    icon: '!',
    label: 'WARNING',
    progressColor: 'var(--warning)',
  },
  info: {
    bg: 'var(--info-muted)',
    border: 'var(--foreground)',
    iconBg: 'var(--info)',
    iconFg: 'var(--info-foreground)',
    icon: 'i',
    label: 'INFO',
    progressColor: 'var(--info)',
  },
};


export default function AlertPopup() {
  const { alert, hide } = useAlertStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!alert) return;

    const duration = alert.duration ?? 4000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const remaining = Math.max(0, 1 - elapsed / duration);
      if (progressRef.current) {
        progressRef.current.style.width = `${remaining * 100}%`;
      }
      if (elapsed < duration) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
    timerRef.current = setTimeout(hide, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [alert, hide]);

  if (!alert) return null;

  const cfg = VARIANT_CONFIG[alert.variant];

  return (
    <>
      <style>{`
        @keyframes nb-pop-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(-24px) scale(0.92); }
          65%  { transform: translateX(-50%) translateY(4px) scale(1.02); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

      `}</style>

      {/* Card */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={alert.title}
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          zIndex: 9999,
          width: 'min(300px, calc(100vw - 32px))',
          backgroundColor: cfg.bg,
          border: `2px solid ${cfg.border}`,
          borderRadius: 12,
          boxShadow: `4px 4px 0 var(--foreground)`,
          animation: 'nb-pop-in 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Top label bar */}
        <div style={{
          backgroundColor: cfg.iconBg,
          borderBottom: `2px solid ${cfg.border}`,
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.16em',
            color: cfg.iconFg,
            textTransform: 'uppercase',
          }}>{cfg.label}</span>
          <button
            onClick={hide}
            aria-label="Close"
            style={{
              background: 'var(--muted-foreground)',
              border: '1.5px solid var(--muted-foreground)',
              borderRadius: 5,
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 11,
              fontWeight: 900,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '12px 14px 10px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          {/* Icon circle */}
          <div style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: cfg.iconBg,
            border: `2px solid ${cfg.border}`,
            boxShadow: `2px 2px 0 var(--foreground)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 900,
            color: cfg.iconFg,
            fontStyle: cfg.icon === 'i' ? 'italic' : 'normal',
          }}>
            {cfg.icon}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <p style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 900,
              color: 'var(--card-foreground)',
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
            }}>
              {alert.title}
            </p>
            {alert.message && (
              <p style={{
                margin: '4px 0 0',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--muted-foreground)',
                lineHeight: 1.45,
              }}>
                {alert.message}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          borderTop: `1.5px solid var(--foreground)`,
          backgroundColor: 'rgb(var(--shadow-tint) / 0.08)',
          height: 4,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div
            ref={progressRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              backgroundColor: cfg.progressColor,
              transformOrigin: 'left',
              transition: 'none',
            }}
          />
        </div>
      </div>
    </>
  );
}
