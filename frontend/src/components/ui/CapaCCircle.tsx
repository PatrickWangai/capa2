interface Props { size?: number; }

export default function CapaCCircle({ size = 36 }: Props) {
  const fs = Math.round(size * 0.55);
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-label="Capa" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="18" cy="18" r="18" fill="var(--accent)" />
      <text
        x="18" y="18"
        textAnchor="middle" dominantBaseline="central"
        fill="#ffffff"
        fontSize={fs}
        fontWeight="800"
        fontFamily="-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif"
      >C</text>
    </svg>
  );
}
