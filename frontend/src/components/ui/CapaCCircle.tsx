interface Props { size?: number; }

export default function CapaCCircle({ size = 36 }: Props) {
  return (
    <img
      src="/capa-c-icon-512.png"
      alt="Capa"
      width={size}
      height={size}
      draggable={false}
      style={{ display: 'block', flexShrink: 0, userSelect: 'none' }}
    />
  );
}
