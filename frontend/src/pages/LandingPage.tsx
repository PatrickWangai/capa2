import { Link } from 'react-router-dom';
import { useRef, useState, useCallback, useEffect } from 'react';
import { TrendingUp, Shield, Zap, Globe, ChevronRight, UserCheck, DollarSign, BarChart2, Check, TrendingDown } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';

const ACCENT = '#f5821f';
const TEXT    = '#ffffff';
const SEC     = 'rgba(235,235,245,0.6)';

// ── Canvas animation types & helpers (module-level so TS knows types) ────
interface Particle { x: number; y: number; vx: number; vy: number; r: number; gr: string; hex: string; alpha: number; phase: number; }
interface ChartLine { points: { x: number; y: number }[]; progress: number; speed: number; color: string; glow: string; width: number; }

function buildPoints(seed: number, yBase: number, amplitude: number, w: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  let y = yBase;
  for (let i = 0; i <= 80; i++) {
    const x = (i / 80) * w;
    y = yBase + Math.sin(i * 0.3 + seed) * amplitude * 0.4
      + Math.sin(i * 0.7 + seed * 2) * amplitude * 0.3
      + Math.sin(i * 1.4 + seed * 3) * amplitude * 0.15
      - (i / 80) * amplitude * 0.6;
    pts.push({ x, y });
  }
  return pts;
}

function renderChart(ctx: CanvasRenderingContext2D, line: ChartLine) {
  line.progress = Math.min(1, line.progress + line.speed);
  const pts = line.points;
  const vis = Math.floor(line.progress * (pts.length - 1));
  if (vis < 2) return;

  ctx.save();
  ctx.shadowColor = line.glow; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i <= vis; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = line.color; ctx.lineWidth = line.width; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();

  const tip = pts[vis];
  const tipColor = line.glow === '#f5821f' ? 'rgba(245,130,31,0.8)' : line.glow === '#3b82f6' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.3)';
  const grad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 14);
  grad.addColorStop(0, tipColor); grad.addColorStop(1, 'transparent');
  ctx.beginPath(); ctx.arc(tip.x, tip.y, 14, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath(); ctx.arc(tip.x, tip.y, line.width + 1, 0, Math.PI * 2);
  ctx.fillStyle = line.glow; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
}

function renderFrame(ctx: CanvasRenderingContext2D, w: number, h: number, particles: Particle[], chartLines: ChartLine[]) {
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  for (const line of chartLines) renderChart(ctx, line);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 150) {
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(245,130,31,${(1 - d / 150) * 0.15})`; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
  }

  for (const p of particles) {
    p.phase += 0.012; p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > w) p.vx *= -1;
    if (p.y < 0 || p.y > h) p.vy *= -1;
    const pr = p.r * (1 + Math.sin(p.phase) * 0.25);
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pr * 6);
    grd.addColorStop(0, p.gr + String(p.alpha * 0.5) + ')'); grd.addColorStop(1, p.gr + '0)');
    ctx.beginPath(); ctx.arc(p.x, p.y, pr * 6, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = p.hex; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1;
  }
}

// ── Particle network canvas ──────────────────────────────────
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const elRaw = canvasRef.current;
    if (!elRaw) return;
    const ctxRaw = elRaw.getContext('2d');
    if (!ctxRaw) return;
    // Explicit typed aliases so TypeScript doesn't lose narrowing in closures
    const cvs = elRaw   as HTMLCanvasElement;
    const ctx = ctxRaw  as CanvasRenderingContext2D;

    let animId: number;
    let w = 0, h = 0;
    let particles: Particle[] = [];
    let chartLines: ChartLine[] = [];

    const COLORS = [
      { hex: '#f5821f', gr: 'rgba(245,130,31,' },
      { hex: '#3b82f6', gr: 'rgba(59,130,246,' },
      { hex: '#8b5cf6', gr: 'rgba(139,92,246,' },
      { hex: '#ffffff', gr: 'rgba(255,255,255,' },
    ];

    function setup() {
      w = cvs.width  = cvs.offsetWidth;
      h = cvs.height = cvs.offsetHeight;
      chartLines = [
        { points: buildPoints(1.2, h * 0.72, h * 0.12, w), progress: 0,   speed: 0.0018, color: 'rgba(245,130,31,0.55)', glow: '#f5821f', width: 2   },
        { points: buildPoints(3.5, h * 0.82, h * 0.08, w), progress: 0.3, speed: 0.0012, color: 'rgba(59,130,246,0.35)',  glow: '#3b82f6', width: 1.5 },
        { points: buildPoints(6.1, h * 0.62, h * 0.10, w), progress: 0.6, speed: 0.0009, color: 'rgba(255,255,255,0.15)', glow: '#ffffff', width: 1   },
      ];
      const count = Math.min(90, Math.floor(w * h / 10000));
      particles = Array.from({ length: count }, () => {
        const c = COLORS[Math.random() < 0.45 ? 0 : Math.random() < 0.6 ? 1 : Math.random() < 0.7 ? 2 : 3];
        return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.8 + 0.6, ...c, alpha: Math.random() * 0.55 + 0.2, phase: Math.random() * Math.PI * 2 };
      });
    }

    function tick() {
      renderFrame(ctx, w, h, particles, chartLines);
      animId = requestAnimationFrame(tick);
    }

    setup();
    animId = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => { setup(); });
    ro.observe(cvs);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}


// ── Floating stock badge ──────────────────────────────────────
interface Badge { sym: string; price: string; change: string; up: boolean; delay: number; left: string; }
const BADGES: Badge[] = [
  { sym: 'SCOM', price: 'KES 33.60', change: '+1.2%', up: true,  delay: 0,    left: '6%'  },
  { sym: 'AAPL', price: 'USD 189.5', change: '+0.4%', up: true,  delay: 1.4,  left: '78%' },
  { sym: 'TSLA', price: 'USD 242.8', change: '-1.1%', up: false, delay: 2.6,  left: '20%' },
  { sym: 'EQTY', price: 'KES 79.75', change: '+2.1%', up: true,  delay: 3.8,  left: '65%' },
  { sym: 'NVDA', price: 'USD 495.0', change: '+3.2%', up: true,  delay: 5.0,  left: '88%' },
  { sym: 'KCB',  price: 'KES 76.00', change: '+0.7%', up: true,  delay: 6.2,  left: '42%' },
];

function FloatingBadge({ sym, price, change, up, delay, left }: Badge) {
  return (
    <div style={{
      position: 'absolute', bottom: '10%', left,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 14px', borderRadius: 999,
      background: 'rgba(28,28,30,0.75)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: `badge-float 7s ease-in-out ${delay}s infinite`,
      zIndex: 5, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{sym}</span>
      <span style={{ fontSize: 11, color: 'rgba(235,235,245,0.6)' }}>{price}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: up ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: 2 }}>
        {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{change}
      </span>
    </div>
  );
}

// ── Section fade-in hook ─────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(40px)', transition: 'opacity 0.7s ease, transform 0.7s ease', ...style }}>
      {children}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────
const features = [
  { icon: TrendingUp, title: 'Live Markets',      desc: 'Real-time prices across NYSE, NASDAQ, LSE and NSE. Never miss a move.' },
  { icon: Shield,     title: 'Capital Protected', desc: 'Your assets are held by a regulated custodian, segregated from company funds.' },
  { icon: Zap,        title: 'Instant Execution', desc: 'Orders filled in milliseconds. Your timing, your price, zero slippage.' },
  { icon: Globe,      title: 'Global Access',     desc: 'Invest in US, UK, and Kenyan markets — from anywhere in Africa.' },
];
const stats = [
  { value: '50+', label: 'Global Markets' },
  { value: '0.5%', label: 'Trade Fee' },
  { value: '24/7', label: 'Support' },
  { value: '<10m', label: 'To Open Account' },
];
const steps = [
  { icon: UserCheck,  num: '01', title: 'Create your account',  desc: 'Register with your email. Takes under 2 minutes.' },
  { icon: Shield,     num: '02', title: 'Verify your identity', desc: 'Upload your ID and a selfie. KYC typically approved same day.' },
  { icon: DollarSign, num: '03', title: 'Fund your account',    desc: 'Deposit via M-Pesa, bank transfer, or card. Funds appear instantly.' },
  { icon: BarChart2,  num: '04', title: 'Start investing',      desc: 'Browse global markets and place your first trade in seconds.' },
];
const testimonials = [
  { name: 'Amara K.',  location: 'Nairobi, Kenya',  text: 'I never thought I could invest in Apple or Tesla from Kenya. Capa made it simple — I was trading in 20 minutes.',                  initials: 'AK' },
  { name: 'James O.',  location: 'Lagos, Nigeria',   text: 'The zero monthly fee model won me over. Other platforms were charging me just to exist. Capa only charges when I trade.',          initials: 'JO' },
  { name: 'Fatima M.', location: 'Kampala, Uganda',  text: 'KYC was painless — done in a day. The interface is clean and the portfolio tracking is excellent.',                                 initials: 'FM' },
];

// ── Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#000', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Inject keyframes */}
      <style>{`
        @keyframes badge-float {
          0%   { transform: translateY(0px);   opacity: 0; }
          8%   { opacity: 1; }
          50%  { transform: translateY(-60px); opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-120px);opacity: 0; }
        }
        @keyframes hero-text-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orb-drift-1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(60px,-40px) scale(1.08); }
          66%      { transform: translate(-30px,50px) scale(0.95); }
        }
        @keyframes orb-drift-2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-70px,30px) scale(1.05); }
          70%      { transform: translate(40px,-60px) scale(0.92); }
        }
        .hero-text { animation: hero-text-in 1s ease both; }
        .hero-text-1 { animation-delay: 0.1s; }
        .hero-text-2 { animation-delay: 0.3s; }
        .hero-text-3 { animation-delay: 0.5s; }
        .hero-text-4 { animation-delay: 0.7s; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'saturate(180%) blur(24px)', WebkitBackdropFilter: 'saturate(180%) blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CapaLogo size={44} />
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }} className="nav-links">
          {[['About', '/about'], ['Pricing', '/pricing'], ['FAQ', '/faq'], ['Security', '/security']].map(([l, h]) => (
            <Link key={l} to={h} style={{ fontSize: 13, color: SEC, textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login"    style={{ padding: '6px 16px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: TEXT, textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.08)' }}>Log In</Link>
          <Link to="/register" style={{ padding: '6px 16px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: '#fff', textDecoration: 'none', backgroundColor: ACCENT }}>Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Canvas animation layer */}
        <HeroCanvas />

        {/* Ambient glow orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,130,31,0.18) 0%, transparent 65%)', animation: 'orb-drift-1 14s ease-in-out infinite', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', top: '30%', right: '8%', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)', animation: 'orb-drift-2 18s ease-in-out infinite', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '35%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)', animation: 'orb-drift-1 22s ease-in-out infinite reverse', filter: 'blur(2px)' }} />
        </div>

        {/* Bottom gradient fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, #000 0%, transparent 100%)', zIndex: 2 }} />
        {/* Top fade (for nav) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)', zIndex: 2 }} />

        {/* Floating stock badges */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
          {BADGES.map(b => <FloatingBadge key={b.sym} {...b} />)}
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 8 }}>
            <CapaLogo size={200} />
          </div>
          <p className="hero-text hero-text-1" style={{ fontSize: 'clamp(13px,1.8vw,18px)', fontWeight: 500, letterSpacing: '0.22em', color: ACCENT, textTransform: 'uppercase', margin: '0 0 32px' }}>
            Unstoppable Minds
          </p>
          <h1 className="hero-text hero-text-2" style={{ fontSize: 'clamp(44px,7vw,88px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.04, color: TEXT, marginBottom: 20, textShadow: '0 2px 40px rgba(0,0,0,0.6)' }}>
            The future of<br />investing is here.
          </h1>
          <p className="hero-text hero-text-3" style={{ fontSize: 20, fontWeight: 400, color: SEC, lineHeight: 1.5, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
            Trade global markets from Africa. Real-time data, instant execution, and no monthly fees — ever.
          </p>
          <div className="hero-text hero-text-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 28px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', boxShadow: '0 0 32px rgba(245,130,31,0.45)' }}>
              Start Investing Free <ChevronRight size={16} />
            </Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '14px 28px', borderRadius: 980, backgroundColor: 'rgba(255,255,255,0.08)', color: TEXT, textDecoration: 'none', fontSize: 17, fontWeight: 500, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              Sign In
            </Link>
          </div>
          <p className="hero-text hero-text-4" style={{ fontSize: 12, color: 'rgba(235,235,245,0.3)', margin: '10px 0 0' }}>No minimum deposit · Capital at risk</p>
        </div>
      </section>

      {/* STATS */}
      <FadeSection>
        <section style={{ backgroundColor: '#0d0d0d', padding: '56px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* FEATURES */}
      <FadeSection>
        <section style={{ padding: '88px 24px', maxWidth: 980, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Built for performance</p>
          <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
            Everything you need.<br />Nothing you don't.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ backgroundColor: '#111', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,130,31,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(245,130,31,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon size={22} color={ACCENT} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 600, color: TEXT, marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h3>
                <p style={{ fontSize: 15, color: SEC, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* HOW IT WORKS */}
      <FadeSection>
        <section style={{ backgroundColor: '#080808', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Get started in minutes</p>
            <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
              How Capa works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
              {steps.map(({ icon: Icon, num, title, desc }) => (
                <div key={num} style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(245,130,31,0.1)', border: '1px solid rgba(245,130,31,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon size={24} color={ACCENT} strokeWidth={1.8} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.06em' }}>{num}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: TEXT, margin: '6px 0 8px', letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: SEC, margin: 0, lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* TESTIMONIALS */}
      <FadeSection>
        <section style={{ padding: '88px 24px', maxWidth: 980, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 48, lineHeight: 1.1 }}>
            Trusted by investors across Africa
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ backgroundColor: '#111', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 15, color: SEC, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#f5821f,#ff4500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: TEXT }}>{t.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: SEC }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* CTA */}
      <FadeSection>
        <section style={{ backgroundColor: '#080808', padding: '88px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle glow behind CTA */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,130,31,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, marginBottom: 16, lineHeight: 1.06 }}>
              Start investing today.
            </h2>
            <p style={{ fontSize: 17, color: SEC, marginBottom: 16, maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.55 }}>
              Open your free account in under 10 minutes. No minimum deposit.
            </p>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              {['No monthly fee', 'Regulated platform', 'Instant M-Pesa deposits'].map(f => (
                <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: SEC }}>
                  <Check size={13} color={ACCENT} />{f}
                </span>
              ))}
            </div>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '15px 38px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 600, boxShadow: '0 0 40px rgba(245,130,31,0.4)' }}>
              Create Free Account <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      </FadeSection>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#000', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CapaLogo size={18} />
              </div>
              <p style={{ fontSize: 13, color: SEC, lineHeight: 1.6, margin: 0 }}>Global investing for the African generation.</p>
            </div>
            {[
              { heading: 'Company', links: [['About', '/about'], ['Pricing', '/pricing'], ['Security', '/security'], ['Contact', '/contact']] },
              { heading: 'Legal',   links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['FAQ', '/faq']] },
              { heading: 'Account', links: [['Sign In', '/login'], ['Register', '/register']] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(235,235,245,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{heading}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {links.map(([label, href]) => (
                    <Link key={label} to={href} style={{ fontSize: 14, color: SEC, textDecoration: 'none' }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(235,235,245,0.3)', lineHeight: 1.7 }}>
              © {new Date().getFullYear()} Capa Investments Ltd. All rights reserved. Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results. Capital at risk.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
