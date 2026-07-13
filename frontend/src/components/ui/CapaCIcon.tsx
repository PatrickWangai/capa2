interface Props { size?: number; animate?: boolean; borderRadius?: number; }

export default function CapaCIcon({ size = 44, animate = true, borderRadius = 10 }: Props) {
  const duration = '1.4s';
  const totalLen = 215;
  return (
    <svg
      width={size} height={size} viewBox="0 0 100 100"
      style={{ display: 'block', flexShrink: 0 }}
      aria-label="Capa"
    >
      <rect width="100" height="100" rx={borderRadius * (100 / size)} fill="#082e3c" />
      <path
        d="M 78,28 A 34,34 0 1,0 78,72"
        fill="none" stroke="var(--accent)" strokeWidth="11" strokeLinecap="round"
        {...(animate ? {
          strokeDasharray: `${totalLen}`,
          strokeDashoffset: `${totalLen}`,
        } : {
          strokeDasharray: 'none',
        })}
      >
        {animate && (
          <>
            <animate
              attributeName="stroke-dashoffset"
              values={`${totalLen};0;0;${totalLen}`}
              keyTimes="0;0.55;0.85;1"
              dur={duration} repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1;0 0 1 1;0.4 0 0.6 1"
            />
            <animate
              attributeName="stroke-dasharray"
              values={`0 ${totalLen};${totalLen} 0;${totalLen} 0;0 ${totalLen}`}
              keyTimes="0;0.55;0.85;1"
              dur={duration} repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.2 1;0 0 1 1;0.4 0 0.6 1"
            />
          </>
        )}
      </path>
      {animate && (
        <circle cx="78" cy="28" r="5" fill="var(--accent)">
          <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.1;0.55;0.65" dur={duration} repeatCount="indefinite" />
        </circle>
      )}
      {/* White shine spot on inner upper curve of C */}
      <ellipse cx="34" cy="27" rx="5" ry="3.2" fill="white" opacity="0.55" transform="rotate(-42 34 27)" />
    </svg>
  );
}
