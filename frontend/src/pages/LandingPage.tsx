import { Link } from 'react-router-dom';
import { Twitter, Youtube, Shield } from 'lucide-react';

const GRAD = 'linear-gradient(135deg,#7117ea,#ea6060)';
const ACCENT = '#7117ea';
const BIG = "'Bebas Neue', 'Arial Black', sans-serif";

function Helmet({ size = 200 }: { size?: number }) {
  const h = Math.round(size * 1.2);
  return (
    <svg width={size} height={h} viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#7117ea" />
          <stop offset="100%" stopColor="#ea6060" />
        </linearGradient>
        <mask id="hm1">
          <rect width="200" height="240" fill="white" />
          <rect x="46" y="84" width="108" height="66" rx="13" fill="black" />
        </mask>
      </defs>
      <path
        d="M100,10 C52,10 16,50 16,98 L16,165 C16,190 36,208 62,210 L138,210 C164,208 184,190 184,165 L184,98 C184,50 148,10 100,10 Z"
        fill="url(#hg1)" mask="url(#hm1)"
      />
    </svg>
  );
}

function GradientDot() {
  return (
    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: GRAD, marginRight: 8, verticalAlign: 'middle' }} />
  );
}

function Triangle({ size = 40, opacity = 0.25 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ opacity }}>
      <polygon points="20,2 38,38 2,38" fill="#7117ea" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#080808', color: 'white', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* GRADIENT BORDER FRAME */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, padding: 10 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 16, border: '2px solid transparent', backgroundImage: `linear-gradient(#080808,#080808), ${GRAD}`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }} />
      </div>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 18, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Helmet size={32} />
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: '0.1em', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CAPA</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13, fontWeight: 500, letterSpacing: '0.05em' }}>
            LOG IN
          </Link>
          <Link to="/register" style={{ padding: '8px 20px', borderRadius: 6, background: GRAD, color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* ── SECTION 1: HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 48px', overflow: 'hidden' }}>

        {/* Decorative triangles */}
        <div style={{ position: 'absolute', top: 120, left: 60, transform: 'rotate(-20deg)' }}><Triangle size={50} opacity={0.2} /></div>
        <div style={{ position: 'absolute', top: 200, right: 80, transform: 'rotate(15deg)' }}><Triangle size={35} opacity={0.15} /></div>
        <div style={{ position: 'absolute', bottom: 140, left: 120, transform: 'rotate(30deg)' }}><Triangle size={28} opacity={0.12} /></div>
        <div style={{ position: 'absolute', bottom: 180, right: 140 }}><div style={{ width: 14, height: 14, background: GRAD, opacity: 0.5 }} /></div>

        {/* Label */}
        <p style={{ fontFamily: BIG, fontSize: 13, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>CAPA PLATFORM</p>

        {/* Big title */}
        <h1 style={{ fontFamily: BIG, fontSize: 'clamp(72px, 14vw, 160px)', lineHeight: 0.9, letterSpacing: '0.02em', textAlign: 'center', marginBottom: 32 }}>
          UNSTOPPABLE<br />MINDS
        </h1>

        {/* Helmet on pedestal */}
        <div style={{ position: 'relative', marginBottom: 40 }}>
          <Helmet size={180} />
          {/* Pedestal */}
          <div style={{ width: 160, height: 18, background: 'radial-gradient(ellipse, rgba(113,23,234,0.5) 0%, transparent 70%)', margin: '-8px auto 0', borderRadius: '50%' }} />
          <div style={{ width: 120, height: 10, background: '#1a1a1a', borderRadius: 4, margin: '4px auto 0' }} />
          <div style={{ width: 180, height: 6, background: '#111', borderRadius: 4, margin: '2px auto 0' }} />
        </div>

        {/* Side labels */}
        <div style={{ position: 'absolute', left: 80, top: '50%', transform: 'translateY(-10%)' }}>
          <p style={{ fontFamily: BIG, fontSize: 12, letterSpacing: '0.3em', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>RANK 01</p>
          <h3 style={{ fontFamily: BIG, fontSize: 28, letterSpacing: '0.05em', marginBottom: 10 }}>Elite Investing</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 200 }}>Built for the highest level of financial performance.</p>
        </div>
        <div style={{ position: 'absolute', right: 80, top: '50%', transform: 'translateY(-10%)', textAlign: 'right' }}>
          <p style={{ fontFamily: BIG, fontSize: 12, letterSpacing: '0.3em', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6 }}>CERTIFIED</p>
          <h3 style={{ fontFamily: BIG, fontSize: 28, letterSpacing: '0.05em', marginBottom: 10 }}>Zero Commission</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, maxWidth: 200 }}>Meets all regulatory standards and compliance requirements.</p>
        </div>

        {/* Scroll hint */}
        <p style={{ position: 'absolute', bottom: 32, fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)' }}>SCROLL TO EXPLORE</p>
      </section>

      {/* ── SECTION 2: TYPOGRAPHY + INFO BAR ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative triangles */}
        <div style={{ position: 'absolute', top: 100, left: 40, opacity: 0.15 }}><Triangle size={80} /></div>
        <div style={{ position: 'absolute', top: 160, right: 60, transform: 'rotate(180deg)', opacity: 0.1 }}><Triangle size={55} /></div>
        <div style={{ position: 'absolute', bottom: 200, right: 100, opacity: 0.12 }}><Triangle size={40} /></div>

        {/* Badge */}
        <div style={{ display: 'inline-block', marginBottom: 40, alignSelf: 'center' }}>
          <span style={{ padding: '6px 20px', borderRadius: 999, border: `1px solid ${ACCENT}`, fontSize: 11, letterSpacing: '0.35em', color: ACCENT, fontFamily: BIG }}>
            NEXT LEVEL INVESTING
          </span>
        </div>

        {/* Massive text */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <h2 style={{ fontFamily: BIG, fontSize: 'clamp(60px, 15vw, 180px)', lineHeight: 0.85, letterSpacing: '0.02em', color: 'rgba(255,255,255,0.06)', position: 'absolute', top: 0, left: 0, right: 0, userSelect: 'none' }}>
            GROW YOUR<br />WEALTH.
          </h2>
          <h2 style={{ fontFamily: BIG, fontSize: 'clamp(60px, 15vw, 180px)', lineHeight: 0.85, letterSpacing: '0.02em', position: 'relative' }}>
            GROW YOUR<br />WEALTH<span style={{ display: 'inline-block', width: 'clamp(18px, 2.5vw, 36px)', height: 'clamp(18px, 2.5vw, 36px)', background: GRAD, verticalAlign: 'middle', marginLeft: 8, marginBottom: 8 }} />
          </h2>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '48px 0 24px' }} />

        {/* Info bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.3em', display: 'flex', alignItems: 'center' }}><GradientDot />GLOBAL MARKETS</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ fontSize: 11, letterSpacing: '0.3em', display: 'flex', alignItems: 'center' }}><GradientDot />LIVE PRICES</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ fontSize: 11, letterSpacing: '0.3em', display: 'flex', alignItems: 'center' }}><GradientDot />ZERO FEES</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Twitter size={16} color="rgba(255,255,255,0.4)" />
            <Youtube size={16} color="rgba(255,255,255,0.4)" />
            <Shield size={16} color="rgba(255,255,255,0.4)" />
            <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>SECURE PLATFORM</span>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginTop: 24, marginBottom: 48 }} />

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ display: 'inline-block', padding: '16px 48px', background: GRAD, color: 'white', textDecoration: 'none', fontFamily: BIG, fontSize: 20, letterSpacing: '0.15em', borderRadius: 6 }}>
            JOIN THE PLATFORM
          </Link>
        </div>
      </section>

      {/* ── SECTION 3: SPLIT STATS ── */}
      <section style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>

        {/* Left — big helmet */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'radial-gradient(ellipse at 30% 50%, rgba(113,23,234,0.12) 0%, transparent 60%)' }}>
          <Helmet size={380} />
        </div>

        {/* Right — text & stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 64px 80px 40px', position: 'relative' }}>

          {/* Badge */}
          <div style={{ alignSelf: 'flex-end', marginBottom: 32 }}>
            <span style={{ padding: '6px 18px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', fontFamily: BIG }}>
              PERFORMANCE
            </span>
          </div>

          {/* Big heading */}
          <h2 style={{ fontFamily: BIG, fontSize: 'clamp(52px, 8vw, 110px)', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 48, textAlign: 'right' }}>
            PERFECT<br />RETURNS
          </h2>

          {/* Stats */}
          {[
            { value: '50+', label: 'GLOBAL MARKETS' },
            { value: '$0', label: 'COMMISSION FEES' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: BIG, fontSize: 52, letterSpacing: '0.02em', lineHeight: 1, background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
                <div style={{ fontSize: 10, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{stat.label}</div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: GRAD }} />
              </div>
            </div>
          ))}

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, textAlign: 'right', maxWidth: 340, alignSelf: 'flex-end', marginTop: 16 }}>
            Real-time portfolio tracking with live prices and instant order execution — built for investors who don't settle for average.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: BIG, fontSize: 11, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.25)' }}>UNSTOPPABLE MINDS</span>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} CAPA. ENGINEERED FOR GREATNESS.</span>
        <Link to="/login" style={{ fontSize: 11, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>LOG IN →</Link>
      </footer>
    </div>
  );
}
