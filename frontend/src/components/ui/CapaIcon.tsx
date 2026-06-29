interface CapaIconProps {
  className?: string;
  animated?: boolean;
}

export default function CapaIcon({ className = '', animated = false }: CapaIconProps) {
  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'helmet-animated' : ''}`}
      aria-label="Capa"
    >
      <defs>
        <linearGradient id="helmetOrange" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#0fa8a0" />
        </linearGradient>
        <mask id="helmetVisor">
          <rect width="200" height="240" fill="white" />
          <rect x="46" y="84" width="108" height="66" rx="13" fill="black" />
        </mask>
      </defs>
      <path
        d="M100,10 C52,10 16,50 16,98 L16,165 C16,190 36,208 62,210 L138,210 C164,208 184,190 184,165 L184,98 C184,50 148,10 100,10 Z"
        fill="url(#helmetOrange)"
        mask="url(#helmetVisor)"
      />
    </svg>
  );
}
