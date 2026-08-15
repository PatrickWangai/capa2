import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import CapaCCircle from '../components/ui/CapaCCircle';
import { useTheme, THEMES, type ThemeName } from '../context/ThemeContext';

/* ── Nav scroll state (only re-renders on threshold cross) ── */
function useNavDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const fn = () => setDark(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return dark;
}

/* ── One-shot IntersectionObserver ── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Canvas background (sky + water, theme-responsive) ── */
function HeroCanvas({ theme }: { theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const elRaw = canvasRef.current; if (!elRaw) return;
    const ctxRaw = elRaw.getContext('2d'); if (!ctxRaw) return;
    const el = elRaw as HTMLCanvasElement;
    const ctx = ctxRaw as CanvasRenderingContext2D;
    let animId: number, t = 0, W = 0, H = 0;
    const bg = (THEMES[theme as ThemeName] ?? THEMES.teal).bg;
    const skyC   = [bg[0], bg[1], bg[2], bg[3], bg[4]];
    const waterC = [bg[4], bg[2], bg[0]];
    function init() {
      const dpr = window.devicePixelRatio || 1;
      W = el.offsetWidth; H = el.offsetHeight;
      el.width = Math.ceil(W * dpr); el.height = Math.ceil(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      t++; ctx.clearRect(0, 0, W, H);

      // Black theme: transparent canvas so body dot-grid shows through
      if (theme === 'black') {
        ctx.save();
        for (let i = 0; i < 22; i++) {
          const sx = ((i * 137.5 + t * 0.22) % W);
          const sy = H * 0.52 + ((i * 79.3) % (H * 0.38));
          const sa = (Math.sin(t * 0.038 + i * 1.9) * 0.5 + 0.5) * 0.10;
          const hw = 14 + (i % 5) * 7;
          const gr = ctx.createLinearGradient(sx - hw, 0, sx + hw, 0);
          gr.addColorStop(0, 'rgba(255,255,255,0)');
          gr.addColorStop(0.5, `rgba(255,255,255,${sa})`);
          gr.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gr; ctx.fillRect(sx - hw, sy - 2, hw * 2, 3);
        }
        ctx.restore();
        animId = requestAnimationFrame(draw);
        return;
      }

      const hy = H * 0.70;
      const sky = ctx.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0, skyC[0]); sky.addColorStop(0.22, skyC[1]);
      sky.addColorStop(0.52, skyC[2]); sky.addColorStop(0.80, skyC[3]);
      sky.addColorStop(1, skyC[4]);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hy);
      const sg = ctx.createRadialGradient(W*0.28, hy*0.78, 0, W*0.28, hy*0.78, W*0.38);
      sg.addColorStop(0, 'rgba(255,218,110,0.28)'); sg.addColorStop(0.45, 'rgba(255,175,55,0.07)'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      const wg = ctx.createLinearGradient(0, hy, 0, H);
      wg.addColorStop(0, waterC[0]); wg.addColorStop(0.5, waterC[1]); wg.addColorStop(1, waterC[2]);
      ctx.fillStyle = wg; ctx.fillRect(0, hy, W, H - hy);
      ctx.save();
      for (let i = 0; i < 38; i++) {
        const sx = ((i * 137.5 + t * 0.35) % W);
        const sy = hy + ((i * 79.3) % ((H - hy) * 0.65));
        const sa = (Math.sin(t * 0.055 + i * 1.9) * 0.5 + 0.5) * 0.28;
        const hw = 10 + (i % 5) * 4;
        const gr = ctx.createLinearGradient(sx - hw, 0, sx + hw, 0);
        gr.addColorStop(0, 'rgba(255,255,230,0)'); gr.addColorStop(0.5, `rgba(255,255,230,${sa})`); gr.addColorStop(1, 'rgba(255,255,230,0)');
        ctx.fillStyle = gr; ctx.fillRect(sx - hw, sy - 2, hw * 2, 4);
      }
      ctx.restore();
      const hg = ctx.createLinearGradient(0, hy - 18, 0, hy + 24);
      hg.addColorStop(0, 'rgba(255,255,255,0.00)'); hg.addColorStop(0.5, 'rgba(255,255,255,0.07)'); hg.addColorStop(1, 'rgba(255,255,255,0.00)');
      ctx.fillStyle = hg; ctx.fillRect(0, hy - 18, W, 42);
      const ov = ctx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0, 'rgba(0,0,0,0.60)'); ov.addColorStop(0.38, 'rgba(0,0,0,0.20)');
      ov.addColorStop(0.65, 'rgba(0,0,0,0.06)'); ov.addColorStop(1, 'rgba(0,0,0,0.52)');
      ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);
      animId = requestAnimationFrame(draw);
    }
    init(); animId = requestAnimationFrame(draw);
    const ro = new ResizeObserver(init); ro.observe(el);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, [theme]);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}

/* ── Scrolling marquee strip ── */
const TICKER_ITEMS = [
  'NSE EQUITIES', 'M-PESA DEPOSITS', 'KES · USD · GBP · EUR',
  '0.5% FLAT FEE', 'CMA REGULATED', 'REAL-TIME DATA',
  'INSTANT EXECUTION', 'BANK-GRADE SECURITY', '15+ MARKETS', 'NO MINIMUM DEPOSIT',
];
function Marquee() {
  // triple so the -33.333% animation is seamless at any viewport
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ height: 44, overflow: 'hidden', display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.36)' }}>
      <div className="lp-marquee-track" style={{ display: 'flex', whiteSpace: 'nowrap', willChange: 'transform' }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.10em', padding: '0 28px' }}>
            {item}
            <span style={{ marginLeft: 28, color: 'rgba(255,255,255,0.15)' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Live Nairobi clock ── */
function NairobiClock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fn = () => setT(new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    fn(); const id = setInterval(fn, 1000); return () => clearInterval(id);
  }, []);
  return <>{t} EAT</>;
}

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(44px)', transition: inView ? `opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}ms` : 'none', ...style }}>
      {children}
    </div>
  );
}

/* ── Content data ── */
const FEATURES = [
  { num: '01', title: 'Live Market Data',    desc: 'Real-time prices across NSE equities and global instruments. Streaming quotes, depth of book, and historical charts — all in one place.' },
  { num: '02', title: 'Instant Execution',   desc: 'Market and limit orders filled in milliseconds. No delays, no slippage surprises. Your timing, your price, every time.' },
  { num: '03', title: 'Capital Protected',   desc: 'Your assets are held by a CMA-regulated custodian, fully segregated from company funds. Bank-grade AES-256 encryption throughout.' },
];
const STEPS = [
  { num: '01', title: 'Create account',  desc: 'Register with your email in under 2 minutes.' },
  { num: '02', title: 'Verify identity', desc: 'Upload ID and selfie. KYC approved same day.' },
  { num: '03', title: 'Fund via M-Pesa', desc: 'Deposit via M-Pesa or bank transfer instantly.' },
  { num: '04', title: 'Start investing', desc: 'Browse markets and place your first trade.' },
];

/* ── Page ── */
export default function LandingPage() {
  const { theme } = useTheme();
  const navDark = useNavDark();

  const { ref: featRef,  inView: featIn  } = useInView(0.08);
  const { ref: stepsRef, inView: stepsIn } = useInView(0.08);
  const { ref: trustRef, inView: trustIn } = useInView(0.15);
  const { ref: ctaRef,   inView: ctaIn   } = useInView(0.15);

  const PAD = 'max(24px, 5.5vw)';

  return (
    <div style={{ color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Global styles ── */}
      <style>{`
        @keyframes lp-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes lp-up      { from { opacity: 0; transform: translateY(48px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lp-fade    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lp-pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.22; } }

        .lp-marquee-track { animation: lp-marquee 38s linear infinite; }

        /* Hero headline lines */
        .lp-hero-h1 { font-size: clamp(54px, 8.8vw, 122px); font-weight: 800; letter-spacing: -0.04em; line-height: 0.92; color: #fff; margin: 0; }
        .lp-h1-l1   { display: block; animation: lp-up 1s cubic-bezier(.16,1,.3,1) .10s both; }
        .lp-h1-l2   { display: block; color: var(--accent); animation: lp-up 1s cubic-bezier(.16,1,.3,1) .22s both; }
        .lp-h1-l3   { display: block; animation: lp-up 1s cubic-bezier(.16,1,.3,1) .34s both; }
        .lp-hero-eyebrow { animation: lp-fade .8s .08s both; }
        .lp-hero-right   { animation: lp-up .95s cubic-bezier(.16,1,.3,1) .42s both; }
        .lp-hero-div     { animation: lp-fade 1s .50s both; }

        /* Buttons */
        .lp-btn { display: inline-flex; align-items: center; gap: 6px; padding: 12px 22px; border-radius: 6px; font-size: 15px; font-weight: 600; letter-spacing: -.01em; text-decoration: none; transition: opacity .18s, transform .18s; }
        .lp-btn-primary { background: var(--accent); color: #fff; }
        .lp-btn-primary:hover { opacity: .84; transform: translateY(-1px); }
        .lp-btn-ghost { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.13); color: rgba(255,255,255,.80); }
        .lp-btn-ghost:hover { background: rgba(255,255,255,.11); border-color: rgba(255,255,255,.22); }

        /* Nav links */
        .lp-nlink { color: rgba(255,255,255,.50); text-decoration: none; font-size: 13px; transition: color .2s; }
        .lp-nlink:hover { color: rgba(255,255,255,.90); }

        /* Feature rows */
        .lp-feat-row { border-top: 1px solid rgba(255,255,255,.08); padding: 36px 0; display: grid; grid-template-columns: 56px 1fr 1.6fr; gap: 0 32px; align-items: start; transition: border-color .3s; cursor: default; }
        .lp-feat-row:hover { border-color: rgba(var(--accent-rgb), .38); }
        .lp-feat-row:hover .lp-feat-n { opacity: 1; }
        .lp-feat-n { font-size: 12px; font-weight: 700; color: var(--accent); letter-spacing: .05em; font-family: monospace; opacity: .52; transition: opacity .3s; padding-top: 3px; }
        .lp-feat-title { font-size: clamp(18px, 2vw, 24px); font-weight: 700; color: #fff; letter-spacing: -.025em; line-height: 1.2; margin: 0; }
        .lp-feat-desc { font-size: 14px; color: rgba(255,255,255,.46); line-height: 1.74; margin: 0; max-width: 440px; }

        /* Steps */
        .lp-step-n { font-size: clamp(46px, 6vw, 80px); font-weight: 200; color: var(--accent); opacity: .20; line-height: 1; letter-spacing: -.04em; display: block; margin-bottom: 14px; transition: opacity .3s; font-variant-numeric: tabular-nums; }
        .lp-step:hover .lp-step-n { opacity: .48; }

        /* Footer links */
        .lp-flink { color: rgba(255,255,255,.34); text-decoration: none; font-size: 12px; transition: color .2s; }
        .lp-flink:hover { color: rgba(255,255,255,.76); }

        /* Responsive */
        @media (max-width: 900px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-hero-div  { display: none !important; }
          .lp-feat-layout { grid-template-columns: 1fr !important; }
          .lp-feat-sticky { position: static !important; margin-bottom: 40px; }
        }
        @media (max-width: 700px) {
          .lp-feat-row   { grid-template-columns: 44px 1fr !important; }
          .lp-feat-desc  { display: none !important; }
          .lp-steps-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-trust-grid { grid-template-columns: 1fr !important; }
          .lp-trust-vr   { border-left: none !important; border-top: 1px solid rgba(255,255,255,.06) !important; padding-left: 0 !important; }
          .lp-cta-grid   { grid-template-columns: 1fr !important; }
          .lp-cta-h2     { font-size: clamp(46px, 12vw, 78px) !important; }
          .lp-ftr-grid   { grid-template-columns: 1fr !important; }
          .lp-ftr-links  { justify-content: flex-start !important; flex-wrap: wrap; }
        }
        @media (max-width: 480px) {
          .lp-steps-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-h1-l1, .lp-h1-l2, .lp-h1-l3, .lp-hero-eyebrow, .lp-hero-right, .lp-hero-div { animation: none !important; opacity: 1 !important; transform: none !important; }
          .lp-marquee-track { animation-play-state: paused !important; }
        }
      `}</style>

      {/* ────────────── NAV ────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${PAD}`, background: navDark ? 'rgba(3,3,7,0.92)' : 'transparent', backdropFilter: navDark ? 'blur(22px)' : 'none', WebkitBackdropFilter: navDark ? 'blur(22px)' : 'none', borderBottom: navDark ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'background .4s, backdrop-filter .4s, border-color .4s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CapaCCircle size={30} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30d158', flexShrink: 0, animation: 'lp-pulse 2.2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.27)', letterSpacing: '0.10em' }}>NSE LIVE</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link to="/about"   className="lp-nlink">About</Link>
          <Link to="/contact" className="lp-nlink">Contact</Link>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login"    className="lp-nlink">Log In</Link>
          <Link to="/register" className="lp-btn lp-btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>Get Started</Link>
        </div>
      </nav>

      {/* ────────────── HERO ────────────── */}
      <section style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <HeroCanvas theme={theme} />
        {/* directional overlay — heavier left so left-column text reads clearly */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.68) 0%, rgba(0,0,0,.20) 55%, rgba(0,0,0,.06) 100%)', zIndex: 1 }} />
        {/* bottom fade into page background */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to top, var(--bg-1) 0%, transparent 100%)', zIndex: 2 }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: `80px ${PAD} 56px` }}>
          <div className="lp-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1px 0.88fr', gap: '0 56px', alignItems: 'center' }}>

            {/* Left — headline */}
            <div>
              <p className="lp-hero-eyebrow" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 20, height: 1, background: 'var(--accent)', opacity: 0.7 }} />
                Capa Investment Platform
              </p>
              <h1 className="lp-hero-h1">
                <span className="lp-h1-l1">Your gateway</span>
                <span className="lp-h1-l2">to Kenya's</span>
                <span className="lp-h1-l3">markets.</span>
              </h1>
            </div>

            {/* Vertical rule */}
            <div className="lp-hero-div" style={{ background: 'rgba(255,255,255,0.11)', alignSelf: 'stretch', minHeight: 180 }} />

            {/* Right — description + CTA */}
            <div className="lp-hero-right">
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.56)', lineHeight: 1.70, marginBottom: 32, maxWidth: 380 }}>
                We make global investing accessible to every Kenyan. Real-time NSE data, instant execution, M-Pesa deposits — open your account in under 10 minutes.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                <Link to="/register" className="lp-btn lp-btn-primary">Open Account <ChevronRight size={15} /></Link>
                <Link to="/login"    className="lp-btn lp-btn-ghost">Sign In</Link>
              </div>
              <div style={{ display: 'flex', gap: 28 }}>
                {[['15+', 'Markets'], ['0.5%', 'Flat fee'], ['CMA', 'Regulated']].map(([v, l]) => (
                  <div key={l}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{v}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.34)', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.09em', fontFamily: 'monospace' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Hero bottom strip */}
        <div style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `12px ${PAD}` }}>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.26)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>No minimum deposit</p>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.26)', letterSpacing: '0.05em', margin: 0 }}>Scroll ↓</p>
        </div>
      </section>

      {/* ────────────── MARQUEE ────────────── */}
      <Marquee />

      {/* ────────────── FEATURES ────────────── */}
      <section style={{ padding: `120px ${PAD}` }}>
        <div className="lp-feat-layout" style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '0 80px', alignItems: 'start' }}>

          {/* Sticky label */}
          <Reveal>
            <div className="lp-feat-sticky" style={{ position: 'sticky', top: 76 }}>
              <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 18 }}>What we offer</p>
              <h2 style={{ fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', lineHeight: 1.05, margin: 0 }}>
                Built for<br />performance.
              </h2>
            </div>
          </Reveal>

          {/* Feature rows */}
          <div ref={featRef}>
            {FEATURES.map((f, i) => (
              <div key={f.num} className="lp-feat-row" style={{ opacity: featIn ? 1 : 0, transform: featIn ? 'translateY(0)' : 'translateY(36px)', transition: featIn ? `opacity .75s cubic-bezier(.16,1,.3,1) ${i * 110}ms, transform .75s cubic-bezier(.16,1,.3,1) ${i * 110}ms` : 'none' }}>
                <span className="lp-feat-n">{f.num}</span>
                <p className="lp-feat-title">{f.title}</p>
                <p className="lp-feat-desc">{f.desc}</p>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </div>
      </section>

      {/* ────────────── HOW IT WORKS ────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.22)', padding: `100px ${PAD}` }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <Reveal style={{ marginBottom: 64 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 54px)', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', lineHeight: 1.05, margin: 0 }}>
              Up and running<br />in minutes.
            </h2>
          </Reveal>

          <div ref={stepsRef} className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0 40px' }}>
            {STEPS.map((s, i) => (
              <div key={s.num} className="lp-step" style={{ borderTop: '1px solid rgba(255,255,255,0.10)', paddingTop: 24, opacity: stepsIn ? 1 : 0, transform: stepsIn ? 'translateY(0)' : 'translateY(32px)', transition: stepsIn ? `opacity .75s cubic-bezier(.16,1,.3,1) ${i * 85}ms, transform .75s cubic-bezier(.16,1,.3,1) ${i * 85}ms` : 'none' }}>
                <span className="lp-step-n">{s.num}</span>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>{s.title}</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.44)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── TRUST ────────────── */}
      <section style={{ padding: `80px 0` }}>
        <div ref={trustRef} className="lp-trust-grid" style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: `0 ${PAD}` }}>
          {[
            { label: 'CMA Regulated',       desc: 'Licensed by the Capital Markets Authority of Kenya. Your investments are protected by law.' },
            { label: 'Bank-Grade Security', desc: 'AES-256 encryption, MFA, and assets fully segregated from company funds at a regulated custodian.' },
            { label: 'No Hidden Fees',      desc: 'One transparent 0.5% trade fee. No inactivity, withdrawal, or maintenance charges — ever.' },
          ].map(({ label, desc }, i) => (
            <div key={label} className={i > 0 ? 'lp-trust-vr' : ''} style={{ paddingTop: 44, paddingBottom: 44, paddingLeft: i > 0 ? 'max(28px, 3.5vw)' : 0, paddingRight: 'max(28px, 3.5vw)', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none', opacity: trustIn ? 1 : 0, transform: trustIn ? 'translateY(0)' : 'translateY(28px)', transition: trustIn ? `opacity .75s cubic-bezier(.16,1,.3,1) ${i * 100}ms, transform .75s cubic-bezier(.16,1,.3,1) ${i * 100}ms` : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginBottom: 20 }} />
              <p style={{ fontSize: 'clamp(17px, 1.8vw, 21px)', fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.02em' }}>{label}</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.44)', lineHeight: 1.74, margin: 0, maxWidth: 260 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────── CTA PANEL ────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: `120px ${PAD} 100px`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '42%', left: '22%', transform: 'translate(-50%,-50%)', width: 900, height: 420, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(var(--accent-rgb), .055) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div ref={ctaRef} className="lp-cta-grid" style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0 80px', alignItems: 'end' }}>
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 28, opacity: ctaIn ? 1 : 0, transition: 'opacity .6s .05s' }}>
              Ready to invest?
            </p>
            <h2 className="lp-cta-h2" style={{ fontSize: 'clamp(50px, 8vw, 112px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.92, color: '#fff', margin: '0 0 40px', opacity: ctaIn ? 1 : 0, transform: ctaIn ? 'translateY(0)' : 'translateY(44px)', transition: 'opacity .9s cubic-bezier(.16,1,.3,1) .10s, transform .9s cubic-bezier(.16,1,.3,1) .10s' }}>
              Open your<br /><span style={{ color: 'var(--accent)' }}>account.</span>
            </h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', opacity: ctaIn ? 1 : 0, transform: ctaIn ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity .8s cubic-bezier(.16,1,.3,1) .28s, transform .8s cubic-bezier(.16,1,.3,1) .28s' }}>
              <Link to="/register" className="lp-btn lp-btn-primary" style={{ fontSize: 17, padding: '14px 30px' }}>Start for free <ChevronRight size={17} /></Link>
              <Link to="/login"    className="lp-btn lp-btn-ghost"   style={{ fontSize: 17, padding: '14px 24px' }}>Sign In</Link>
            </div>
          </div>

          <div style={{ opacity: ctaIn ? 1 : 0, transition: 'opacity .8s .42s', textAlign: 'right', paddingBottom: 4 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.24)', marginBottom: 5 }}>No minimum deposit</p>
            <p style={{ fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.24)', margin: 0 }}>Account in under 10 min</p>
          </div>
        </div>
      </section>

      {/* ────────────── FOOTER ────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: `0 ${PAD}` }}>
          {/* Links row */}
          <div className="lp-ftr-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0 32px', alignItems: 'center', padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <CapaCCircle size={26} />
            <div className="lp-ftr-links" style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
              {[['About','/about'],['Contact','/contact'],['Terms','/terms'],['Privacy','/privacy'],['Security','/security'],['FAQ','/faq']].map(([l,h]) => (
                <Link key={l} to={h} className="lp-flink">{l}</Link>
              ))}
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.26)', margin: 0 }}>CMA Regulated</p>
          </div>
          {/* Status bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.20)', margin: 0 }}>© {new Date().getFullYear()} Capa Investments Ltd.</p>
            <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.20)', margin: 0, fontVariantNumeric: 'tabular-nums' }}><NairobiClock /></p>
          </div>
        </div>
      </footer>

    </div>
  );
}
