import { Link } from 'react-router-dom';
import { useRef, useState, useCallback, useEffect } from 'react';
import { TrendingUp, Shield, Zap, Globe, ChevronRight, UserCheck, DollarSign, BarChart2, Check } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';

const ACCENT = 'var(--accent)';
const TEXT    = '#ffffff';
const SEC     = 'rgba(235,235,245,0.6)';

// ── Dreamy sky canvas ────────────────────────────────────────
interface SkyCloud { x: number; y: number; drift: number; alpha: number; puffs: { dx: number; dy: number; r: number }[]; }
interface SkyBird  { x: number; y: number; spd: number; sz: number; ph: number; fp: number; type: 0 | 1; }

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const elRaw = canvasRef.current;
    if (!elRaw) return;
    const ctxRaw = elRaw.getContext('2d');
    if (!ctxRaw) return;
    const el  = elRaw  as HTMLCanvasElement;
    const ctx = ctxRaw as CanvasRenderingContext2D;
    let animId: number, t = 0, W = 0, H = 0;
    let clouds: SkyCloud[] = [], birds: SkyBird[] = [];

    function init() {
      W = el.width  = el.offsetWidth;
      H = el.height = el.offsetHeight;
      clouds = [
        { x: W*0.10, y: H*0.18, drift: 0.08, alpha: 0.88,
          puffs: [{dx:0,dy:0,r:96},{dx:82,dy:-24,r:74},{dx:-52,dy:18,r:68},
                  {dx:148,dy:6,r:58},{dx:-98,dy:32,r:52},{dx:50,dy:-60,r:64},{dx:188,dy:-8,r:46}] },
        { x: W*0.73, y: H*0.30, drift: 0.05, alpha: 0.78,
          puffs: [{dx:0,dy:0,r:72},{dx:62,dy:-16,r:58},{dx:-40,dy:22,r:52},
                  {dx:102,dy:8,r:46},{dx:-78,dy:14,r:44}] },
        { x: W*0.50, y: H*0.07, drift: 0.06, alpha: 0.52,
          puffs: [{dx:0,dy:0,r:48},{dx:38,dy:-8,r:36},{dx:-28,dy:10,r:32}] },
      ];
      birds = Array.from({ length: 9 }, (_, i) => ({
        x: Math.random() * W,
        y: H * 0.20 + Math.random() * H * 0.45,
        spd: 0.25 + Math.random() * 0.55,
        sz:  5 + Math.random() * 16,
        ph:  Math.random() * Math.PI * 2,
        fp:  0.035 + Math.random() * 0.03,
        type: (i < 6 ? 0 : 1) as 0 | 1,
      }));
    }

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);
      const hy = H * 0.70;

      // Sky — reads CSS theme variables so colour changes with the theme
      const cs = getComputedStyle(document.documentElement);
      const sky = ctx.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0,    cs.getPropertyValue('--bg-1').trim() || '#0a1628');
      sky.addColorStop(0.22, cs.getPropertyValue('--bg-2').trim() || '#0f2d5c');
      sky.addColorStop(0.52, cs.getPropertyValue('--bg-3').trim() || '#1a4aad');
      sky.addColorStop(0.80, cs.getPropertyValue('--bg-4').trim() || '#2563eb');
      sky.addColorStop(1,    cs.getPropertyValue('--bg-5').trim() || '#3b82f6');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hy);

      // Sun glow
      const sg = ctx.createRadialGradient(W*0.28, hy*0.78, 0, W*0.28, hy*0.78, W*0.38);
      sg.addColorStop(0,    'rgba(255,218,110,0.30)');
      sg.addColorStop(0.45, 'rgba(255,175,55,0.08)');
      sg.addColorStop(1,    'transparent');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

      // Light rays
      ctx.save(); ctx.globalAlpha = 0.04 + Math.sin(t * 0.008) * 0.008;
      const rx = W*0.28, ry = hy*0.60;
      for (let i = 0; i < 7; i++) {
        const a = -0.42 + i*0.13 + Math.sin(t*0.007 + i*0.8)*0.025;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(a)*W*1.6,       ry + Math.sin(a)*H*1.4);
        ctx.lineTo(rx + Math.cos(a+0.055)*W*1.6, ry + Math.sin(a+0.055)*H*1.4);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,240,165,1)'; ctx.fill();
      }
      ctx.restore();

      // Clouds
      for (const c of clouds) {
        const ox = Math.sin(t*0.006*c.drift + c.x*0.001)*10;
        const oy = Math.sin(t*0.004*c.drift)*4;
        for (const p of c.puffs) {
          const px = c.x + p.dx + ox, py = c.y + p.dy + oy;
          const g = ctx.createRadialGradient(px, py + p.r*0.15, 0, px, py, p.r);
          g.addColorStop(0,    `rgba(255,242,205,${c.alpha})`);
          g.addColorStop(0.35, `rgba(250,228,158,${c.alpha*0.88})`);
          g.addColorStop(0.70, `rgba(200,225,230,${c.alpha*0.44})`);
          g.addColorStop(1,    'rgba(140,200,212,0)');
          ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI*2);
          ctx.fillStyle = g; ctx.fill();
        }
      }

      // Water
      const wg = ctx.createLinearGradient(0, hy, 0, H);
      wg.addColorStop(0,   '#28cfbc');
      wg.addColorStop(0.5, '#18aaa0');
      wg.addColorStop(1,   '#0a6c60');
      ctx.fillStyle = wg; ctx.fillRect(0, hy, W, H-hy);

      // Shimmer
      ctx.save();
      for (let i = 0; i < 38; i++) {
        const sx = ((i*137.5 + t*0.4) % W);
        const sy = hy + ((i*73.1) % ((H-hy)*0.55));
        const sa = (Math.sin(t*0.06 + i*1.7)*0.5 + 0.5)*0.48;
        ctx.beginPath(); ctx.ellipse(sx, sy, 9+(i%4)*3, 1.5, 0, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,200,${sa})`; ctx.fill();
      }
      ctx.restore();

      // Grass
      const gg = ctx.createLinearGradient(0, H*0.86, 0, H);
      gg.addColorStop(0, '#52b018'); gg.addColorStop(1, '#2c6e10');
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.moveTo(0, H*0.88);
      for (let x = 0; x <= W; x += 40) ctx.lineTo(x, H*0.86 + Math.sin(x*0.04 + t*0.015)*6);
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

      // Creatures
      for (const b of birds) {
        b.x += b.spd;
        if (b.x > W + 100) b.x = -100;
        b.ph += b.fp;
        const wing = Math.sin(b.ph) * b.sz * 0.65;
        ctx.save();
        ctx.globalAlpha = 0.50;
        ctx.fillStyle = ctx.strokeStyle = '#0a2830';
        ctx.lineWidth = b.sz * 0.16;
        if (b.type === 0) {
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.bezierCurveTo(b.x-b.sz*1.6, b.y-wing,      b.x-b.sz*3.0, b.y+wing*0.25, b.x-b.sz*3.8, b.y+wing*0.45);
          ctx.bezierCurveTo(b.x-b.sz*2.6, b.y+wing*0.75, b.x-b.sz*0.4, b.y+b.sz*0.3,  b.x, b.y);
          ctx.bezierCurveTo(b.x+b.sz*0.4, b.y+b.sz*0.3,  b.x+b.sz*2.6, b.y+wing*0.75, b.x+b.sz*3.8, b.y+wing*0.45);
          ctx.bezierCurveTo(b.x+b.sz*3.0, b.y+wing*0.25, b.x+b.sz*1.6, b.y-wing,      b.x, b.y);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(b.x-b.sz*0.3, b.y+b.sz*0.2);
          ctx.bezierCurveTo(b.x-b.sz*0.6, b.y+b.sz*1.1, b.x-b.sz*0.2, b.y+b.sz*1.9, b.x-b.sz*0.15, b.y+b.sz*2.3);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(b.x-b.sz*0.1, b.y); ctx.quadraticCurveTo(b.x-b.sz*0.9, b.y-wing, b.x-b.sz*1.7, b.y-wing*0.4);
          ctx.moveTo(b.x+b.sz*0.1, b.y); ctx.quadraticCurveTo(b.x+b.sz*0.9, b.y-wing, b.x+b.sz*1.7, b.y-wing*0.4);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Text-legibility overlay
      const ov = ctx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0,    'rgba(0,0,0,0.54)');
      ov.addColorStop(0.40, 'rgba(0,0,0,0.18)');
      ov.addColorStop(0.65, 'rgba(0,0,0,0.06)');
      ov.addColorStop(1,    'rgba(0,0,0,0.42)');
      ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    init(); animId = requestAnimationFrame(draw);
    const ro = new ResizeObserver(init);
    ro.observe(el);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
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
    <div style={{ background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Inject keyframes */}
      <style>{`
        @keyframes hero-text-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-text { animation: hero-text-in 1s ease both; }
        .hero-text-1 { animation-delay: 0.1s; }
        .hero-text-2 { animation-delay: 0.3s; }
        .hero-text-3 { animation-delay: 0.5s; }
        .hero-text-4 { animation-delay: 0.7s; }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', backgroundColor: 'rgba(8,46,60,0.70)', backdropFilter: 'saturate(180%) blur(24px)', WebkitBackdropFilter: 'saturate(180%) blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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

        {/* Bottom gradient fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, var(--bg-1) 0%, transparent 100%)', zIndex: 2 }} />
        {/* Top fade (for nav) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, rgba(8,46,60,0.5) 0%, transparent 100%)', zIndex: 2 }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 8 }}>
            <CapaLogo size={200} />
          </div>
          <h1 className="hero-text hero-text-2" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(36px,6vw,80px)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT, textShadow: '0 2px 40px rgba(0,0,0,0.6)', margin: '0 0 20px' }}>
            Unstoppable Minds
          </h1>
          <p className="hero-text hero-text-3" style={{ fontSize: 20, fontWeight: 400, color: SEC, lineHeight: 1.5, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
            Trade global markets from Africa. Real-time data, instant execution, and no monthly fees — ever.
          </p>
          <div className="hero-text hero-text-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 28px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', boxShadow: '0 0 32px rgba(var(--accent-rgb),0.45)' }}>
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
        <section style={{ backgroundColor: 'rgba(8,46,60,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '56px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
              <div key={title} style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.10)', transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(var(--accent-rgb),0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
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
        <section style={{ backgroundColor: 'rgba(8,46,60,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Get started in minutes</p>
            <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
              How Capa works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
              {steps.map(({ icon: Icon, num, title, desc }) => (
                <div key={num} style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(var(--accent-rgb),0.1)', border: '1px solid rgba(var(--accent-rgb),0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
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
              <div key={t.name} style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.10)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 15, color: SEC, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
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
        <section style={{ backgroundColor: 'rgba(8,46,60,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '88px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle glow behind CTA */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(var(--accent-rgb),0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
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
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '15px 38px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 600, boxShadow: '0 0 40px rgba(var(--accent-rgb),0.4)' }}>
              Create Free Account <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      </FadeSection>

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'rgba(8,46,60,0.80)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '48px 24px 32px' }}>
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
