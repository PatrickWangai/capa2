// Uses the PNG as a CSS mask so only the white letterforms are visible.
// The black background of the source image becomes fully transparent on any surface.
const ASPECT = 1672 / 941;

interface Props { size?: number; className?: string; }

export default function CapaLogo({ size = 60, className = '' }: Props) {
  return (
    <div
      aria-label="CAPA"
      role="img"
      className={className}
      style={{
        height: size,
        width: Math.round(size * ASPECT),
        backgroundColor: '#ffffff',
        WebkitMaskImage: 'url(/capa-logo.png)',
        maskImage: 'url(/capa-logo.png)',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        flexShrink: 0,
        display: 'block',
        userSelect: 'none',
      }}
    />
  );
}
