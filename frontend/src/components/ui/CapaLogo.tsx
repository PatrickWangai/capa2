// Protected brand asset — uses /capa-logo.png exactly as provided.
// mix-blend-mode: screen makes the black background transparent on dark surfaces
// so only the white letterforms are visible. The image is never cropped,
// stretched, or modified — only scaled proportionally via the size prop.

const ASPECT = 1672 / 941; // exact pixel dimensions of capa-logo.png

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
      style={{ display: 'block', mixBlendMode: 'lighten', userSelect: 'none', flexShrink: 0 }}
    />
  );
}
