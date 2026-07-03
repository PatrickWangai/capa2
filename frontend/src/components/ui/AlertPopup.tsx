import { useEffect, useRef } from 'react';
import { useAlertStore, AlertVariant } from '../../store/alertStore';

const VARIANT_CONFIG: Record<AlertVariant, {
  bg: string;
  border: string;
  iconBg: string;
  icon: string;
  label: string;
  progressColor: string;
}> = {
  success: {
    bg: '#f0fff4',
    border: '#000',
    iconBg: '#00C853',
    icon: '✓',
    label: 'SUCCESS',
    progressColor: '#00C853',
  },
  error: {
    bg: '#fff5f5',
    border: '#000',
    iconBg: '#FF3B30',
    icon: '✕',
    label: 'ERROR',
    progressColor: '#FF3B30',
  },
  warning: {
    bg: '#fffbf0',
    border: '#000',
    iconBg: '#FF9500',
    icon: '!',
    label: 'WARNING',
    progressColor: '#FF9500',
  },
  info: {
    bg: '#f0f8ff',
    border: '#000',
    iconBg: '#007AFF',
    icon: 'i',
    label: 'INFO',
    progressColor: '#007AFF',
  },
};

const STAR_POSITIONS = [
  { top: 14, left: 14, size: 16, opacity: 0.18 },
  { top: 18, right: 18, size: 10, opacity: 0.14 },
  { bottom: 16, left: 18, size: 8,  opacity: 0.12 },
  { bottom: 12, right: 14, size: 14, opacity: 0.16 },
];

function Star({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 20 20" style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#000" />
    </svg>
  );
}

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
          top: 24,
          left: '50%',
          zIndex: 9999,
          width: 'min(360px, calc(100vw - 48px))',
          backgroundColor: cfg.bg,
          border: `3px solid ${cfg.border}`,
          borderRadius: 18,
          boxShadow: '7px 7px 0 #000',
          animation: 'nb-pop-in 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Decorative stars */}
        {STAR_POSITIONS.map((pos, i) => (
          <Star key={i} style={{ width: pos.size, height: pos.size, opacity: pos.opacity, top: pos.top, left: (pos as any).left, right: (pos as any).right, bottom: (pos as any).bottom }} />
        ))}

        {/* Top label bar */}
        <div style={{
          backgroundColor: cfg.iconBg,
          borderBottom: '3px solid #000',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.18em',
            color: '#fff',
            textTransform: 'uppercase',
          }}>{cfg.label}</span>
          <button
            onClick={hide}
            aria-label="Close"
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: 6,
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 13,
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
          padding: '24px 24px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 18,
        }}>
          {/* Icon circle */}
          <div style={{
            flexShrink: 0,
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: cfg.iconBg,
            border: '3px solid #000',
            boxShadow: '3px 3px 0 #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 900,
            color: '#fff',
            fontStyle: cfg.icon === 'i' ? 'italic' : 'normal',
          }}>
            {cfg.icon}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <p style={{
              margin: 0,
              fontSize: 19,
              fontWeight: 900,
              color: '#000',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}>
              {alert.title}
            </p>
            {alert.message && (
              <p style={{
                margin: '6px 0 0',
                fontSize: 14,
                fontWeight: 500,
                color: '#333',
                lineHeight: 1.5,
              }}>
                {alert.message}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          borderTop: '2px solid #000',
          backgroundColor: 'rgba(0,0,0,0.08)',
          height: 6,
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
