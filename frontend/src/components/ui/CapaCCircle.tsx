interface Props { size?: number; color?: string; }

/**
 * Capa mark: thick C-ring (open right) with a small circle inside the void.
 * Geometry: outer R=40, inner r=22, gap ±35°, inner dot r=9, viewBox 100×100.
 */
export default function CapaCCircle({ size = 36, color = 'var(--accent)' }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Capa" style={{ display: 'block', flexShrink: 0 }}>
      {/*
        C ring path:
          M  outer top-gap  →  large CCW arc outer  →  outer bottom-gap
          L  inner bottom-gap  →  large CW arc inner  →  inner top-gap  Z
        outer R=40, inner r=22, half-angle θ=35°
        cos35≈0.8192  sin35≈0.5736
        outer top   : (82.77, 27.06)   outer bottom : (82.77, 72.94)
        inner top   : (68.02, 37.38)   inner bottom : (68.02, 62.62)
      */}
      <path
        d="M 82.77,27.06 A 40,40 0 1,0 82.77,72.94 L 68.02,62.62 A 22,22 0 1,1 68.02,37.38 Z"
        fill={color}
      />
      {/* Inner dot */}
      <circle cx="50" cy="50" r="9" fill={color} />
    </svg>
  );
}
