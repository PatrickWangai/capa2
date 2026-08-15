import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import CapaCCircle from '../components/ui/CapaCCircle';
import { useTheme } from '../context/ThemeContext';

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCounter(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

// ─── Particle Network Canvas ─────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number, W = 0, H = 0;

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const N = window.innerWidth < 768 ? 38 : 68;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00016,
      vy: (Math.random() - 0.5) * 0.00016,
      r: 0.7 + Math.random() * 1.3,
      a: 0.18 + Math.random() * 0.42,
      accent: Math.random() < 0.14,
    }));

    const getAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#20d4b8';

    const MAX_F = window.innerWidth < 768 ? 0.13 : 0.16;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const accent = getAccent();
      const MAX = MAX_F * W;

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = (pts[i].x - pts[j].x) * W;
          const dy = (pts[i].y - pts[j].y) * H;
          const d  = Math.hypot(dx, dy);
          if (d < MAX) {
            ctx.save();
            ctx.globalAlpha = (1 - d / MAX) * 0.11;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x * W, pts[i].y * H);
            ctx.lineTo(pts[j].x * W, pts[j].y * H);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02)  p.x = -0.02;
        if (p.y < -0.02) p.y = 1.02;
        if (p.y > 1.02)  p.y = -0.02;
        ctx.save();
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.accent ? accent : '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };

    setup();
    window.addEventListener('resize', setup);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', setup); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ─── Sparkline SVG ───────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const W = 72, H = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H * 0.8 - H * 0.1}`
  ).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    </svg>
  );
}

// ─── Stock Card ───────────────────────────────────────────────────────────────
type StockDef = {
  symbol: string; name: string; price: string;
  change: string; positive: boolean; exchange: string;
  spark: number[]; delay?: number;
};
function StockCard({ symbol, name, price, change, positive, exchange, spark, delay = 0 }: StockDef) {
  const { ref, inView } = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '36px 32px',
        background: hov ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms, background .2s, border-color .2s`,
      }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 140,
        background: 'radial-gradient(ellipse at top right,rgba(var(--accent-rgb),.06) 0%,transparent 70%)',
        pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', margin: '0 0 6px' }}>{exchange}</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.025em', margin: 0 }}>{symbol}</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
          color: positive ? '#22c55e' : '#ef4444',
          background: positive ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)',
          padding: '3px 8px', borderRadius: 2 }}>{positive ? '+' : ''}{change}</span>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.36)', margin: '0 0 20px' }}>{name}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{price}</p>
        <Sparkline data={spark} positive={positive} />
      </div>
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ num, title, body, index }: { num: string; title: string; body: string; index: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{
      borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px 32px 40px 0',
      borderLeft: index > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
      paddingLeft: index > 0 ? 32 : 0,
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity .6s ease ${index * 90}ms, transform .6s ease ${index * 90}ms`,
    }}>
      <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.22)', margin: '0 0 20px' }}>{num}</p>
      <p style={{ fontSize: 'clamp(17px,1.8vw,23px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', margin: '0 0 12px', lineHeight: 1.2 }}>{title}</p>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', lineHeight: 1.68, margin: 0 }}>{body}</p>
    </div>
  );
}

// ─── Animated stat ────────────────────────────────────────────────────────────
function Stat({ to, suffix = '', prefix = '', label, active }: {
  to: number; suffix?: string; prefix?: string; label: string; active: boolean;
}) {
  const val = useCounter(to, active);
  return (
    <div>
      <p style={{ fontSize: 'clamp(48px,5.5vw,80px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', margin: '0 0 8px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        <span style={{ color: 'var(--accent)' }}>{prefix}</span>{val}<span style={{ color: 'var(--accent)' }}>{suffix}</span>
      </p>
      <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', margin: 0 }}>{label}</p>
    </div>
  );
}

// ─── Live clock ───────────────────────────────────────────────────────────────
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fn = () => setT(new Date().toLocaleTimeString('en-KE', {
      timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }));
    fn(); const id = setInterval(fn, 1000); return () => clearInterval(id);
  }, []);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>[ {t} EAT ]</span>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STOCKS: StockDef[] = [
  { symbol: 'SCOM', name: 'Safaricom PLC',           price: 'KES 16.45', change: '2.34%',  positive: true,  exchange: 'NSE', spark: [14.2,14.8,14.5,15.1,15.8,15.3,16.1,16.4,16.0,16.45], delay: 0   },
  { symbol: 'KCB',  name: 'KCB Group PLC',           price: 'KES 48.90', change: '3.45%',  positive: true,  exchange: 'NSE', spark: [45.1,45.8,46.3,46.9,47.2,47.8,48.1,48.5,48.7,48.9],  delay: 80  },
  { symbol: 'EQTY', name: 'Equity Group Holdings',   price: 'KES 52.25', change: '1.12%',  positive: false, exchange: 'NSE', spark: [53.5,53.1,52.8,52.9,53.2,52.7,52.4,52.5,52.3,52.25], delay: 160 },
  { symbol: 'EABL', name: 'East African Breweries',  price: 'KES 168.00',change: '0.89%',  positive: true,  exchange: 'NSE', spark: [165.2,165.8,166.1,166.5,166.8,167.0,167.4,167.6,167.8,168.0], delay: 240 },
];

const TICKER_ITEMS = [
  'SCOM · KES 16.45 · +2.34%', 'KCB · KES 48.90 · +3.45%', 'EQTY · KES 52.25 · −1.12%',
  'EABL · KES 168.00 · +0.89%', 'ABSA · KES 14.85 · +1.23%', 'NCBA · KES 34.20 · −0.56%',
  'DTB · KES 88.50 · +2.10%', 'BAMB · KES 52.75 · +0.44%', 'COOP · KES 15.30 · +1.05%',
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme } = useTheme(); void theme;
  const [scrolled, setScrolled]     = useState(false);
  const statsSection                = useInView(0.18);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const PAD = 'max(24px,6vw)';
  const BORDER = '1px solid rgba(255,255,255,0.07)';
  const LABEL: React.CSSProperties = {
    fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.30)', margin: '0 0 20px',
  };
  const H2: React.CSSProperties = {
    fontSize: 'clamp(48px,7vw,104px)', fontWeight: 900, letterSpacing: '-0.04em',
    lineHeight: 0.92, color: '#fff', textTransform: 'uppercase', margin: 0,
  };
  const BODY: React.CSSProperties = {
    fontSize: 'clamp(14px,1.5vw,18px)', color: 'rgba(255,255,255,0.46)', lineHeight: 1.7,
  };

  return (
    <div style={{ background: '#080808', color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Global styles ──────────────────────────────────────────────────── */}
      <style>{`
        /* Reveal animations */
        @keyframes heroLine {
          from { opacity:0; transform:translateY(56px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes ticker {
          from { transform:translateX(0);   }
          to   { transform:translateX(-50%);}
        }
        @keyframes pulse {
          0%,100% { opacity:1;   }
          50%      { opacity:0.3; }
        }
        @keyframes canvasFade {
          from { opacity:0; }
          to   { opacity:1; }
        }

        /* Hero typography */
        .capa-hero-word {
          display: block;
          font-size: clamp(68px,11vw,160px);
          font-weight: 900;
          letter-spacing: -0.045em;
          line-height: 0.88;
          color: #fff;
          text-transform: uppercase;
          will-change: transform, opacity;
          animation: heroLine .9s cubic-bezier(0.16,1,0.3,1) both;
        }
        .capa-hero-word-1 { animation-delay:.08s; }
        .capa-hero-word-2 { animation-delay:.22s; }
        .capa-hero-word-3 { animation-delay:.36s; }

        /* Canvas fade-in */
        .capa-particle { animation: canvasFade 1.2s ease .1s both; }

        /* Navigation */
        .capa-nav {
          position:fixed; top:0; left:0; right:0; z-index:200;
          height:60px;
          display:flex; align-items:center; justify-content:space-between;
          padding: 0 max(24px,6vw);
          transition: background .4s ease, backdrop-filter .4s ease, border-color .4s ease;
        }
        .capa-nav.scrolled {
          background: rgba(8,8,8,0.94);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .capa-nav-link {
          font-size:13px; font-weight:500;
          color:rgba(255,255,255,0.55); text-decoration:none;
          letter-spacing:.02em;
          transition: color .2s ease;
        }
        .capa-nav-link:hover { color:#fff; }

        /* Buttons */
        .capa-btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--accent); color:#000;
          padding:13px 24px; border-radius:3px;
          font-size:12px; font-weight:700; letter-spacing:.09em; text-transform:uppercase;
          text-decoration:none; white-space:nowrap;
          transition: opacity .2s, transform .2s;
        }
        .capa-btn-primary:hover { opacity:.85; transform:translateY(-1px); }
        .capa-btn-secondary {
          display:inline-flex; align-items:center; gap:8px;
          color:rgba(255,255,255,0.62);
          padding:13px 22px; border-radius:3px;
          border: 1px solid rgba(255,255,255,0.15);
          font-size:12px; font-weight:600; letter-spacing:.09em; text-transform:uppercase;
          text-decoration:none; white-space:nowrap;
          transition: color .2s, border-color .2s, transform .2s;
        }
        .capa-btn-secondary:hover { color:#fff; border-color:rgba(255,255,255,0.40); transform:translateY(-1px); }

        /* Section */
        .capa-section {
          padding: clamp(80px,10vh,140px) max(24px,6vw);
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* Pillar cards */
        .capa-pillar { padding:36px 0; border-top:1px solid rgba(255,255,255,0.07); }
        .capa-pillar:hover .capa-pillar-num { color:var(--accent); }
        .capa-pillar-num {
          font-family:monospace; font-size:11px; letter-spacing:.10em;
          color:rgba(255,255,255,0.22); text-transform:uppercase;
          transition:color .3s ease;
        }

        /* Responsive */
        @media (max-width:900px) {
          .r-hide-nav { display:none !important; }
          .r-hero-cols { grid-template-columns:1fr !important; }
          .r-2col       { grid-template-columns:1fr !important; }
          .r-4col       { grid-template-columns:1fr 1fr !important; }
          .r-3col       { grid-template-columns:1fr !important; }
          .r-cta        { grid-template-columns:1fr !important; }
          .r-cta > div:last-child { text-align:left !important; align-items:flex-start !important; }
        }
        @media (max-width:560px) {
          .r-4col { grid-template-columns:1fr !important; }
          .r-steps { grid-template-columns:1fr 1fr !important; }
        }
        @media (prefers-reduced-motion:reduce) {
          .capa-hero-word,.capa-particle { animation:none !important; opacity:1 !important; transform:none !important; }
          .capa-btn-primary:hover,.capa-btn-secondary:hover { transform:none !important; }
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className={`capa-nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <CapaCCircle size={26} />
          <span style={{ fontFamily:'"Orbitron",sans-serif', fontSize:14, fontWeight:700, letterSpacing:'0.18em', color:'#fff' }}>CAPA</span>
        </Link>

        <div className="r-hide-nav" style={{ display:'flex', gap:32, alignItems:'center' }}>
          <Link to="/markets"   className="capa-nav-link">Markets</Link>
          <Link to="/register"  className="capa-nav-link">Invest</Link>
          <Link to="/dashboard" className="capa-nav-link">Portfolio</Link>
          <Link to="/faq"       className="capa-nav-link">Learn</Link>
        </div>

        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <Link to="/login"    className="capa-nav-link" style={{ marginRight:4 }}>Log in</Link>
          <Link to="/register" className="capa-btn-primary" style={{ padding:'9px 18px', fontSize:12 }}>Get Started →</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ height:'100dvh', minHeight:580, position:'relative', overflow:'hidden', background:'#080808', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>

        {/* Particle network */}
        <div className="capa-particle" style={{ position:'absolute', inset:0 }}>
          <ParticleCanvas />
        </div>

        {/* Atmospheric glow */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 75% 55% at 28% 58%, rgba(var(--accent-rgb),.055) 0%, transparent 68%)', pointerEvents:'none' }} />
        {/* Bottom legibility gradient */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,8,8,.97) 0%, rgba(8,8,8,.55) 25%, transparent 52%)', pointerEvents:'none' }} />

        {/* Hero text */}
        <div style={{ position:'relative', zIndex:10, padding:`0 ${PAD}` }}>
          <p style={{ ...LABEL, animation:'fadeUp .7s cubic-bezier(0.16,1,0.3,1) 0s both' }}>
            [ WE ARE CAPA ]
          </p>

          {/* Line-by-line reveal — each wrapped in overflow:hidden so translateY is masked */}
          <h1 style={{ margin:'0 0 clamp(24px,4vh,48px)' }}>
            <div style={{ overflow:'hidden' }}><span className="capa-hero-word capa-hero-word-1">INVEST</span></div>
            <div style={{ overflow:'hidden' }}><span className="capa-hero-word capa-hero-word-2">WITHOUT</span></div>
            <div style={{ overflow:'hidden' }}>
              <span className="capa-hero-word capa-hero-word-3">BORDERS<span style={{ color:'var(--accent)' }}>.</span></span>
            </div>
          </h1>

          {/* CTA row */}
          <div className="r-hero-cols" style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'0 60px', alignItems:'flex-end', paddingBottom:'clamp(24px,4vh,52px)', animation:'fadeUp .8s cubic-bezier(0.16,1,0.3,1) .55s both' }}>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <Link to="/register" className="capa-btn-primary">START INVESTING →</Link>
              <Link to="/markets"  className="capa-btn-secondary">EXPLORE MARKETS</Link>
            </div>
            <p style={{ ...BODY, margin:0, fontSize:'clamp(13px,1.4vw,16px)' }}>
              NSE equities. Real-time data. M-Pesa deposits. CMA-regulated platform built for ambitious Kenyans.
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div style={{ position:'relative', zIndex:10, borderTop:BORDER, display:'flex', alignItems:'stretch', fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.28)', letterSpacing:'0.08em', textTransform:'uppercase', overflowX:'auto' }}>
          {([
            [<><span style={{ color:'var(--accent)', marginRight:6, animation:'pulse 2s ease-in-out infinite' }}>●</span>NSE LIVE</>, true] as [React.ReactNode, boolean],
            ['64+ STOCKS', true],
            [<Clock key="c" />, true],
            ['NAIROBI BASED', true],
            ['CMA REGULATED', false],
          ] as [React.ReactNode, boolean][]).map(([item, border], i) => (
            <span key={i} style={{ display:'flex', alignItems:'center', padding:'0 22px', lineHeight:'44px', flexShrink:0, borderRight:border ? BORDER : 'none' }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── MARKET TICKER ────────────────────────────────────────────────────── */}
      <div style={{ background:'#0c0c0c', borderTop:BORDER, borderBottom:BORDER, overflow:'hidden', padding:'11px 0' }}>
        <div style={{ display:'flex', animation:'ticker 32s linear infinite', width:'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} style={{
              fontFamily:'monospace', fontSize:11, letterSpacing:'0.10em',
              color: t.includes('−') ? '#ef4444' : 'rgba(255,255,255,0.42)',
              whiteSpace:'nowrap', padding:'0 36px',
              borderRight:'1px solid rgba(255,255,255,0.05)',
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED MARKETS ─────────────────────────────────────────────────── */}
      <section className="capa-section">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:52, flexWrap:'wrap', gap:24 }}>
          <div>
            <p style={LABEL}>[ FEATURED MARKETS ]</p>
            <h2 style={H2}>THE WORLD IS<br />YOUR MARKET.</h2>
          </div>
          <Link to="/register" style={{ fontFamily:'monospace', fontSize:12, letterSpacing:'0.12em', color:'var(--accent)', textDecoration:'none', textTransform:'uppercase' }}>
            VIEW ALL MARKETS →
          </Link>
        </div>
        <div className="r-4col" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'rgba(255,255,255,0.04)' }}>
          {STOCKS.map(s => <StockCard key={s.symbol} {...s} />)}
        </div>
      </section>

      {/* ── PLATFORM ─────────────────────────────────────────────────────────── */}
      <section className="capa-section" style={{ background:'#0d0d0d' }}>
        <div className="r-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 80px', alignItems:'flex-start', marginBottom:64 }}>
          <div>
            <p style={LABEL}>[ WHAT WE DO ]</p>
            <h2 style={H2}>TRADE.<br />RESEARCH.<br /><span style={{ color:'var(--accent)' }}>GROW.</span></h2>
          </div>
          <div style={{ paddingTop:8 }}>
            <p style={{ ...BODY, marginBottom:32 }}>
              We built Capa for Kenyan investors who demand more — real access to the Nairobi Securities Exchange without the friction. No middlemen. No hidden costs. No minimum deposit.
            </p>
            <Link to="/register" className="capa-btn-primary">OPEN AN ACCOUNT →</Link>
          </div>
        </div>

        {/* Feature pillars */}
        <div className="r-3col" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0 48px' }}>
          {[
            { num:'01', title:'Instant Execution',  body:'Orders placed in milliseconds across all 64+ NSE stocks. Market and limit orders. Your timing, your price.' },
            { num:'02', title:'CMA Regulated',       body:'Fully licensed by the Capital Markets Authority of Kenya. Every trade, every deposit — protected under Kenyan law.' },
            { num:'03', title:'Flat 0.5% Fee',       body:'One rate. Every trade. No management fees, no withdrawal charges. Just 0.5%, visible upfront before you confirm.' },
          ].map(f => (
            <div key={f.num} className="capa-pillar">
              <p className="capa-pillar-num">{f.num}</p>
              <p style={{ fontSize:'clamp(17px,1.9vw,24px)', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', margin:'12px 0 14px', lineHeight:1.15 }}>{f.title}</p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.38)', lineHeight:1.7, margin:0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section className="capa-section">
        <div ref={statsSection.ref}>
          <p style={LABEL}>[ BY THE NUMBERS ]</p>
          <div className="r-4col" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'48px 32px', marginTop:40 }}>
            <Stat to={64}  suffix="+"   label="NSE Stocks Available"    active={statsSection.inView} />
            <Stat to={10}  prefix="< "  suffix=" min" label="To Open Your Account" active={statsSection.inView} />
            <Stat to={100} suffix="%"   label="CMA Licensed & Regulated" active={statsSection.inView} />
            <Stat to={0}   suffix=" hidden fees" label="Zero. No Surprises. Ever." active={statsSection.inView} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="capa-section r-steps" style={{ background:'#0d0d0d' }}>
        <p style={LABEL}>[ HOW IT WORKS ]</p>
        <h2 style={{ ...H2, marginBottom:60 }}>UP AND RUNNING<br />IN MINUTES.</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0 0' }}>
          {[
            { num:'01', title:'Create Account',  body:'Register with your email and basic details. Takes under 2 minutes.' },
            { num:'02', title:'Verify Identity', body:'Upload your ID. Same-day KYC approval. No waiting, no paperwork.' },
            { num:'03', title:'Fund via M-Pesa', body:'Instant M-Pesa deposits. Your money is ready to invest immediately.' },
            { num:'04', title:'Start Investing', body:'Browse the NSE. Place trades. Track your portfolio in real time.' },
          ].map((s, i) => <StepCard key={s.num} index={i} {...s} />)}
        </div>
      </section>

      {/* ── TRUST ────────────────────────────────────────────────────────────── */}
      <section className="capa-section">
        <div className="r-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 80px', alignItems:'center' }}>
          <div>
            <p style={LABEL}>[ TRUST & REGULATION ]</p>
            <h2 style={H2}>CMA<br />REGULATED.<br /><span style={{ color:'var(--accent)' }}>FULL STOP.</span></h2>
          </div>
          <div>
            <p style={{ ...BODY, marginBottom:36 }}>
              Capa is fully licensed by the Capital Markets Authority of Kenya. Every trade, every deposit, every shilling — protected under Kenyan law and CMA oversight. No exceptions.
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px 24px' }}>
              {[
                ['Client Funds',    'Segregated & insured'],
                ['Trade Reporting', 'Full CMA compliance'],
                ['Data Security',   'Bank-grade encryption'],
                ['Dispute Process', 'CMA-backed resolution'],
              ].map(([title, sub]) => (
                <div key={title} style={{ borderTop:BORDER, paddingTop:16 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>{title}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.34)', margin:0 }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="capa-section r-cta" style={{ background:'#0d0d0d', borderTop:BORDER }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'0 80px', alignItems:'flex-end' }}>
          <div>
            <p style={LABEL}>[ READY? ]</p>
            <h2 style={H2}>OPEN YOUR<br />ACCOUNT.<br /><span style={{ color:'var(--accent)' }}>IT'S THAT SIMPLE.</span></h2>
          </div>
          <div style={{ paddingBottom:4, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.30)', margin:'0 0 8px', textAlign:'right', maxWidth:220 }}>
              No minimum deposit. No hidden fees. CMA regulated.
            </p>
            <Link to="/register" className="capa-btn-primary" style={{ fontSize:14, padding:'15px 30px' }}>START INVESTING →</Link>
            <Link to="/login"    className="capa-btn-secondary" style={{ fontSize:12 }}>SIGN IN</Link>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ marginTop:60, borderTop:BORDER, display:'flex', flexWrap:'wrap', fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.22)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
          {['64+ NSE Stocks', 'Nairobi Based', '0.5% Flat Fee', 'M-Pesa Deposits', 'CMA Regulated'].map((item, i, arr) => (
            <span key={i} style={{ padding:'0 22px', lineHeight:'44px', borderRight: i < arr.length - 1 ? BORDER : 'none' }}>{item}</span>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ padding:`22px ${PAD}`, borderTop:BORDER, background:'#080808', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div style={{ display:'flex', gap:24, alignItems:'center', flexWrap:'wrap' }}>
          <CapaCCircle size={22} />
          {[['About','/about'],['Contact','/contact'],['Terms','/terms'],['Privacy','/privacy'],['Security','/security'],['FAQ','/faq'],['Pricing','/pricing']].map(([l,h]) => (
            <Link key={l} to={h} style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.22)', textDecoration:'none' }}>{l}</Link>
          ))}
        </div>
        <p style={{ fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.16)', margin:0, letterSpacing:'0.06em', textTransform:'uppercase' }}>
          © {new Date().getFullYear()} Capa Investments Ltd. — CMA Regulated
        </p>
      </footer>
    </div>
  );
}
