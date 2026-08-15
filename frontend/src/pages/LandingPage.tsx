import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import CapaCCircle from '../components/ui/CapaCCircle';
import { useTheme } from '../context/ThemeContext';

/* ─── Watch Dogs 2-style network background (nodes + edge particles) ─── */
function BackgroundCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvasRaw = ref.current; if (!canvasRaw) return;
    const ctxRaw = canvasRaw.getContext('2d'); if (!ctxRaw) return;
    const canvas = canvasRaw as HTMLCanvasElement;
    const ctx = ctxRaw as CanvasRenderingContext2D;
    let W = 0, H = 0, animId: number;

    type Node = { x: number; y: number; vx: number; vy: number; r: number; isHub: boolean; pulse: number; pulseSpeed: number; alpha: number; };
    type Particle = { fromIdx: number; toIdx: number; t: number; speed: number; trail: { x: number; y: number }[]; };

    const NODE_COUNT    = 68;
    const CONNECT_DIST  = 220;
    const PARTICLE_COUNT = 90;
    const TRAIL_LEN     = 10;

    let nodes: Node[]       = [];
    let particles: Particle[] = [];

    function mkNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r:  Math.random() < 0.14 ? 3.6 : Math.random() < 0.4 ? 2.0 : 1.1,
        isHub: Math.random() < 0.14,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.016 + Math.random() * 0.022,
        alpha: 0.45 + Math.random() * 0.55,
      }));
    }

    function pickNeighbor(fromIdx: number): number {
      const from = nodes[fromIdx];
      const nearby: number[] = [];
      nodes.forEach((n, i) => {
        if (i === fromIdx) return;
        const dx = n.x - from.x, dy = n.y - from.y;
        if (dx*dx + dy*dy < CONNECT_DIST * CONNECT_DIST * 1.44) nearby.push(i);
      });
      return nearby.length
        ? nearby[Math.floor(Math.random() * nearby.length)]
        : Math.floor(Math.random() * NODE_COUNT);
    }

    function mkParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const fromIdx = Math.floor(Math.random() * NODE_COUNT);
        return { fromIdx, toIdx: pickNeighbor(fromIdx), t: Math.random(), speed: 0.004 + Math.random() * 0.007, trail: [] };
      });
    }

    function resize() {
      const dpr = devicePixelRatio || 1;
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.ceil(W * dpr); canvas.height = Math.ceil(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mkNodes(); mkParticles();
    }

    function draw() {
      const rgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '32,212,184';

      // Dark navy-black background
      ctx.fillStyle = '#05080f'; ctx.fillRect(0, 0, W, H);

      // Vignette
      const vig = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, Math.max(W, H) * 0.78);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.60)');
      ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

      // Move nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += n.pulseSpeed;
        if (n.x < -70) n.x = W + 70; if (n.x > W + 70) n.x = -70;
        if (n.y < -70) n.y = H + 70; if (n.y > H + 70) n.y = -70;
      });

      // Edges
      ctx.lineWidth = 0.55;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const d2 = dx*dx + dy*dy;
          if (d2 < CONNECT_DIST * CONNECT_DIST) {
            const a = (1 - Math.sqrt(d2) / CONNECT_DIST) * 0.16;
            ctx.strokeStyle = `rgba(${rgb},${a})`;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }

      // Particles
      particles.forEach(p => {
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0; p.trail = [];
          p.fromIdx = p.toIdx;
          p.toIdx = pickNeighbor(p.fromIdx);
        }
        const from = nodes[p.fromIdx], to = nodes[p.toIdx];
        const dx = to.x - from.x, dy = to.y - from.y;
        if (dx*dx + dy*dy > CONNECT_DIST * CONNECT_DIST * 2.25) return;

        const px = from.x + dx * p.t, py = from.y + dy * p.t;
        p.trail.push({ x: px, y: py });
        if (p.trail.length > TRAIL_LEN) p.trail.shift();

        // Trail
        p.trail.forEach((pt, ti) => {
          const frac = ti / TRAIL_LEN;
          const ta = frac * 0.5;
          const tr = frac * 2.2;
          const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, tr + 4);
          g.addColorStop(0, `rgba(${rgb},${ta * 0.65})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pt.x, pt.y, tr + 4, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${ta * 0.85})`;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, Math.max(0.4, tr * 0.35), 0, Math.PI * 2); ctx.fill();
        });

        // Head glow
        const hg = ctx.createRadialGradient(px, py, 0, px, py, 8);
        hg.addColorStop(0, `rgba(${rgb},0.95)`); hg.addColorStop(0.45, `rgba(${rgb},0.35)`); hg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill();
      });

      // Nodes
      nodes.forEach(n => {
        const p = Math.sin(n.pulse) * 0.5 + 0.5;

        if (n.isHub) {
          // Pulse ring
          ctx.strokeStyle = `rgba(${rgb},${0.10 + p * 0.12})`; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(n.x, n.y, 15 + p * 9, 0, Math.PI * 2); ctx.stroke();
          // Outer glow
          const og = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 26 + p * 12);
          og.addColorStop(0, `rgba(${rgb},${0.28 + p * 0.18})`); og.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = og; ctx.beginPath(); ctx.arc(n.x, n.y, 26 + p * 12, 0, Math.PI * 2); ctx.fill();
        }

        // Node body
        ctx.fillStyle = `rgba(${rgb},${n.alpha * (0.55 + p * 0.45)})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();

        if (n.r > 2) {
          ctx.fillStyle = `rgba(255,255,255,${0.80 + p * 0.20})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, 1.0, 0, Math.PI * 2); ctx.fill();
        }
      });

      animId = requestAnimationFrame(draw);
    }

    resize(); draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 0 }} />;
}

/* ─── Live Nairobi clock ─── */
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fn = () => setT(
      new Date().toLocaleTimeString('en-KE', {
        timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit',
        second: '2-digit', hour12: false,
      })
    );
    fn(); const id = setInterval(fn, 1000); return () => clearInterval(id);
  }, []);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>[ {t} EAT ]</span>;
}

/* ─── Rotating nav center text ─── */
const NAV_LABELS = ['INVEST GLOBAL. TRADE SIMPLE.', 'NSE LIVE MARKET DATA', 'M-PESA DEPOSITS', 'CMA REGULATED PLATFORM'];
function NavLabel() {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i + 1) % NAV_LABELS.length); setVis(true); }, 280);
    }, 3600);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', opacity: vis ? 1 : 0, transition: 'opacity 0.28s ease' }}>
      {NAV_LABELS[idx]}
    </span>
  );
}

/* ─── Bottom status bar (used in hero + footer) ─── */
function StatusBar() {
  const items: [React.ReactNode, boolean][] = [
    ['15+ MARKETS', true],
    ['NAIROBI BASED', true],
    [<Clock key="c" />, true],
    [<><span style={{ color: 'var(--accent)', marginRight: 5 }}>●</span>NSE LIVE</>, true],
    ['CMA REGULATED', false],
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', borderTop: '1px solid rgba(255,255,255,0.08)', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.34)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {items.map(([label, div], i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ padding: '0 22px', lineHeight: '44px' }}>{label}</span>
          {div && <span style={{ color: 'rgba(255,255,255,0.10)' }}>|</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── Pill button ─── */
function Pill({ label }: { label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 2, fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.09em', textTransform: 'uppercase', cursor: 'default' }}>
      {label} <span style={{ opacity: 0.6 }}>↗</span>
    </span>
  );
}

/* ─── Page ─── */
export default function LandingPage() {
  const { theme } = useTheme();
  void theme; // used for potential future theming
  const [scrolled, setScrolled] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Page-reveal: dark screen fades out on every load/refresh
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 380);
    return () => clearTimeout(t);
  }, []);

  const PAD = 'max(28px, 5.5vw)';
  const BORDER = '1px solid rgba(255,255,255,0.08)';
  const H1 = { fontSize: 'clamp(58px, 9.5vw, 132px)', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 0.90, color: '#fff', margin: 0, textTransform: 'uppercase' as const };
  const H2 = { fontSize: 'clamp(52px, 8.5vw, 116px)', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 0.90, color: '#fff', margin: 0, textTransform: 'uppercase' as const };
  const LABEL = { fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.34)' };
  const BODY = { fontSize: 'clamp(15px, 1.6vw, 20px)', color: 'rgba(255,255,255,0.52)', lineHeight: 1.65 };

  return (
    <>
      {/* ── Layer 0: animated blob canvas ── */}
      <BackgroundCanvas />

      {/* ── Layer 1: dot-grid overlay (pointer-events:none so clicks pass through) ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 1, backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 2px, transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />

      {/* ── Page-reveal overlay: dark screen that fades out on every load ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: '#0c0c0c', opacity: revealed ? 0 : 1, transition: 'opacity 1.1s cubic-bezier(0.4,0,0.2,1)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ opacity: revealed ? 0 : 1, transition: 'opacity 0.4s' }}>
          <CapaCCircle size={52} />
        </div>
      </div>

      <style>{`
        @keyframes ll-up { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        .ll-in { animation: ll-up 0.9s cubic-bezier(.16,1,.3,1) both; }
        .ll-in-1 { animation-delay: 0.08s; }
        .ll-in-2 { animation-delay: 0.18s; }
        .ll-in-3 { animation-delay: 0.28s; }
        .ll-in-4 { animation-delay: 0.40s; }
        .ll-btn { display:inline-flex; align-items:center; gap:8px; padding:13px 26px; font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; text-decoration:none; border:1px solid rgba(255,255,255,0.18); color:rgba(255,255,255,0.75); transition:border-color .2s, color .2s, background .2s; font-family:monospace; border-radius:2px; }
        .ll-btn:hover { border-color:rgba(255,255,255,0.50); color:#fff; }
        .ll-btn-primary { background:var(--accent); border-color:var(--accent); color:#fff; }
        .ll-btn-primary:hover { opacity:.86; }
        .ll-nlink { font-family:monospace; font-size:11px; letter-spacing:0.10em; text-transform:uppercase; color:rgba(255,255,255,0.34); text-decoration:none; transition:color .2s; }
        .ll-nlink:hover { color:rgba(255,255,255,0.80); }
        @media (max-width:820px) {
          .ll-hero-grid { grid-template-columns:1fr !important; }
          .ll-hero-right { margin-top:32px; }
          .ll-wwd-grid  { grid-template-columns:1fr !important; }
          .ll-col3      { grid-template-columns:1fr !important; }
          .ll-col3 > div { border-left:none !important; border-top:1px solid rgba(255,255,255,0.08); padding-left:0 !important; }
          .ll-cta-grid  { grid-template-columns:1fr !important; }
        }
        @media (max-width:560px) {
          .ll-nav-center { display:none !important; }
          .ll-hero-right-stats { flex-wrap:wrap; gap:20px !important; }
        }
        @media (prefers-reduced-motion:reduce) {
          .ll-in { animation:none !important; opacity:1 !important; transform:none !important; }
        }
      `}</style>

      {/* ── Page wrapper (z-index:2 sits above dot-grid overlay) ── */}
      <div style={{ position: 'relative', zIndex: 2, color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

        {/* ───── NAV ───── */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${PAD}`, background: scrolled ? 'rgba(12,12,12,0.94)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? BORDER : 'none', transition: 'background .35s, border-color .35s' }}>
          <CapaCCircle size={28} />
          <div className="ll-nav-center"><NavLabel /></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/login" className="ll-nlink">Sign In</Link>
            <Link to="/register" className="ll-btn ll-btn-primary" style={{ padding: '7px 18px', fontSize: 12 }}>GET STARTED →</Link>
          </div>
        </nav>

        {/* ───── HERO ───── */}
        <section style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderBottom: BORDER }}>
          {/* Main content — bottom-pinned like lamalama */}
          <div style={{ padding: `0 ${PAD}`, borderTop: BORDER }}>
            <div className="ll-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '0 64px', alignItems: 'flex-end', padding: '48px 0 44px' }}>

              {/* Left — headline */}
              <div className="ll-in ll-in-1">
                <h1 style={H1}>YOUR<br />GATEWAY<br /><span style={{ color: 'var(--accent)' }}>TO.</span></h1>
              </div>

              {/* Right — description + CTA + stats */}
              <div className="ll-hero-right ll-in ll-in-4">
                <p style={{ ...BODY, marginBottom: 32 }}>
                  We make global investing accessible to every Kenyan. Real-time NSE data, instant execution, M-Pesa deposits — open your account in under 10 minutes.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
                  <Link to="/register" className="ll-btn ll-btn-primary">OPEN ACCOUNT →</Link>
                  <Link to="/login" className="ll-btn">SIGN IN</Link>
                </div>
                <div className="ll-hero-right-stats" style={{ display: 'flex', gap: 32 }}>
                  {[['15+','Markets'],['0.5%','Flat fee'],['CMA','Regulated']].map(([v,l])=>(
                    <div key={l}>
                      <p style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums' }}>{v}</p>
                      <p style={{ ...LABEL, margin: '4px 0 0', fontSize: 10 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <StatusBar />
        </section>

        {/* ───── WHAT WE DO ───── */}
        <section style={{ borderBottom: BORDER }}>
          {/* Top label strip */}
          <div style={{ padding: `22px ${PAD}`, borderBottom: BORDER, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={LABEL}>[ HOW WE INVEST ]</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Pill label="Equities" /><Pill label="Fixed Income" /><Pill label="Forex" />
            </div>
          </div>

          {/* Main grid */}
          <div className="ll-wwd-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: `56px ${PAD} 0`, gap: '0 80px' }}>
            {/* Left — big heading */}
            <div>
              <h2 style={H2}>WHAT<br />WE DO.</h2>
            </div>
            {/* Right — description */}
            <div style={{ paddingTop: 8 }}>
              <p style={{ ...BODY, marginBottom: 32 }}>
                We create simple pathways for Kenyans to build wealth. Real-time NSE equities, fixed-income instruments, and global forex — all on one regulated platform. Sharp execution. No hidden fees. No gatekeeping.
              </p>
              <p style={{ ...BODY, fontSize: 'clamp(13px, 1.3vw, 16px)', color: 'rgba(255,255,255,0.34)', marginBottom: 0 }}>
                TLDR; we just want you to grow your money.{' '}
                <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>OPEN AN ACCOUNT →</Link>
              </p>
            </div>
          </div>

          {/* Three-column service list */}
          <div className="ll-col3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', margin: `48px ${PAD} 0`, borderTop: BORDER }}>
            {[
              ['EQUITIES', ['NSE-listed stocks','Pan-African ETFs','Global shares','Dividend reinvestment','Real-time quotes']],
              ['FIXED INCOME', ['Treasury Bills','Treasury Bonds','Corporate bonds','Unit trusts','Money market funds']],
              ['FOREX', ['USD / KES','EUR / KES','GBP / KES','Live mid-market rates','Instant conversion']],
            ].map(([title, items], i) => (
              <div key={title as string} style={{ padding: '40px 0', paddingLeft: i > 0 ? 40 : 0, borderLeft: i > 0 ? BORDER : 'none' }}>
                <p style={{ ...LABEL, marginBottom: 24, color: 'rgba(255,255,255,0.28)' }}>[ {title} ]</p>
                {(items as string[]).map(item => (
                  <p key={item} style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: '0 0 10px', lineHeight: 1.4 }}>{item}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ margin: `0 ${PAD}`, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ padding: `32px ${PAD}` }}>
            <Link to="/register" className="ll-btn">START INVESTING ↗</Link>
          </div>
        </section>

        {/* ───── WHO WE ARE (lamalama's culture section) ───── */}
        <section style={{ borderBottom: BORDER }}>
          <div style={{ padding: `22px ${PAD}`, borderBottom: BORDER }}>
            <p style={LABEL}>[ OUR MISSION ]</p>
          </div>
          <div style={{ padding: `80px ${PAD}`, maxWidth: 900 }}>
            <p style={{ fontSize: 'clamp(22px, 3.2vw, 40px)', fontWeight: 700, color: '#fff', lineHeight: 1.28, letterSpacing: '-0.025em', margin: 0 }}>
              We believe every Kenyan deserves access to the global financial markets. No gatekeeping, no complexity, no unnecessary fees. Just a transparent platform built for people who want their money to work harder — starting today.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', margin: `0 ${PAD}`, borderTop: BORDER }}>
            {[
              ['No minimum deposit', 'Start with whatever you have.'],
              ['Flat 0.5% fee', 'One rate, no hidden costs.'],
              ['Same-day KYC', 'Verified and invested the same day.'],
            ].map(([title, sub], i) => (
              <div key={title} style={{ padding: '36px 0', paddingLeft: i > 0 ? 40 : 0, borderLeft: i > 0 ? BORDER : 'none' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{title}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', margin: 0 }}>{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───── HOW IT WORKS ───── */}
        <section style={{ borderBottom: BORDER }}>
          <div style={{ padding: `22px ${PAD}`, borderBottom: BORDER }}>
            <p style={LABEL}>[ GET STARTED IN MINUTES ]</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', margin: `0 ${PAD}`, borderTop: BORDER }}>
            {[
              ['01','Create account','Register with your email in under 2 minutes.'],
              ['02','Verify identity','Upload ID and selfie. KYC approved same day.'],
              ['03','Fund via M-Pesa','Deposit via M-Pesa or bank transfer instantly.'],
              ['04','Start investing','Browse markets and place your first trade.'],
            ].map(([num, title, desc], i) => (
              <div key={num} style={{ padding: '40px 0', paddingLeft: i > 0 ? 36 : 0, borderLeft: i > 0 ? BORDER : 'none' }}>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.22)', marginBottom: 28, letterSpacing: '0.06em' }}>{num}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.015em' }}>{title}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', margin: 0, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───── CTA — "BRIEF US SOMETHING." equivalent ───── */}
        <section style={{ borderBottom: BORDER }}>
          <div style={{ padding: `22px ${PAD}`, borderBottom: BORDER }}>
            <p style={LABEL}>[ READY TO INVEST? ]</p>
          </div>
          <div className="ll-cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0 80px', alignItems: 'flex-end', padding: `64px ${PAD} 60px` }}>
            <div>
              <h2 style={H2}>OPEN YOUR<br /><span style={{ color: 'var(--accent)' }}>ACCOUNT.</span></h2>
            </div>
            <div style={{ paddingBottom: 8, textAlign: 'right' }}>
              <p style={{ ...BODY, fontSize: 14, marginBottom: 28, maxWidth: 320, textAlign: 'left' }}>
                Feel free to get started. We'll make it simple.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/register" className="ll-btn ll-btn-primary">START INVESTING ↗</Link>
                <Link to="/login" className="ll-btn">SIGN IN</Link>
              </div>
            </div>
          </div>
          <StatusBar />
        </section>

        {/* ───── FOOTER ───── */}
        <footer>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `18px ${PAD}`, borderBottom: BORDER }}>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
              <CapaCCircle size={24} />
              {[['About','/about'],['Contact','/contact'],['Terms','/terms'],['Privacy','/privacy'],['Security','/security'],['FAQ','/faq']].map(([l,h])=>(
                <Link key={l} to={h} style={{ fontFamily:'monospace', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', textDecoration:'none' }}>{l}</Link>
              ))}
            </div>
            <p style={{ fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.20)', margin:0, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              © {new Date().getFullYear()} Capa Investments Ltd.
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
