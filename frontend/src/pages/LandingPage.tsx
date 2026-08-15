import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import CapaCCircle from '../components/ui/CapaCCircle';
import { useTheme } from '../context/ThemeContext';

// ─── Hooks ────────────────────────────────────────────────────────────────────
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

function useCounter(target: number, active: boolean, duration = 1600) {
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

// ─── Globe Canvas ─────────────────────────────────────────────────────────────
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

type GlobePoint = { x: number; y: number; z: number; accent: boolean; s: number };

function buildSpherePoints(n: number): GlobePoint[] {
  const pts: GlobePoint[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = GOLDEN * i;
    pts.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r,
               accent: Math.random() < 0.055, s: 0.65 + Math.random() * 0.9 });
  }
  return pts;
}

function slerp(a: GlobePoint, b: GlobePoint, t: number): { x: number; y: number; z: number } {
  const d = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(d);
  if (omega < 1e-4) return a;
  const s = Math.sin(omega);
  const f1 = Math.sin((1 - t) * omega) / s;
  const f2 = Math.sin(t * omega) / s;
  return { x: f1 * a.x + f2 * b.x, y: f1 * a.y + f2 * b.y, z: f1 * a.z + f2 * b.z };
}

const SPHERE_PTS = buildSpherePoints(820);

type Arc = { i: number; j: number; prog: number; speed: number; alpha: number; fading: boolean };

function mkArc(): Arc {
  const i = Math.floor(Math.random() * SPHERE_PTS.length);
  let j = Math.floor(Math.random() * SPHERE_PTS.length);
  while (j === i) j = Math.floor(Math.random() * SPHERE_PTS.length);
  return { i, j, prog: 0, speed: 0.004 + Math.random() * 0.004, alpha: 0, fading: false };
}

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number, W = 0, H = 0, cx = 0, cy = 0, R = 0;
    let rotation = 0;
    let glitchTimer = 0;
    let glitchOn = false, glitchFrames = 0;
    let glitchStripY = 0, glitchStripH = 0, glitchShift = 0;

    const arcs: Arc[] = Array.from({ length: 8 }, mkArc);

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W * 0.5; cy = H * 0.5;
      R = Math.min(W, H) * (W < 768 ? 0.42 : 0.40);
    };

    const getAccentRgb = (): [number, number, number] => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
      const parts = v.split(',').map(Number);
      return (parts.length === 3 ? parts : [32, 212, 184]) as [number, number, number];
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const [ar, ag, ab] = getAccentRgb();
      const cosR = Math.cos(rotation), sinR = Math.sin(rotation);

      // — globe limb ring (faint) —
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // — dots with RGB fringe (chromatic aberration) —
      for (const p of SPHERE_PTS) {
        const rx = p.x * cosR + p.z * sinR;
        const rz = -p.x * sinR + p.z * cosR;
        const ry = p.y;
        if (rz < -0.06) continue;
        const depth = Math.max(0, rz);
        const alpha = 0.08 + depth * 0.72;
        const dotR = p.s * (0.4 + depth * 0.8);
        const sx = cx + rx * R;
        const sy = cy - ry * R;

        if (p.accent) {
          // glowing accent dot
          ctx.save();
          ctx.globalAlpha = alpha * 0.45;
          ctx.fillStyle = `rgba(${ar},${ag},${ab},1)`;
          ctx.beginPath(); ctx.arc(sx - 2.5, sy, dotR * 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = alpha * 0.45;
          ctx.fillStyle = `rgba(${Math.max(0,ar-80)},${Math.min(255,ag+60)},${Math.min(255,ab+120)},1)`;
          ctx.beginPath(); ctx.arc(sx + 2.5, sy, dotR * 0.8, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = `rgba(${ar},${ag},${ab},1)`;
          ctx.beginPath(); ctx.arc(sx, sy, dotR * 1.3, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        } else {
          // chromatic fringe on regular dots
          const fr = Math.min(1, alpha * 0.6);
          ctx.save();
          ctx.globalAlpha = fr * 0.45;
          ctx.fillStyle = `rgba(255,30,60,1)`;
          ctx.beginPath(); ctx.arc(sx - 2, sy, dotR * 0.7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(30,140,255,1)`;
          ctx.beginPath(); ctx.arc(sx + 2, sy, dotR * 0.7, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#f0f0f0';
          ctx.beginPath(); ctx.arc(sx, sy, dotR, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }

      // — great-circle arcs (capital flows) —
      for (const arc of arcs) {
        if (!arc.fading) { arc.alpha = Math.min(1, arc.alpha + 0.06); arc.prog += arc.speed; }
        else { arc.alpha -= 0.04; }
        if (arc.alpha <= 0 && arc.fading) { Object.assign(arc, mkArc()); continue; }
        if (arc.prog >= 1) arc.fading = true;

        const pa = SPHERE_PTS[arc.i], pb = SPHERE_PTS[arc.j];
        const STEPS = 36;
        ctx.save();
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${arc.alpha * 0.45})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        let started = false;
        for (let k = 0; k <= STEPS * arc.prog; k++) {
          const t = k / STEPS;
          const sp = slerp(pa, pb, t);
          const rx2 = sp.x * cosR + sp.z * sinR;
          const rz2 = -sp.x * sinR + sp.z * cosR;
          const ry2 = sp.y;
          if (rz2 < 0) { started = false; continue; }
          const sx2 = cx + rx2 * R, sy2 = cy - ry2 * R;
          if (!started) { ctx.moveTo(sx2, sy2); started = true; }
          else ctx.lineTo(sx2, sy2);
        }
        ctx.stroke();
        ctx.restore();
      }

      // — occasional glitch strip —
      glitchTimer++;
      if (!glitchOn && glitchTimer > 280 + Math.random() * 200) {
        glitchOn = true; glitchFrames = 3 + Math.floor(Math.random() * 3);
        glitchStripY = Math.floor(Math.random() * H * 0.7 + H * 0.15);
        glitchStripH = Math.floor(20 + Math.random() * 60);
        glitchShift = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.floor(Math.random() * 22));
        glitchTimer = 0;
      }
      if (glitchOn && glitchFrames > 0) {
        try {
          const strip = ctx.getImageData(0, glitchStripY, W, glitchStripH);
          ctx.clearRect(0, glitchStripY, W, glitchStripH);
          ctx.putImageData(strip, glitchShift, glitchStripY);
        } catch (_) { /* ignore cors/security */ }
        glitchFrames--;
        if (glitchFrames === 0) glitchOn = false;
      }

      rotation += 0.0025;
      raf = requestAnimationFrame(draw);
    };

    setup();
    window.addEventListener('resize', setup);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', setup); };
  }, []);

  return (
    <canvas ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
  );
}

// ─── Grain overlay ────────────────────────────────────────────────────────────
function GrainOverlay({ opacity = 0.04 }: { opacity?: number }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = 180; c.height = 180;
    const ctx = c.getContext('2d')!;
    const d = ctx.createImageData(180, 180);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = Math.random() * 255 * 0.8;
    }
    ctx.putImageData(d, 0, 0);
    setUrl(c.toDataURL());
  }, []);

  if (!url) return null;
  return (
    <div style={{
      position: 'absolute', inset: '-50%', width: '200%', height: '200%',
      backgroundImage: `url(${url})`, backgroundSize: '180px 180px',
      opacity, pointerEvents: 'none', zIndex: 4,
      animation: 'grainShift 0.35s steps(1) infinite',
    }} />
  );
}

// ─── Floating market terminal ─────────────────────────────────────────────────
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fn = () => setT(new Date().toLocaleTimeString('en-KE', {
      timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }));
    fn(); const id = setInterval(fn, 1000); return () => clearInterval(id);
  }, []);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{t}</span>;
}

const MARKET_ITEMS = [
  { sym: 'SCOM', price: '16.45', chg: '+2.34%', pos: true },
  { sym: 'KCB',  price: '48.90', chg: '+3.45%', pos: true },
  { sym: 'EQTY', price: '52.25', chg: '−1.12%', pos: false },
  { sym: 'EABL', price: '168.00', chg: '+0.89%', pos: true },
];

function FloatingTerminal() {
  return (
    <div style={{
      position: 'absolute', top: '14%', right: 'max(32px,5vw)',
      width: 220, background: 'rgba(5,5,5,0.82)',
      border: '1px solid rgba(255,255,255,0.10)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      fontFamily: 'monospace',
      animation: 'termFloat 6s ease-in-out infinite',
      zIndex: 20,
    }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '8px 12px' }}>
        <span style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.38)' }}>NSE LIVE</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(255,255,255,0.38)' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          <Clock />
        </span>
      </div>
      {/* rows */}
      {MARKET_ITEMS.map(m => (
        <div key={m.sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#e0e0e0', letterSpacing: '0.06em' }}>{m.sym}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', fontVariantNumeric: 'tabular-nums' }}>{m.price}</span>
          <span style={{ fontSize: 10, color: m.pos ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{m.chg}</span>
        </div>
      ))}
      {/* footer */}
      <div style={{ padding: '7px 12px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.24)', letterSpacing: '0.10em' }}>64 INSTRUMENTS</span>
        <span style={{ fontSize: 9, color: 'var(--accent)', letterSpacing: '0.08em' }}>NSE</span>
      </div>
    </div>
  );
}

// ─── Market data row (section 2) ──────────────────────────────────────────────
type StockDef = { symbol: string; name: string; price: string; change: string; positive: boolean; spark: number[]; };

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const W = 80, H = 28;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - mn) / rng) * H * 0.8 - 3}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

function MarketDataRow({ symbol, name, price, change, positive, spark }: StockDef & { delay?: number }) {
  const { ref, inView } = useInView();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid', gridTemplateColumns: '160px 1fr auto auto',
        alignItems: 'center', gap: '0 32px',
        padding: '22px max(24px,6vw)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: hov ? 'rgba(255,255,255,0.025)' : 'transparent',
        cursor: 'pointer',
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateX(-20px)',
        transition: 'opacity .5s ease, transform .5s ease, background .2s ease',
      }}>
      <div>
        <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 'clamp(18px,2.2vw,28px)', fontWeight: 700,
          letterSpacing: '-0.02em', color: '#f0f0f0' }}>{symbol}</p>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.06em' }}>{name}</p>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <Sparkline data={spark} positive={positive} />
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 'clamp(16px,2vw,26px)', fontWeight: 700,
        color: '#f0f0f0', fontVariantNumeric: 'tabular-nums' }}>{price}</span>
      <span style={{
        fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
        color: positive ? '#22c55e' : '#ef4444',
        background: positive ? 'rgba(34,197,94,.10)' : 'rgba(239,68,68,.10)',
        padding: '4px 10px',
      }}>{positive ? '+' : ''}{change}</span>
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ num, title, body, index }: { num: string; title: string; body: string; index: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{
      borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28, paddingRight: index < 3 ? 32 : 0,
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity .55s ease ${index * 80}ms, transform .55s ease ${index * 80}ms`,
    }}>
      <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', color: 'var(--accent)', margin: '0 0 14px' }}>{num}</p>
      <p style={{ fontSize: 'clamp(16px,1.7vw,21px)', fontWeight: 800, color: '#f0f0f0', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.36)', lineHeight: 1.7, margin: 0 }}>{body}</p>
    </div>
  );
}

// ─── Animated stat ────────────────────────────────────────────────────────────
function Stat({ to, suffix = '', prefix = '', label, active }: {
  to: number; suffix?: string; prefix?: string; label: string; active: boolean;
}) {
  const v = useCounter(to, active);
  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: 'clamp(52px,6.5vw,96px)', fontWeight: 900, letterSpacing: '-0.045em', color: '#f0f0f0', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        <span style={{ color: 'var(--accent)' }}>{prefix}</span>{v}<span style={{ color: 'var(--accent)' }}>{suffix}</span>
      </p>
      <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STOCKS: StockDef[] = [
  { symbol: 'SCOM', name: 'Safaricom PLC',        price: 'KES 16.45',  change: '2.34%', positive: true,  spark: [14.2,14.8,14.5,15.1,15.8,15.3,16.1,16.4,16.0,16.45] },
  { symbol: 'KCB',  name: 'KCB Group PLC',        price: 'KES 48.90',  change: '3.45%', positive: true,  spark: [45.1,45.8,46.3,46.9,47.2,47.8,48.1,48.5,48.7,48.9]  },
  { symbol: 'EQTY', name: 'Equity Group Holdings', price: 'KES 52.25', change: '1.12%', positive: false, spark: [53.5,53.1,52.8,52.9,53.2,52.7,52.4,52.5,52.3,52.25]  },
  { symbol: 'EABL', name: 'East African Breweries', price: 'KES 168.00',change: '0.89%', positive: true, spark: [165.2,165.8,166.1,166.5,166.8,167.0,167.4,167.6,167.8,168.0] },
  { symbol: 'ABSA', name: 'Absa Bank Kenya PLC',   price: 'KES 14.85',  change: '1.23%', positive: true, spark: [13.9,14.1,14.0,14.3,14.5,14.4,14.7,14.8,14.75,14.85]  },
];

const TICKER = ['SCOM +2.34%', 'KCB +3.45%', 'EQTY −1.12%', 'EABL +0.89%', 'ABSA +1.23%',
                'NCBA −0.56%', 'DTB +2.10%', 'BAMB +0.44%', 'COOP +1.05%', 'NSE:20 +1.18%'];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme } = useTheme(); void theme;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const stats = useInView(0.18);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: '#060606', color: '#f0f0f0', minHeight: '100vh',
      fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif',
      WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Global CSS ───────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes grainShift {
          0%   { transform: translate(0,0) rotate(0deg); }
          14%  { transform: translate(-4px,2px) rotate(0.1deg); }
          28%  { transform: translate(3px,-3px) rotate(-0.1deg); }
          42%  { transform: translate(-2px,4px) rotate(0.05deg); }
          56%  { transform: translate(4px,-1px) rotate(-0.05deg); }
          70%  { transform: translate(-3px,3px) rotate(0deg); }
          84%  { transform: translate(2px,-4px) rotate(0.08deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
        @keyframes termFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%     { opacity:0.25; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes glitchA {
          0%,88%,100% { text-shadow: -3px 0 rgba(255,30,60,.5), 3px 0 rgba(30,130,255,.5); clip-path:none; transform:none; }
          90%  { text-shadow: -5px 0 rgba(255,30,60,.7), 5px 0 rgba(30,130,255,.7); transform:translateX(3px) skewX(1deg); }
          92%  { text-shadow: 5px 0 rgba(255,30,60,.7), -5px 0 rgba(30,130,255,.7); transform:translateX(-3px) skewX(-1deg); }
          94%  { text-shadow: -3px 0 rgba(255,30,60,.5), 3px 0 rgba(30,130,255,.5); transform:none; }
        }
        @keyframes heroReveal {
          from { opacity:0; transform:translateY(44px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes scanSweep {
          0%   { opacity:0; top:-4px; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { opacity:0; top:100%; }
        }

        /* Nav */
        .capa-nav {
          position:fixed; top:0; left:0; right:0; z-index:200;
          height:54px; display:flex; align-items:center; justify-content:space-between;
          padding:0 max(24px,5vw);
          transition:background .4s, backdrop-filter .4s, border-color .4s;
        }
        .capa-nav.scrolled {
          background:rgba(6,6,6,0.92);
          backdrop-filter:blur(24px);
          -webkit-backdrop-filter:blur(24px);
          border-bottom:1px solid rgba(255,255,255,0.05);
        }

        /* Menu overlay */
        .menu-overlay {
          position:fixed; inset:0; z-index:500;
          background:rgba(4,4,4,0.97);
          display:flex; flex-direction:column;
          padding:max(24px,5vw);
          animation:fadeIn .2s ease;
        }

        /* Buttons */
        .btn-p {
          display:inline-flex; align-items:center; gap:6px;
          background:var(--accent); color:var(--accent-text,#000);
          padding:11px 20px; font-size:11px; font-weight:700;
          letter-spacing:.10em; text-transform:uppercase; text-decoration:none;
          transition:opacity .2s, transform .2s;
        }
        .btn-p:hover { opacity:.82; transform:translateY(-1px); }
        .btn-g {
          display:inline-flex; align-items:center; gap:6px;
          color:rgba(255,255,255,0.52); border:1px solid rgba(255,255,255,0.14);
          padding:11px 18px; font-size:11px; font-weight:600;
          letter-spacing:.10em; text-transform:uppercase; text-decoration:none;
          transition:color .2s, border-color .2s;
        }
        .btn-g:hover { color:#f0f0f0; border-color:rgba(255,255,255,.35); }

        /* Section */
        .sec {
          padding: clamp(72px,9vh,128px) max(24px,6vw);
          border-top:1px solid rgba(255,255,255,0.05);
        }

        /* Typography helpers */
        .label {
          font-family:monospace; font-size:10px; letter-spacing:.16em;
          text-transform:uppercase; color:rgba(255,255,255,0.28);
        }
        .h2 {
          font-size:clamp(42px,6.5vw,96px); font-weight:900;
          letter-spacing:-.044em; line-height:.9; color:#f0f0f0;
          text-transform:uppercase; margin:0;
        }

        /* Responsive */
        @media(max-width:900px){
          .r2{grid-template-columns:1fr!important;}
          .r4{grid-template-columns:1fr 1fr!important;}
          .r3{grid-template-columns:1fr!important;}
          .rcta{grid-template-columns:1fr!important;}
          .rcta>div:last-child{align-items:flex-start!important;}
          .herocard{display:none!important;}
          .rlabel{display:none!important;}
        }
        @media(max-width:560px){
          .r4{grid-template-columns:1fr!important;}
          .r-steps{grid-template-columns:1fr 1fr!important;}
        }
        @media(prefers-reduced-motion:reduce){
          *{animation:none!important;transition:none!important;}
        }
      `}</style>

      {/* ── MENU OVERLAY ─────────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CapaCCircle size={22} />
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.20em', color: '#f0f0f0' }}>CAPA</span>
            </div>
            <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)', fontSize: 24, lineHeight: 1 }}>✕</button>
          </div>
          <nav style={{ flex: 1 }}>
            {[['MARKETS', '/markets'], ['INVEST', '/register'], ['PORTFOLIO', '/dashboard'],
              ['LEARN', '/faq'], ['LOG IN', '/login']].map(([l, h]) => (
              <Link key={l} to={h} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', fontSize: 'clamp(36px,7vw,80px)', fontWeight: 900,
                  letterSpacing: '-0.035em', color: 'rgba(255,255,255,0.12)',
                  textDecoration: 'none', lineHeight: 1.05,
                  transition: 'color .2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.12)')}
              >{l}</Link>
            ))}
          </nav>
          <Link to="/register" onClick={() => setMenuOpen(false)}
            className="btn-p" style={{ alignSelf: 'flex-start' }}>OPEN ACCOUNT →</Link>
        </div>
      )}

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className={`capa-nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <CapaCCircle size={22} />
          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', color: '#f0f0f0' }}>CAPA</span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.10em',
            color: 'rgba(255,255,255,0.40)', textDecoration: 'none' }}>LOG IN</Link>
          <button onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer',
              color: 'rgba(255,255,255,0.60)', fontFamily: 'monospace', fontSize: 10,
              letterSpacing: '0.14em', padding: '7px 14px' }}>MENU</button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 1 — HERO
      ══════════════════════════════════════════════════════════════════════════ */}
      <section style={{ height: '100dvh', minHeight: 580, position: 'relative',
        overflow: 'hidden', background: '#060606' }}>

        {/* Globe canvas */}
        <GlobeCanvas />

        {/* Scanlines */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: 'repeating-linear-gradient(to bottom,transparent 0px,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.07) 4px)' }} />

        {/* Grain */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, overflow: 'hidden', pointerEvents: 'none' }}>
          <GrainOverlay opacity={0.05} />
        </div>

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(6,6,6,0.85) 100%)' }} />

        {/* Floating market terminal */}
        <div className="herocard" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <FloatingTerminal />
          </div>
        </div>

        {/* Vertical side label */}
        <div className="rlabel" style={{ position: 'absolute', right: 'max(28px,4vw)', bottom: '22%',
          zIndex: 20, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
          animation: 'fadeIn 1.2s ease 0.8s both' }}>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18))' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.20em',
            color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase',
            writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>NSE · NAIROBI</span>
        </div>

        {/* Hero content — bottom left composition */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
          padding: '0 max(24px,6vw)' }}>

          {/* Headline */}
          <p className="label" style={{ margin: '0 0 12px', animation: 'fadeUp .7s ease 0.1s both' }}>
            — INVESTMENT PLATFORM —
          </p>

          <div style={{ marginBottom: 'clamp(14px,2vh,28px)', overflow: 'hidden' }}>
            <h1 style={{ margin: 0 }}>
              <div style={{ overflow: 'hidden' }}>
                <span style={{
                  display: 'block',
                  fontSize: 'clamp(72px,12vw,178px)', fontWeight: 900,
                  letterSpacing: '-0.048em', lineHeight: 0.87, color: '#f0f0f0',
                  textTransform: 'uppercase',
                  animation: 'heroReveal .85s cubic-bezier(0.16,1,0.3,1) 0.1s both, glitchA 7s ease 3s infinite',
                }}>INVEST</span>
              </div>
              <div style={{ overflow: 'hidden', marginTop: 4 }}>
                <span style={{
                  display: 'block',
                  fontSize: 'clamp(72px,12vw,178px)', fontWeight: 900,
                  letterSpacing: '-0.048em', lineHeight: 0.87,
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  animation: 'heroReveal .85s cubic-bezier(0.16,1,0.3,1) 0.24s both',
                }}>GLOBALLY.</span>
              </div>
            </h1>
          </div>

          {/* CTA + description */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, paddingBottom: 'clamp(12px,2vh,24px)',
            animation: 'fadeUp .7s ease 0.55s both', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-p">OPEN ACCOUNT →</Link>
            <Link to="/markets" style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.10em',
              color: 'rgba(255,255,255,0.38)', textDecoration: 'none' }}>
              EXPLORE MARKETS ↗
            </Link>
          </div>
        </div>

        {/* Bottom broadcast bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 21,
          display: 'flex', alignItems: 'stretch', overflow: 'hidden',
          background: 'rgba(6,6,6,0.88)', borderTop: '1px solid rgba(255,255,255,0.06)',
          fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase',
          animation: 'fadeIn .5s ease 0.9s both' }}>
          {[
            <><span style={{ color: 'var(--accent)', marginRight: 6, animation: 'pulse 2s ease-in-out infinite' }}>●</span>MARKET OPEN</>,
            'NSE +2.41%',
            '64 INSTRUMENTS',
            <Clock key="clk" />,
            'NAIROBI, KENYA',
            'CMA REGULATED',
          ].map((item, i, arr) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', padding: '0 20px', lineHeight: '42px',
              flexShrink: 0, color: 'rgba(255,255,255,0.28)',
              borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── MARKET TICKER STRIP ───────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: '#0a0a0a', overflow: 'hidden', padding: '10px 0' }}>
        <div style={{ display: 'flex', animation: 'ticker 28s linear infinite', width: 'max-content' }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{
              fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.10em', whiteSpace: 'nowrap',
              padding: '0 32px', borderRight: '1px solid rgba(255,255,255,0.05)',
              color: t.includes('−') || t.includes('-') ? '#ef4444' : 'rgba(255,255,255,0.38)',
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 2 — MARKETS (Bloomberg-style data table)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#060606', paddingTop: 'clamp(60px,8vh,100px)', paddingBottom: 'clamp(60px,8vh,100px)' }}>
        <div style={{ padding: '0 max(24px,6vw)', marginBottom: 40,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p className="label" style={{ margin: '0 0 12px' }}>[ LIVE MARKETS ]</p>
            <h2 className="h2">NAIROBI.<br /><span style={{ color: 'var(--accent)' }}>LIVE.</span></h2>
          </div>
          <Link to="/markets" style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em',
            color: 'var(--accent)', textDecoration: 'none', textTransform: 'uppercase' }}>ALL MARKETS →</Link>
        </div>
        <div>
          {STOCKS.map((s, i) => <MarketDataRow key={s.symbol} {...s} delay={i * 60} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 3 — PLATFORM (calm, editorial)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="sec" style={{ background: '#0b0b0b' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 80px' }} className="r2">
          <div>
            <p className="label" style={{ margin: '0 0 16px' }}>[ THE PLATFORM ]</p>
            <h2 className="h2">BUILT FOR<br />SERIOUS<br /><span style={{ color: 'var(--accent)' }}>INVESTORS.</span></h2>
          </div>
          <div style={{ paddingTop: 8 }}>
            <p style={{ fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: 40 }}>
              Every feature was designed around one question: what does a Kenyan investor actually need? Not what a fintech template suggests. Real tools, real data, real execution.
            </p>

            {/* Text-only pillar list — no cards */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                ['Instant Execution', 'Orders to NSE in milliseconds. Market and limit. Full stop.'],
                ['Flat 0.5% Fee',     'One rate. Every trade. No minimums, no surprises.'],
                ['M-Pesa Native',     'Fund instantly. Withdraw anytime. No bank required.'],
                ['CMA Licensed',      'Every trade is protected under Kenyan law. No exceptions.'],
              ].map(([t, d]) => (
                <div key={t} style={{ display: 'flex', gap: 24, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', minWidth: 160, flexShrink: 0 }}>{t}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.34)', lineHeight: 1.6 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 4 — STATS (oversized numbers)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="sec" style={{ background: '#060606' }}>
        <p className="label" style={{ margin: '0 0 48px' }}>[ NUMBERS ]</p>
        <div ref={stats.ref}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '48px 32px' }}
          className="r4">
          <Stat to={64}   suffix="+"      label="NSE STOCKS"         active={stats.inView} />
          <Stat to={10}   prefix="< "  suffix=" min" label="TO OPEN ACCOUNT" active={stats.inView} />
          <Stat to={100}  suffix="%"      label="CMA COMPLIANT"      active={stats.inView} />
          <Stat to={0}    suffix=" HIDDEN FEES" label="TRANSPARENT ALWAYS" active={stats.inView} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 5 — HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="sec" style={{ background: '#0b0b0b' }}>
        <p className="label" style={{ margin: '0 0 16px' }}>[ PROCESS ]</p>
        <h2 className="h2" style={{ marginBottom: 52 }}>UP IN<br />MINUTES.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0 0' }} className="r-steps">
          {[
            { num: '01', title: 'Create Account',  body: 'Register with email. Under 2 minutes. No documents yet.' },
            { num: '02', title: 'Verify Identity',  body: 'Upload your ID. Same-day KYC. No waiting rooms.' },
            { num: '03', title: 'Deposit via M-Pesa', body: 'Instant funding from your phone. Minimum KES 1,000.' },
            { num: '04', title: 'Start Trading',    body: 'Browse 64+ NSE instruments. Place your first order.' },
          ].map((s, i) => <StepCard key={s.num} index={i} {...s} />)}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 6 — TRUST (intentionally sparse / contrasting)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(100px,14vh,180px) max(24px,6vw)',
        background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <p className="label" style={{ margin: '0 0 28px' }}>[ REGULATION ]</p>
        <h2 style={{ fontSize: 'clamp(36px,5.5vw,80px)', fontWeight: 900, letterSpacing: '-0.04em',
          color: '#f0f0f0', margin: '0 0 24px', maxWidth: 680, lineHeight: 1.0 }}>
          CMA REGULATED.<br />FULL STOP.
        </h2>
        <p style={{ fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(255,255,255,0.36)', maxWidth: 460,
          lineHeight: 1.75, margin: '0 0 48px' }}>
          Capital Markets Authority of Kenya. Segregated client funds. Full trade reporting. No compromises.
        </p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['Client Funds','Segregated'],['Trade Data','CMA Reported'],['Encryption','Bank-grade'],['Disputes','CMA Process']].map(([t,d]) => (
            <div key={t} style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 4px', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em',
                color: 'var(--accent)', textTransform: 'uppercase' }}>{t}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.26)' }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SCENE 7 — CTA (massive type, viewport-scale)
      ══════════════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(80px,10vh,140px) max(24px,6vw)',
        background: '#0b0b0b', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative',
        overflow: 'hidden' }}>

        {/* Faint globe echo */}
        <div style={{ position: 'absolute', right: '-8%', top: '50%', transform: 'translateY(-50%)',
          width: '55vw', height: '55vw', maxWidth: 700, maxHeight: 700,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)',
          pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '-4%', top: '50%', transform: 'translateY(-50%)',
          width: '42vw', height: '42vw', maxWidth: 520, maxHeight: 520,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)',
          pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <p className="label" style={{ margin: '0 0 20px' }}>[ READY? ]</p>
          <h2 style={{ fontSize: 'clamp(52px,9.5vw,148px)', fontWeight: 900, letterSpacing: '-0.046em',
            lineHeight: 0.88, color: '#f0f0f0', textTransform: 'uppercase', margin: '0 0 40px', maxWidth: '80vw' }}>
            THE MARKET<br />IS WAITING<br /><span style={{ color: 'var(--accent)' }}>FOR YOU.</span>
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-p" style={{ fontSize: 13, padding: '14px 28px' }}>OPEN ACCOUNT →</Link>
            <Link to="/login"    className="btn-g" style={{ fontSize: 12 }}>SIGN IN</Link>
          </div>
          <p style={{ marginTop: 24, fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.20)',
            letterSpacing: '0.08em' }}>
            No minimum deposit · 0.5% flat fee · CMA regulated · M-Pesa instant
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ padding: `20px max(24px,6vw)`, borderTop: '1px solid rgba(255,255,255,0.05)',
        background: '#060606', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <CapaCCircle size={20} />
          {[['About','/about'],['Contact','/contact'],['Terms','/terms'],['Privacy','/privacy'],
            ['Security','/security'],['FAQ','/faq'],['Pricing','/pricing']].map(([l,h]) => (
            <Link key={l} to={h} style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.09em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.14)', margin: 0,
          letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          © {new Date().getFullYear()} Capa Investments Ltd.
        </p>
      </footer>
    </div>
  );
}
