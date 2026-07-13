// SVG feColorMatrix filter: maps R channel → alpha.
// Black pixels (R=0) become transparent; white pixels (R=1) stay opaque.
// Works on any background regardless of CSS stacking context.
const ASPECT = 2; // new logo is landscape (2:1)

interface Props { size?: number; className?: string; }

export default function CapaLogo({ size = 60, className = '' }: Props) {
  return (
    <>
      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="capa-logo-mask">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 0 0 0 0" />
          </filter>
        </defs>
      </svg>
      <img
        src="/capa-logo.png"
        alt="CAPA"
        height={size}
        width={Math.round(size * ASPECT)}
        draggable={false}
        className={className}
        style={{ display: 'block', filter: 'url(#capa-logo-mask)', userSelect: 'none', flexShrink: 0 }}
      />
    </>
  );
}
