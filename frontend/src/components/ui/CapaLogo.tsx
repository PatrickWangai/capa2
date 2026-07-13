const ASPECT = 2; // logo is landscape 2:1

interface Props { size?: number; className?: string; }

export default function CapaLogo({ size = 60, className = '' }: Props) {
  return (
    <img
      src="/capa-logo.png"
      alt="CAPA"
      height={size}
      width={Math.round(size * ASPECT)}
      draggable={false}
      className={className}
      style={{ display: 'block', mixBlendMode: 'screen', userSelect: 'none', flexShrink: 0 }}
    />
  );
}
