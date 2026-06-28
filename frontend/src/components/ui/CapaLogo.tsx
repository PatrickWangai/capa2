interface Props { size?: number; color?: string; className?: string; }

export default function CapaLogo({ size = 40, color = '#ffffff', className = '' }: Props) {
  return (
    <span
      className={className}
      aria-label="Capa"
      role="img"
      style={{
        display: 'inline-block',
        fontFamily: '"Poppins", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Arial Black", Arial, sans-serif',
        fontWeight: 900,
        fontSize: `${size}px`,
        lineHeight: 1,
        color,
        letterSpacing: '-0.03em',
        userSelect: 'none',
        WebkitFontSmoothing: 'antialiased',
      }}>
      CAPA
    </span>
  );
}
