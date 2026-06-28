import { useId } from 'react';

// Animated recreation of the original CAPA brand mark (FullLogo.png):
//   1. Square-C icon with purple→pink gradient, drawn in via stroke animation
//   2. "CAPA" wordmark below, fades in after icon completes
// No floating — animation plays once, then a gentle glow pulses.
//
// viewBox "0 0 100 148":  icon 0–100 × 0–100, text centred at y≈132

interface Props { size?: number; className?: string; }

// Icon: 3/4-perimeter of a 90×90 rounded-rect, leaving a gap on the right.
// Traces CCW from top of gap → around the C → back to bottom of gap.
const ICON_D =
  'M 95,38 L 95,22 A 18,18 0 0 0 77,4 L 23,4 A 18,18 0 0 0 5,22 L 5,78 A 18,18 0 0 0 23,96 L 77,96 A 18,18 0 0 0 95,78 L 95,62';

export default function FullCapaLogo({ size = 100, className = '' }: Props) {
  const uid = useId().replace(/:/g, '');
  const scale = size / 100;
  const w = Math.round(100 * scale);
  const h = Math.round(148 * scale);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 148"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CAPA"
    >
      <defs>
        {/* Purple → pink gradient, top to bottom */}
        <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        {/* Horizontal stencil cut through the CAPA letters (at ~47% cap height) */}
        <mask id={`stencil-${uid}`}>
          <rect x="0" y="0"   width="100" height="125.5" fill="white" />
          <rect x="0" y="125.5" width="100" height="2.5"   fill="black" />
          <rect x="0" y="128"  width="100" height="20"    fill="white" />
        </mask>

        {/* Keyframes scoped by uid so multiple instances don't clash */}
        <style>{`
          @keyframes icon-draw-${uid} {
            from { stroke-dashoffset: 1; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes text-in-${uid} {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes glow-${uid} {
            0%,100% { filter: drop-shadow(0 0 4px rgba(168,85,247,0.3)) drop-shadow(0 0 2px rgba(236,72,153,0.2)); }
            50%     { filter: drop-shadow(0 0 18px rgba(168,85,247,0.75)) drop-shadow(0 0 10px rgba(236,72,153,0.55)); }
          }
        `}</style>
      </defs>

      {/* ── Icon mark ── */}
      <g style={{ animation: `glow-${uid} 3.5s ease-in-out infinite 1.8s` }}>
        <path
          d={ICON_D}
          fill="none"
          stroke={`url(#grad-${uid})`}
          strokeWidth="17"
          strokeLinecap="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animation: `icon-draw-${uid} 1.2s cubic-bezier(0.4,0,0.2,1) forwards`,
          }}
        />
      </g>

      {/* ── CAPA wordmark ── */}
      <text
        x="50"
        y="140"
        textAnchor="middle"
        fill={`url(#grad-${uid})`}
        fontFamily='"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif'
        fontWeight="900"
        fontSize="30"
        letterSpacing="2"
        mask={`url(#stencil-${uid})`}
        style={{
          opacity: 0,
          animation: `text-in-${uid} 0.55s ease forwards`,
          animationDelay: '1.1s',
          animationFillMode: 'both',
        }}
      >
        CAPA
      </text>
    </svg>
  );
}
