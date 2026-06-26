interface CapaLogoProps {
  className?: string;
}

export default function CapaLogo({ className = '' }: CapaLogoProps) {
  return (
    <svg viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Capa" fill="none">
      {/* Icon: blue circle with hexagon and chart line */}
      <circle cx="20" cy="20" r="18" fill="#2563EB" />
      <path
        d="M20 7 L31 13.5 L31 26.5 L20 33 L9 26.5 L9 13.5 Z"
        stroke="#14B8A6"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M12 24 L17 18 L22 22 L28 14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wordmark */}
      <text
        x="46"
        y="27"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        Capa
      </text>
    </svg>
  );
}
