interface CapaIconProps {
  className?: string;
}

export default function CapaIcon({ className = '' }: CapaIconProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Capa"
    >
      <defs>
        <linearGradient id="capaIconGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <mask id="capaIconMask">
          <rect width="120" height="120" fill="white" />
          {/* C hollow: opens to the right, rounded inner-left corners */}
          <path
            d="M 44,40 H 122 V 82 H 44 A 18,18 0 0 1 26,64 V 58 A 18,18 0 0 1 44,40 Z"
            fill="black"
          />
        </mask>
      </defs>
      <rect
        x="8" y="8" width="104" height="104"
        rx="26" ry="26"
        fill="url(#capaIconGrad)"
        mask="url(#capaIconMask)"
      />
    </svg>
  );
}
