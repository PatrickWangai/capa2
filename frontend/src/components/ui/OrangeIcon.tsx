import { useId } from 'react';

interface Props { className?: string; size?: number }

export default function OrangeIcon({ className = '', size = 40 }: Props) {
  const uid = useId().replace(/:/g, '');
  const bodyId  = `og-body-${uid}`;
  const shineId = `og-shine-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Capa">
      <defs>
        <radialGradient id={bodyId} cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#ffb347" />
          <stop offset="55%"  stopColor="#20d4b8" />
          <stop offset="100%" stopColor="#c85f0a" />
        </radialGradient>
        <radialGradient id={shineId} cx="30%" cy="22%" r="38%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Body */}
      <circle cx="100" cy="108" r="82" fill={`url(#${bodyId})`} />
      <circle cx="100" cy="108" r="82" fill={`url(#${shineId})`} />

      {/* Texture segments */}
      {[0,60,120,180,240,300].map(a => (
        <line key={a}
          x1="100" y1="108"
          x2={100 + 82 * Math.cos((a * Math.PI) / 180)}
          y2={108 + 82 * Math.sin((a * Math.PI) / 180)}
          stroke="rgba(160,80,0,0.12)" strokeWidth="1.5"
        />
      ))}

      {/* Specular highlight */}
      <ellipse cx="70" cy="70" rx="28" ry="19" fill="rgba(255,255,255,0.38)" transform="rotate(-35 70 70)" />
      <ellipse cx="62" cy="62" rx="10" ry="7"  fill="rgba(255,255,255,0.55)" transform="rotate(-35 62 62)" />

      {/* Stem */}
      <path d="M100,30 C98,22 102,14 99,6" stroke="#4a6e00" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Leaf */}
      <path d="M98,27 C114,4 150,7 143,29 C136,50 108,40 98,27Z" fill="#5ab42a" />
      <path d="M98,27 C115,15 136,18 143,29" stroke="rgba(255,255,255,0.28)" strokeWidth="2"   fill="none" strokeLinecap="round" />
      <path d="M98,27 C115,15 136,18 143,29" stroke="#3d8a1e"              strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
