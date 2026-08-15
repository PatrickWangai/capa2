import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { TrendingUp, Shield, Zap, UserCheck, DollarSign, BarChart2, Check, ChevronRight, X } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';
import CapaCCircle from '../components/ui/CapaCCircle';
import { useTheme, THEMES, COLOUR_THEMES, type ThemeName } from '../context/ThemeContext';

const ACCENT = 'var(--accent)';
const TEXT   = 'var(--text)';
const SEC    = 'var(--text-secondary)';

// ── Canvas hero ─────────────────────────────────────────────────
function HeroCanvas({ theme }: { theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const elRaw = canvasRef.current; if (!elRaw) return;
    const ctxRaw = elRaw.getContext('2d'); if (!ctxRaw) return;
    const el  = elRaw  as HTMLCanvasElement;
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
      const hy = H * 0.68;
      const sky = ctx.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0, skyC[0]); sky.addColorStop(0.25, skyC[1]);
      sky.addColorStop(0.55, skyC[2]); sky.addColorStop(0.82, skyC[3]);
      sky.addColorStop(1, skyC[4]);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hy);
      const sg = ctx.createRadialGradient(W * 0.28, hy * 0.78, 0, W * 0.28, hy * 0.78, W * 0.38);
      sg.addColorStop(0, 'rgba(255,218,110,0.22)'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      const wg = ctx.createLinearGradient(0, hy, 0, H);
      wg.addColorStop(0, waterC[0]); wg.addColorStop(0.5, waterC[1]); wg.addColorStop(1, waterC[2]);
      ctx.fillStyle = wg; ctx.fillRect(0, hy, W, H - hy);
      ctx.save();
      for (let i = 0; i < 38; i++) {
        const sx = ((i * 137.5 + t * 0.35) % W);
        const sy = hy + ((i * 79.3) % ((H - hy) * 0.65));
        const sa = (Math.sin(t * 0.055 + i * 1.9) * 0.5 + 0.5) * 0.26;
        const hw = 10 + (i % 5) * 4;
        const gr = ctx.createLinearGradient(sx - hw, 0, sx + hw, 0);
        gr.addColorStop(0, 'rgba(255,255,230,0)'); gr.addColorStop(0.5, `rgba(255,255,230,${sa})`); gr.addColorStop(1, 'rgba(255,255,230,0)');
        ctx.fillStyle = gr; ctx.fillRect(sx - hw, sy - 2, hw * 2, 4);
      }
      ctx.restore();
      const ov = ctx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0, 'rgba(0,0,0,0.62)'); ov.addColorStop(0.45, 'rgba(0,0,0,0.22)');
      ov.addColorStop(0.7, 'rgba(0,0,0,0.08)'); ov.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);
      animId = requestAnimationFrame(draw);
    }
    init(); animId = requestAnimationFrame(draw);
    const ro = new ResizeObserver(init); ro.observe(el);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, [theme]);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}

// ── Theme picker (digitalists-style) ────────────────────────────
function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const current = THEMES[theme];

  return (
    <div style={{ position: 'fixed', bottom: 48, right: 20, zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      {open && (
        <div style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 176 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Theme</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0 }}><X size={13} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {COLOUR_THEMES.map(t => {
              const th = THEMES[t];
              const active = t === theme;
              return (
                <button key={t} onClick={() => setTheme(t)} title={th.label}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: th.swatch, border: active ? '2.5px solid #fff' : '2px solid transparent', cursor: 'pointer', outline: 'none', boxShadow: active ? '0 0 0 1px rgba(255,255,255,0.3)' : 'none', transition: 'transform 0.15s', transform: active ? 'scale(1.18)' : 'scale(1)' }}
                />
              );
            })}
          </div>
          <div style={{ marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 8 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{current.accent.toUpperCase()}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>{current.label}</span>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 980, padding: '7px 14px 7px 10px', cursor: 'pointer', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: current.accent, boxShadow: `0 0 8px ${current.accent}55` }} />
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>{current.accent.toUpperCase()}</span>
      </button>
    </div>
  );
}

// ── Bottom ticker (lamalama-style) ───────────────────────────────
const TICKER_ITEMS = [
  'NSE · SCOM +2.4%', 'NSE · EQTY +1.1%', 'NSE · KCB −0.3%', 'NSE · SAFARICOM +2.4%',
  'NSE · BAMB +0.8%', 'INVEST GLOBALLY FROM KENYA', 'NSE · COOP +1.7%', 'M-PESA DEPOSITS',
  'NSE · EABL −0.5%', 'ZERO HIDDEN FEES', 'NSE · NCBA +0.4%', 'CMA REGULATED',
];

function BottomTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, height: 36, background: 'rgba(5,5,5,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track { display: flex; animation: ticker-scroll 40s linear infinite; white-space: nowrap; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.40)', paddingRight: 0 }}>
            <span style={{ padding: '0 28px' }}>{item}</span>
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Fade-in section ──────────────────────────────────────────────
function FadeSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: 0, transform: 'translateY(48px)', transition: 'opacity 0.8s ease, transform 0.8s ease', ...style }}>
      {children}
    </div>
  );
}

// ── Data ─────────────────────────────────────────────────────────
const features = [
  { icon: TrendingUp, title: 'Live Markets',      desc: 'Real-time prices across global markets. Never miss a move.' },
  { icon: Shield,     title: 'Capital Protected', desc: 'Your assets are held by a regulated custodian, segregated from company funds.' },
  { icon: Zap,        title: 'Instant Execution', desc: 'Orders filled in milliseconds. Your timing, your price, zero slippage.' },
];
const steps = [
  { icon: UserCheck,  num: '01', title: 'Create your account',  desc: 'Register with your email. Takes under 2 minutes.' },
  { icon: Shield,     num: '02', title: 'Verify your identity', desc: 'Upload your ID and a selfie. KYC typically approved same day.' },
  { icon: DollarSign, num: '03', title: 'Fund your account',    desc: 'Deposit via M-Pesa, bank transfer, or card. Funds appear instantly.' },
  { icon: BarChart2,  num: '04', title: 'Start investing',      desc: 'Browse global markets and place your first trade in seconds.' },
];

// ── Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme } = useTheme();

  return (
    <div style={{ background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes hero-in  { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hero-in2 { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        .h-line1 { animation: hero-in  1.0s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .h-line2 { animation: hero-in  1.0s cubic-bezier(0.16,1,0.3,1) 0.28s both; }
        .h-sub   { animation: hero-in2 0.9s cubic-bezier(0.16,1,0.3,1) 0.52s both; }
        .h-cta   { animation: hero-in2 0.9s cubic-bezier(0.16,1,0.3,1) 0.68s both; }

        .nav-pill:hover { background: rgba(255,255,255,0.14) !important; }
        .feature-card:hover { border-color: rgba(var(--accent-rgb),0.35) !important; transform: translateY(-2px); }
        .feature-card { transition: border-color 0.2s, transform 0.2s; }

        @media (max-width:640px) {
          .lp-nav-links { display:none !important; }
          .lp-nav { padding:0 16px !important; }
          .hero-headline { font-size: clamp(44px,13vw,80px) !important; letter-spacing:-0.03em !important; }
          .hero-sub { font-size:16px !important; }
          .hero-btns { flex-direction:column !important; align-items:stretch !important; max-width:300px !important; }
          .hero-btns a { justify-content:center !important; }
          .steps-grid { grid-template-columns:1fr !important; }
          .trust-grid { grid-template-columns:1fr !important; }
          .lp-section { padding:64px 20px !important; }
          .hero-logo { display:none !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav" style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', background:'rgba(0,0,0,0.55)', backdropFilter:'saturate(180%) blur(24px)', WebkitBackdropFilter:'saturate(180%) blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <CapaCCircle size={32} />
          <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase' }}>[ Platform ]</span>
        </div>
        <div className="lp-nav-links" style={{ display:'flex', gap:24, alignItems:'center' }}>
          {[['About','/about'],['Contact','/contact']].map(([l,h]) => (
            <Link key={l} to={h} style={{ fontSize:13, color:'rgba(255,255,255,0.50)', textDecoration:'none', letterSpacing:'0.02em' }}>{l}</Link>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/login"    className="nav-pill" style={{ padding:'6px 16px', borderRadius:980, fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.75)', textDecoration:'none', background:'rgba(255,255,255,0.08)', transition:'background 0.2s' }}>Log In</Link>
          <Link to="/register" style={{ padding:'6px 16px', borderRadius:980, fontSize:13, fontWeight:600, color:'#fff', textDecoration:'none', background:ACCENT }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position:'relative', height:'100vh', minHeight:640, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <HeroCanvas theme={theme} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:'linear-gradient(to top, var(--bg-1) 0%, transparent 100%)', zIndex:2 }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:130, background:'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)', zIndex:2 }} />

        {/* Bottom-left hero badge */}
        <div style={{ position:'absolute', bottom:52, left:28, zIndex:10, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:ACCENT, boxShadow:`0 0 10px var(--accent)` }} />
          <span style={{ fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.40)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Live Markets</span>
        </div>

        {/* Hero text — centered */}
        <div style={{ position:'relative', zIndex:10, textAlign:'center', padding:'0 24px', maxWidth:960, width:'100%' }}>

          {/* Eyebrow */}
          <p className="h-line1" style={{ fontFamily:'monospace', fontSize:11, color:ACCENT, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <span style={{ display:'inline-block', width:20, height:1, background:ACCENT, opacity:0.6 }} />
            Capa Investment Platform
            <span style={{ display:'inline-block', width:20, height:1, background:ACCENT, opacity:0.6 }} />
          </p>

          {/* Big headline */}
          <h1 className="hero-headline h-line2" style={{ fontSize:'clamp(56px,9vw,120px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:0.95, color:'#fff', marginBottom:28, textWrap:'balance' } as any}>
            Invest in Kenya's<br />
            <span style={{ color:ACCENT }}>Global Markets</span>
          </h1>

          {/* Sub */}
          <p className="hero-sub h-sub" style={{ fontSize:18, fontWeight:400, color:'rgba(255,255,255,0.60)', lineHeight:1.55, maxWidth:480, margin:'0 auto 36px' }}>
            Real-time data, instant execution, M-Pesa deposits.
            Open your account in under 10 minutes.
          </p>

          {/* CTAs */}
          <div className="hero-btns h-cta" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'14px 30px', borderRadius:980, background:ACCENT, color:'#fff', textDecoration:'none', fontSize:16, fontWeight:600, letterSpacing:'-0.01em' }}>
              Start Investing Free <ChevronRight size={15} />
            </Link>
            <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'14px 30px', borderRadius:980, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:16, fontWeight:500, backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.12)' }}>
              Sign In
            </Link>
          </div>
          <p style={{ marginTop:14, fontSize:12, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', letterSpacing:'0.04em' }}>NO MINIMUM DEPOSIT · CMA REGULATED</p>
        </div>

        {/* Logo - top right corner of hero */}
        <div className="hero-logo" style={{ position:'absolute', top:72, right:28, zIndex:10, opacity:0.35 }}>
          <CapaLogo size={80} />
        </div>
      </section>

      {/* STATS BAR */}
      <FadeSection>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.30)', backdropFilter:'blur(12px)' }}>
          <div style={{ maxWidth:980, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {[
              { val:'15+',   label:'Global Markets' },
              { val:'0.5%',  label:'Trade Fee' },
              { val:'<2m',   label:'Account Setup' },
              { val:'24/7',  label:'Portfolio Access' },
            ].map(({ val, label }, i) => (
              <div key={label} style={{ padding:'28px 16px', textAlign:'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p style={{ fontSize:'clamp(22px,3.5vw,34px)', fontWeight:700, color:ACCENT, margin:0, letterSpacing:'-0.03em', fontVariantNumeric:'tabular-nums' }}>{val}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', margin:'4px 0 0', letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'monospace' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* FEATURES */}
      <FadeSection>
        <section className="lp-section" style={{ padding:'96px 24px', maxWidth:980, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:14 }}>
            <span style={{ fontFamily:'monospace', fontSize:10, color:ACCENT, letterSpacing:'0.12em', textTransform:'uppercase' }}>[ 01 ]</span>
            <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Built for performance</span>
          </div>
          <h2 style={{ fontSize:'clamp(32px,5vw,60px)', fontWeight:700, letterSpacing:'-0.035em', color:'#fff', marginBottom:52, lineHeight:1.05, maxWidth:600 }}>
            Everything you need.<br />Nothing you don't.
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card" style={{ background:'var(--card-bg)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderRadius:20, padding:32, border:'1px solid var(--card-border)', cursor:'default' }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(var(--accent-rgb),0.10)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                  <Icon size={20} color={ACCENT} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize:18, fontWeight:600, color:'#fff', marginBottom:8, letterSpacing:'-0.02em' }}>{title}</h3>
                <p style={{ fontSize:14, color:SEC, lineHeight:1.65, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* HOW IT WORKS */}
      <FadeSection>
        <section style={{ background:'rgba(0,0,0,0.25)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'88px 24px' }}>
          <div style={{ maxWidth:960, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:14 }}>
              <span style={{ fontFamily:'monospace', fontSize:10, color:ACCENT, letterSpacing:'0.12em', textTransform:'uppercase' }}>[ 02 ]</span>
              <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Get started in minutes</span>
            </div>
            <h2 style={{ fontSize:'clamp(28px,5vw,56px)', fontWeight:700, letterSpacing:'-0.035em', color:'#fff', marginBottom:56, lineHeight:1.05, maxWidth:480 }}>
              How Capa works
            </h2>
            <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:40 }}>
              {steps.map(({ icon: Icon, num, title, desc }) => (
                <div key={num}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(var(--accent-rgb),0.10)', border:'1px solid rgba(var(--accent-rgb),0.20)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={20} color={ACCENT} strokeWidth={1.8} />
                    </div>
                    <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.06em' }}>{num}</span>
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:600, color:'#fff', margin:'0 0 8px', letterSpacing:'-0.01em' }}>{title}</h3>
                  <p style={{ fontSize:14, color:SEC, margin:0, lineHeight:1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* TRUST */}
      <FadeSection>
        <section className="lp-section" style={{ padding:'88px 24px', maxWidth:980, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:14 }}>
            <span style={{ fontFamily:'monospace', fontSize:10, color:ACCENT, letterSpacing:'0.12em', textTransform:'uppercase' }}>[ 03 ]</span>
            <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Why investors choose Capa</span>
          </div>
          <h2 style={{ fontSize:'clamp(28px,5vw,56px)', fontWeight:700, letterSpacing:'-0.035em', color:'#fff', marginBottom:52, lineHeight:1.05, maxWidth:520 }}>
            Built on trust.<br />Backed by data.
          </h2>
          <div className="trust-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
            {[
              { label:'CMA Regulated', desc:'Licensed by the Capital Markets Authority of Kenya.' },
              { label:'Bank-Grade Security', desc:'AES-256 encryption, MFA, and segregated custodian accounts.' },
              { label:'No Hidden Fees', desc:'One transparent 0.5% trade fee. No inactivity or withdrawal charges.' },
            ].map(({ label, desc }) => (
              <div key={label} style={{ padding:'28px 24px', borderRadius:20, background:'var(--card-bg)', border:'1px solid var(--card-border)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:ACCENT, marginBottom:14 }} />
                <p style={{ fontSize:15, fontWeight:600, color:'#fff', marginBottom:8, letterSpacing:'-0.01em' }}>{label}</p>
                <p style={{ fontSize:13, color:SEC, lineHeight:1.65, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* CTA */}
      <FadeSection>
        <section style={{ background:'rgba(0,0,0,0.30)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', padding:'96px 24px', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.06)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:700, height:350, borderRadius:'50%', background:'radial-gradient(ellipse, rgba(var(--accent-rgb),0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', maxWidth:640, margin:'0 auto' }}>
            <h2 style={{ fontSize:'clamp(36px,6vw,80px)', fontWeight:800, letterSpacing:'-0.04em', color:'#fff', marginBottom:16, lineHeight:0.95 }}>
              Start investing<br /><span style={{ color:ACCENT }}>today.</span>
            </h2>
            <p style={{ fontSize:17, color:SEC, marginBottom:28, maxWidth:400, margin:'0 auto 28px', lineHeight:1.55 }}>
              Open your free account in under 10 minutes. No minimum deposit.
            </p>
            <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginBottom:20 }}>
              {['Regulated platform', 'Instant M-Pesa deposits'].map(f => (
                <span key={f} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:13, color:SEC }}>
                  <Check size={13} color={ACCENT} />{f}
                </span>
              ))}
            </div>
            <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'15px 38px', borderRadius:980, background:ACCENT, color:'#fff', textDecoration:'none', fontSize:17, fontWeight:600 }}>
              Create Free Account <ChevronRight size={17} />
            </Link>
          </div>
        </section>
      </FadeSection>

      {/* FOOTER */}
      <footer style={{ background:'rgba(0,0,0,0.50)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'52px 24px 72px' }}>
        <div style={{ maxWidth:980, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:32, marginBottom:40 }}>
            <div>
              <CapaLogo size={16} />
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:12, lineHeight:1.7, maxWidth:200 }}>
                Invest in Kenya's global markets. Regulated. Simple. Fast.
              </p>
            </div>
            {[
              { heading:'Company', links:[['About','/about'],['Contact','/contact']] },
              { heading:'Legal',   links:[['Terms','/terms'],['Privacy','/privacy'],['Security','/security']] },
              { heading:'Account', links:[['Sign In','/login'],['Register','/register']] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p style={{ fontFamily:'monospace', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.10em', marginBottom:14 }}>{heading}</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {links.map(([label,href]) => (
                    <Link key={label} to={href} style={{ fontSize:14, color:'rgba(255,255,255,0.45)', textDecoration:'none' }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.22)', fontFamily:'monospace', letterSpacing:'0.02em' }}>
              © {new Date().getFullYear()} CAPA INVESTMENTS LTD · ALL RIGHTS RESERVED
            </p>
            <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.15)', fontFamily:'monospace' }}>
              INVESTING INVOLVES RISK
            </p>
          </div>
        </div>
      </footer>

      {/* Floating theme picker */}
      <ThemePicker />

      {/* Bottom ticker */}
      <BottomTicker />
    </div>
  );
}
