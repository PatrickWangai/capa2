import { Link } from 'react-router-dom';
import { Twitter, Youtube, Shield } from 'lucide-react';

const ORANGE = '#ff4500';
const BIG = "'Bebas Neue', 'Arial Black', sans-serif";

function Helmet({ size = 120, animated = false }: { size?: number; animated?: boolean }) {
  const h = Math.round(size * 1.2);
  return (
    <svg
      width={size} height={h} viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'helmet-animated' : ''}
    >
      <defs>
        <linearGradient id="hgOrange" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="100%" stopColor="#ff4500" />
        </linearGradient>
        <mask id="hmOrange">
          <rect width="200" height="240" fill="white" />
          <rect x="46" y="84" width="108" height="66" rx="13" fill="black" />
        </mask>
      </defs>
      <path
        d="M100,10 C52,10 16,50 16,98 L16,165 C16,190 36,208 62,210 L138,210 C164,208 184,190 184,165 L184,98 C184,50 148,10 100,10 Z"
        fill="url(#hgOrange)" mask="url(#hmOrange)"
      />
    </svg>
  );
}

function OrangeDot() {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: ORANGE, marginRight: 8, verticalAlign: 'middle' }} />;
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#080808', color: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* ORANGE BORDER FRAME */}
      <div style={{ position: 'fixed', inset: 10, borderRadius: 16, border: `2px solid ${ORANGE}`, pointerEvents: 'none', zIndex: 50 }} />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Helmet size={36} />
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
        <h1 style={{ fontFamily: BIG, fontSize: 'clamp(64px, 12vw, 140px)', lineHeight: 0.9, letterSpacing: '0.03em', textAlign: 'center', color: '#ffffff', marginBottom: 36 }}>
          UNSTOPPABLE<br />MINDS
        </h1>

        {/* Helmet on pedestal */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <Helmet size={130} animated />
          <div style={{ width: 130, height: 12, borderRadius: '50%', background: `radial-gradient(ellipse, ${ORANGE}55 0%, transparent 70%)`, margin: '-4px auto 0' }} />
          <div style={{ width: 100, height: 8, backgroundColor: '#1c1c1c', borderRadius: 3, margin: '3px auto 0' }} />
          <div style={{ width: 150, height: 5, backgroundColor: '#141414', borderRadius: 3, margin: '2px auto 0' }} />
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

        {/* Badge pill */}
        <div style={{ alignSelf: 'center', marginBottom: 48 }}>
          <span style={{ padding: '7px 22px', borderRadius: 999, border: `1px solid ${ORANGE}`, fontSize: 11, letterSpacing: '0.35em', color: ORANGE, fontFamily: BIG }}>
            NEXT LEVEL INVESTING
          </span>
        </div>

        {/* Giant text */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          {/* Ghost behind */}
          <div style={{ fontFamily: BIG, fontSize: 'clamp(56px, 14vw, 170px)', lineHeight: 0.85, color: 'rgba(255,255,255,0.04)', letterSpacing: '0.02em', position: 'absolute', top: 0, left: 0, right: 0, userSelect: 'none', pointerEvents: 'none' }}>
            GROW YOUR<br />WEALTH.
          </div>
          <div style={{ fontFamily: BIG, fontSize: 'clamp(56px, 14vw, 170px)', lineHeight: 0.85, color: '#ffffff', letterSpacing: '0.02em', position: 'relative' }}>
            GROW YOUR<br />WEALTH<span style={{ display: 'inline-block', width: 'clamp(14px,2vw,32px)', height: 'clamp(14px,2vw,32px)', backgroundColor: ORANGE, verticalAlign: 'middle', marginLeft: 10, marginBottom: 8 }} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', margin: '56px 0 28px' }} />

        {/* Info bar */}
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

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ display: 'inline-block', padding: '16px 52px', backgroundColor: ORANGE, color: 'white', textDecoration: 'none', fontFamily: BIG, fontSize: 22, letterSpacing: '0.15em', borderRadius: 6 }}>
            JOIN THE PLATFORM
          </Link>
        </div>
      </section>

      {/* ── SECTION 3: SPLIT STATS ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap' }}>

        {/* Left: big helmet */}
        <div style={{ flex: '1 1 400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 40% 50%, ${ORANGE}18 0%, transparent 60%)`, minHeight: 400 }}>
          <Helmet size={320} animated />
        </div>

        {/* Right: stats */}
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
