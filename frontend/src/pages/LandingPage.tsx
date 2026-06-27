import { Link } from 'react-router-dom';
import { useRef, useState, useCallback } from 'react';
import { Twitter, Youtube, Shield } from 'lucide-react';

const ORANGE = '#ff4500';
const BIG = "'Bebas Neue', 'Arial Black', sans-serif";

/* ── Cartoon orange SVG ── */
function OrangeSVG({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ogBody" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#ffb347" />
          <stop offset="55%"  stopColor="#f5821f" />
          <stop offset="100%" stopColor="#c85f0a" />
        </radialGradient>
        <radialGradient id="ogShine" cx="30%" cy="22%" r="38%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="100" cy="194" rx="52" ry="8" fill="rgba(0,0,0,0.25)" />

      {/* Body */}
      <circle cx="100" cy="108" r="82" fill="url(#ogBody)" />

      {/* Shine layer */}
      <circle cx="100" cy="108" r="82" fill="url(#ogShine)" />

      {/* Specular highlight */}
      <ellipse cx="70" cy="70" rx="28" ry="19" fill="rgba(255,255,255,0.38)" transform="rotate(-35 70 70)" />
      <ellipse cx="62" cy="62" rx="10" ry="7"  fill="rgba(255,255,255,0.55)" transform="rotate(-35 62 62)" />

      {/* Orange texture lines (subtle segments) */}
      {[0,60,120,180,240,300].map(a => (
        <line key={a}
          x1="100" y1="108"
          x2={100 + 82 * Math.cos((a * Math.PI) / 180)}
          y2={108 + 82 * Math.sin((a * Math.PI) / 180)}
          stroke="rgba(180,90,0,0.12)" strokeWidth="1.5"
        />
      ))}

      {/* Navel */}
      <circle cx="100" cy="182" r="9"  fill="#d97010" />
      <circle cx="100" cy="182" r="5"  fill="#b85a08" />
      <path d="M96,179 Q100,175 104,179 Q100,183 96,179Z" fill="#9a4a06" />

      {/* Stem */}
      <path d="M100,30 C98,22 102,14 99,6" stroke="#4a6e00" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Leaf */}
      <path d="M98,27 C114,4 150,7 143,29 C136,50 108,40 98,27Z" fill="#5ab42a" />
      {/* Leaf highlight */}
      <path d="M98,27 C112,10 138,12 143,29" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Leaf vein */}
      <path d="M98,27 C116,16 138,20 143,29" stroke="#3d8a1e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ── Wrapper: float animation + cursor 3D tilt ── */
function TiltOrange({ size = 160 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2))  / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    setTilt({ x: dy * -28, y: dx * 28 });
  }, []);

  const onLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return (
    /* outer: CSS float animation (translateY only, no transform conflict) */
    <div className="orange-float">
      {/* inner: JS tilt via rotateX/Y */}
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          display: 'inline-block',
          cursor: 'grab',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.12s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        <OrangeSVG size={size} />
      </div>
    </div>
  );
}

function OrangeDot() {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: ORANGE, marginRight: 8, verticalAlign: 'middle' }} />;
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#080808', color: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", perspective: 800 }}>

      {/* ORANGE BORDER FRAME */}
      <div style={{ position: 'fixed', inset: 10, borderRadius: 16, border: `2px solid ${ORANGE}`, pointerEvents: 'none', zIndex: 50 }} />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <OrangeSVG size={34} />
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: '0.1em', color: ORANGE }}>CAPA</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontSize: 13, letterSpacing: '0.08em' }}>LOG IN</Link>
          <Link to="/register" style={{ padding: '8px 20px', borderRadius: 6, backgroundColor: ORANGE, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>GET STARTED</Link>
        </div>
      </nav>

      {/* ── SECTION 1: HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 48px 80px', position: 'relative' }}>

        {/* Decorative triangles */}
        <svg style={{ position: 'absolute', top: 130, left: 60, opacity: 0.2 }} width="50" height="50" viewBox="0 0 40 40"><polygon points="20,2 38,38 2,38" fill={ORANGE} /></svg>
        <svg style={{ position: 'absolute', top: 220, right: 80, opacity: 0.15, transform: 'rotate(20deg)' }} width="36" height="36" viewBox="0 0 40 40"><polygon points="20,2 38,38 2,38" fill={ORANGE} /></svg>
        <svg style={{ position: 'absolute', bottom: 160, right: 130, opacity: 0.12 }} width="28" height="28" viewBox="0 0 40 40"><polygon points="20,2 38,38 2,38" fill={ORANGE} /></svg>
        <div style={{ position: 'absolute', bottom: 200, left: 140, width: 14, height: 14, backgroundColor: ORANGE, opacity: 0.5 }} />

        {/* Label */}
        <p style={{ fontFamily: BIG, fontSize: 12, letterSpacing: '0.35em', color: ORANGE, marginBottom: 12 }}>CAPA PLATFORM</p>

        {/* Huge title */}
        <h1 style={{ fontFamily: BIG, fontSize: 'clamp(64px, 12vw, 140px)', lineHeight: 0.9, letterSpacing: '0.03em', textAlign: 'center', color: '#ffffff', marginBottom: 40 }}>
          UNSTOPPABLE<br />MINDS
        </h1>

        {/* Animated orange on pedestal */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <TiltOrange size={170} />
          {/* Pedestal */}
          <div style={{ width: 140, height: 14, borderRadius: '50%', background: `radial-gradient(ellipse, ${ORANGE}55 0%, transparent 70%)`, margin: '-6px auto 0' }} />
          <div style={{ width: 110, height: 8, backgroundColor: '#1c1c1c', borderRadius: 3, margin: '3px auto 0' }} />
          <div style={{ width: 160, height: 5, backgroundColor: '#141414', borderRadius: 3, margin: '2px auto 0' }} />
        </div>

        {/* Side labels */}
        <div style={{ position: 'absolute', left: 80, top: '50%', transform: 'translateY(-20%)' }}>
          <p style={{ fontFamily: BIG, fontSize: 11, letterSpacing: '0.3em', color: ORANGE, marginBottom: 6 }}>RANK 01</p>
          <h3 style={{ fontFamily: BIG, fontSize: 26, letterSpacing: '0.05em', color: '#ffffff', marginBottom: 10 }}>Elite Investing</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 180 }}>Built for the highest level of financial performance.</p>
        </div>
        <div style={{ position: 'absolute', right: 80, top: '50%', transform: 'translateY(-20%)', textAlign: 'right' }}>
          <p style={{ fontFamily: BIG, fontSize: 11, letterSpacing: '0.3em', color: ORANGE, marginBottom: 6 }}>CERTIFIED</p>
          <h3 style={{ fontFamily: BIG, fontSize: 26, letterSpacing: '0.05em', color: '#ffffff', marginBottom: 10 }}>Zero Commission</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: 180 }}>Meets all regulatory standards and compliance requirements.</p>
        </div>

        <p style={{ position: 'absolute', bottom: 36, fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.2)' }}>SCROLL TO EXPLORE</p>
      </section>

      {/* ── SECTION 2: BIG TYPOGRAPHY ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px', position: 'relative' }}>

        <svg style={{ position: 'absolute', top: 100, left: 40, opacity: 0.12 }} width="80" height="80" viewBox="0 0 40 40"><polygon points="20,2 38,38 2,38" fill={ORANGE} /></svg>
        <svg style={{ position: 'absolute', top: 180, right: 60, opacity: 0.1, transform: 'rotate(180deg)' }} width="55" height="55" viewBox="0 0 40 40"><polygon points="20,2 38,38 2,38" fill={ORANGE} /></svg>

        <div style={{ alignSelf: 'center', marginBottom: 48 }}>
          <span style={{ padding: '7px 22px', borderRadius: 999, border: `1px solid ${ORANGE}`, fontSize: 11, letterSpacing: '0.35em', color: ORANGE, fontFamily: BIG }}>
            NEXT LEVEL INVESTING
          </span>
        </div>

        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ fontFamily: BIG, fontSize: 'clamp(56px, 14vw, 170px)', lineHeight: 0.85, color: 'rgba(255,255,255,0.04)', letterSpacing: '0.02em', position: 'absolute', top: 0, left: 0, right: 0, userSelect: 'none', pointerEvents: 'none' }}>
            GROW YOUR<br />WEALTH.
          </div>
          <div style={{ fontFamily: BIG, fontSize: 'clamp(56px, 14vw, 170px)', lineHeight: 0.85, color: '#ffffff', letterSpacing: '0.02em', position: 'relative' }}>
            GROW YOUR<br />WEALTH<span style={{ display: 'inline-block', width: 'clamp(14px,2vw,32px)', height: 'clamp(14px,2vw,32px)', backgroundColor: ORANGE, verticalAlign: 'middle', marginLeft: 10, marginBottom: 8 }} />
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', margin: '56px 0 28px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.3em', color: '#fff', display: 'flex', alignItems: 'center' }}><OrangeDot />GLOBAL MARKETS</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ fontSize: 11, letterSpacing: '0.3em', color: '#fff', display: 'flex', alignItems: 'center' }}><OrangeDot />LIVE PRICES</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ fontSize: 11, letterSpacing: '0.3em', color: '#fff', display: 'flex', alignItems: 'center' }}><OrangeDot />ZERO FEES</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Twitter size={15} color="rgba(255,255,255,0.35)" />
            <Youtube size={15} color="rgba(255,255,255,0.35)" />
            <Shield size={15} color="rgba(255,255,255,0.35)" />
            <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)' }}>SECURE PLATFORM</span>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 28, marginBottom: 56 }} />

        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ display: 'inline-block', padding: '16px 52px', backgroundColor: ORANGE, color: 'white', textDecoration: 'none', fontFamily: BIG, fontSize: 22, letterSpacing: '0.15em', borderRadius: 6 }}>
            JOIN THE PLATFORM
          </Link>
        </div>
      </section>

      {/* ── SECTION 3: SPLIT STATS ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap' }}>

        <div style={{ flex: '1 1 400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 40% 50%, ${ORANGE}18 0%, transparent 60%)`, minHeight: 400 }}>
          <TiltOrange size={340} />
        </div>

        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px 80px 40px' }}>
          <div style={{ alignSelf: 'flex-end', marginBottom: 32 }}>
            <span style={{ padding: '6px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', fontSize: 11, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', fontFamily: BIG }}>PERFORMANCE</span>
          </div>

          <h2 style={{ fontFamily: BIG, fontSize: 'clamp(52px, 8vw, 108px)', lineHeight: 0.88, color: '#ffffff', letterSpacing: '0.02em', marginBottom: 48, textAlign: 'right' }}>
            PERFECT<br />RETURNS
          </h2>

          {[{ value: '50+', label: 'GLOBAL MARKETS' }, { value: '$0', label: 'COMMISSION FEES' }, { value: '24/7', label: 'LIVE SUPPORT' }].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: BIG, fontSize: 50, lineHeight: 1, color: ORANGE }}>{stat.value}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{stat.label}</div>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: ORANGE }} />
              </div>
            </div>
          ))}

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, textAlign: 'right', maxWidth: 320, alignSelf: 'flex-end', marginTop: 12 }}>
            Real-time portfolio tracking with live prices and instant order execution — built for investors who don't settle.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: BIG, fontSize: 11, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.25)' }}>UNSTOPPABLE MINDS</span>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} CAPA. ENGINEERED FOR GREATNESS.</span>
        <Link to="/login" style={{ fontSize: 11, letterSpacing: '0.25em', color: ORANGE, textDecoration: 'none' }}>LOG IN →</Link>
      </footer>
    </div>
  );
}
