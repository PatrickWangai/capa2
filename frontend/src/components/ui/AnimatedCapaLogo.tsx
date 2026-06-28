import { useId } from 'react';

// Geometry traced from the CAPA brand image (image for capa.png).
// viewBox "0 0 220 82" — condensed letterforms, ~2.68:1 aspect ratio.
// Each letter is a set of <path> elements animated with stroke-dashoffset.

interface Props { size?: number; glass?: boolean; className?: string; }

const D = 0.48;   // draw duration per stroke (seconds)
const S = 0.32;   // stagger between letter groups (seconds)

const STROKES: { d: string; delay: number }[] = [
  // ─── C ────────────────────────────────────
  { d: 'M 48,24 A 26,26 0 1 0 48,58',       delay: 0 },

  // ─── A (first) ────────────────────────────
  { d: 'M 63,79 L 90,3',                     delay: S },
  { d: 'M 90,3 L 118,79',                    delay: S + 0.08 },
  { d: 'M 73,52 L 108,52',                   delay: S + 0.18 },

  // ─── P ────────────────────────────────────
  { d: 'M 128,79 L 128,3',                   delay: S * 2 },
  { d: 'M 128,3 A 22,24 0 0 1 128,51',       delay: S * 2 + 0.1 },

  // ─── A (second) ───────────────────────────
  { d: 'M 158,79 L 185,3',                   delay: S * 3 },
  { d: 'M 185,3 L 212,79',                   delay: S * 3 + 0.08 },
  { d: 'M 168,52 L 202,52',                  delay: S * 3 + 0.18 },
];

const TOTAL = S * 3 + 0.18 + D;   // seconds until all strokes complete

export default function AnimatedCapaLogo({ size = 80, glass = false, className = '' }: Props) {
  const uid   = useId().replace(/:/g, '');
  const w     = Math.round(size * (220 / 82));
  const glowStart = `${(TOTAL + 0.4).toFixed(2)}s`;

  const keyframes = `
    @keyframes capa-draw-${uid} {
      from { stroke-dashoffset: 1; opacity: 0; }
      2%   { opacity: 1; }
      to   { stroke-dashoffset: 0; opacity: 1; }
    }
    @keyframes capa-glow-${uid} {
      0%,100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.35)); }
      50%     { filter: drop-shadow(0 0 16px rgba(255,255,255,0.85)); }
    }
  `;

  const svg = (
    <svg
      width={w}
      height={size}
      viewBox="0 0 220 82"
      fill="none"
      stroke="white"
      strokeWidth="13"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: `capa-glow-${uid} 3s ease-in-out infinite ${glowStart}` }}
      aria-label="CAPA"
    >
      <style>{keyframes}</style>
      {STROKES.map((s, i) => (
        <path
          key={i}
          d={s.d}
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            opacity: 0,
            animation: `capa-draw-${uid} ${D}s ease forwards`,
            animationDelay: `${s.delay.toFixed(2)}s`,
            animationFillMode: 'both',
          }}
        />
      ))}
    </svg>
  );

  if (!glass) return <div className={className} style={{ display: 'inline-flex' }}>{svg}</div>;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${Math.round(size * 0.28)}px ${Math.round(size * 0.55)}px`,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderRadius: Math.round(size * 0.2),
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {svg}
    </div>
  );
}
