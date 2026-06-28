// Image: 1440×810px, white CAPA text on black.
// Text area ≈ x:310–1130 (820px), y:260–550 (290px).
// mix-blend-mode: screen makes the black background transparent on dark surfaces.
interface Props { size?: number; color?: string; glass?: boolean; className?: string; }

export default function CapaLogo({ size = 40, glass = false, className = '' }: Props) {
  const scale    = size / 290;
  const imgW     = Math.round(1440 * scale);
  const imgH     = Math.round(810  * scale);
  const offsetX  = Math.round(310  * scale);
  const offsetY  = Math.round(260  * scale);
  const clipW    = Math.round(820  * scale);

  const img = (
    <div style={{ width: clipW, height: size, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      <img
        src="/capa-logo.png"
        alt="CAPA"
        width={imgW}
        height={imgH}
        style={{ position: 'absolute', top: -offsetY, left: -offsetX, mixBlendMode: 'screen' }}
      />
    </div>
  );

  if (!glass) {
    return (
      <div className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
        {img}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${Math.round(size * 0.3)}px ${Math.round(size * 0.6)}px`,
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: Math.round(size * 0.22),
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
      {img}
    </div>
  );
}
