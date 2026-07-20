import { Link } from 'react-router-dom';
import { useRef, useState, useCallback, useEffect } from 'react';
import { TrendingUp, Shield, Zap, Globe, ChevronRight, UserCheck, DollarSign, BarChart2, Check } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';
import CapaCIcon from '../components/ui/CapaCIcon';
import { useTheme, THEMES } from '../context/ThemeContext';

const ACCENT = 'var(--accent)';
const TEXT = 'var(--text)';
const SEC = 'var(--text-secondary)';

// ── Sky + water canvas ───────────────────────────────────────
function HeroCanvas({ theme }: { theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const elRaw = canvasRef.current;
    if (!elRaw) return;
    const ctxRaw = elRaw.getContext('2d');
    if (!ctxRaw) return;
    const el  = elRaw  as HTMLCanvasElement;
    const ctx = ctxRaw as CanvasRenderingContext2D;
    let animId: number, t = 0, W = 0, H = 0;

    let skyC: string[], waterC: string[];
    if (theme === 'black') {
      skyC   = ['#0a1628','#0f2d5c','#1a4aad','#2563eb','#3b82f6'];
      waterC = ['#2563eb','#1a4aad','#0f2d5c'];
    } else {
      const bg = (THEMES[theme as keyof typeof THEMES] ?? THEMES.blue).bg;
      skyC   = [bg[0], bg[1], bg[2], bg[3], bg[4]];
      waterC = [bg[4], bg[2], bg[0]];
    }

    function init() {
      const dpr = window.devicePixelRatio || 1;
      W = el.offsetWidth;
      H = el.offsetHeight;
      el.width  = Math.ceil(W * dpr);
      el.height = Math.ceil(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);
      const hy = H * 0.70;

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0,    skyC[0]);
      sky.addColorStop(0.22, skyC[1]);
      sky.addColorStop(0.52, skyC[2]);
      sky.addColorStop(0.80, skyC[3]);
      sky.addColorStop(1,    skyC[4]);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hy);

      // Sun glow
      const sg = ctx.createRadialGradient(W*0.28, hy*0.78, 0, W*0.28, hy*0.78, W*0.38);
      sg.addColorStop(0,    'rgba(255,218,110,0.28)');
      sg.addColorStop(0.45, 'rgba(255,175,55,0.07)');
      sg.addColorStop(1,    'transparent');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

      // Water
      const wg = ctx.createLinearGradient(0, hy, 0, H);
      wg.addColorStop(0,   waterC[0]);
      wg.addColorStop(0.5, waterC[1]);
      wg.addColorStop(1,   waterC[2]);
      ctx.fillStyle = wg; ctx.fillRect(0, hy, W, H - hy);

      // Water shimmer — horizontal gradient-filled rects instead of thin
      // ellipses; fillRect is rendered identically on all browsers including
      // Safari (no sub-pixel ellipse anti-aliasing issue)
      ctx.save();
      for (let i = 0; i < 38; i++) {
        const sx  = ((i * 137.5 + t * 0.35) % W);
        const sy  = hy + ((i * 79.3) % ((H - hy) * 0.65));
        const sa  = (Math.sin(t * 0.055 + i * 1.9) * 0.5 + 0.5) * 0.28;
        const hw  = 10 + (i % 5) * 4; // half-width 10–26 px
        const gr  = ctx.createLinearGradient(sx - hw, 0, sx + hw, 0);
        gr.addColorStop(0,   'rgba(255,255,230,0)');
        gr.addColorStop(0.5, `rgba(255,255,230,${sa})`);
        gr.addColorStop(1,   'rgba(255,255,230,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(sx - hw, sy - 2, hw * 2, 4);
      }
      ctx.restore();

      // Horizon glow
      const hg = ctx.createLinearGradient(0, hy - 18, 0, hy + 24);
      hg.addColorStop(0,   'rgba(255,255,255,0.00)');
      hg.addColorStop(0.5, 'rgba(255,255,255,0.07)');
      hg.addColorStop(1,   'rgba(255,255,255,0.00)');
      ctx.fillStyle = hg; ctx.fillRect(0, hy - 18, W, 42);

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
    const ro = new ResizeObserver(() => { init(); });
    ro.observe(el);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, [theme]); // restart whenever theme changes

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}



// ── Typewriter hook ───────────────────────────────────────────
const TYPED_PHRASES = [
  'Invest in global markets.',
  'Real-time data, instant execution.',
  'No minimum deposit.',
];

function useTypewriter(phrases: string[], typingSpeed = 48, deletingSpeed = 24, pauseMs = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIdx];
    if (!deleting && charIdx < phrase.length) {
      const t = setTimeout(() => setCharIdx(i => i + 1), typingSpeed);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === phrase.length) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => setCharIdx(i => i - 1), deletingSpeed);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx(i => (i + 1) % phrases.length);
    }
  }, [charIdx, deleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs]);

  useEffect(() => {
    setDisplayed(phrases[phraseIdx].slice(0, charIdx));
  }, [charIdx, phraseIdx, phrases]);

  return displayed;
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
// ── Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme } = useTheme();
  const typedText = useTypewriter(TYPED_PHRASES);
  return (
    <div style={{ background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Inject keyframes + mobile overrides */}
      <style>{`
        @keyframes hero-text-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .hero-text { animation: hero-text-in 1s ease both; }
        .hero-text-1 { animation-delay: 0.1s; }
        .hero-text-2 { animation-delay: 0.3s; }
        .hero-text-3 { animation-delay: 0.5s; }
        .hero-text-4 { animation-delay: 0.7s; }

        @media (max-width: 640px) {
          /* Nav: hide middle links, tighten padding */
          .nav-links { display: none !important; }
          .lp-nav { padding: 0 16px !important; }

          /* Push hero content below fixed nav */
          .hero-content { padding-top: 52px !important; }
          .hero-trust-grid { grid-template-columns: repeat(2,1fr) !important; max-width: 340px !important; }

          /* Hero */
          .hero-logo-wrap { margin-bottom: 0px !important; }
          .hero-logo-wrap img { width: min(420px, 92vw) !important; height: auto !important; }
          .hero-tagline { margin-top: -62px !important; }
          .hero-title { font-size: clamp(24px,7vw,48px) !important; letter-spacing: 0.06em !important; margin-bottom: 14px !important; }
          .hero-subtitle { font-size: 15px !important; margin-bottom: 28px !important; }
          .hero-buttons { flex-direction: column !important; align-items: stretch !important; width: 100% !important; max-width: 320px !important; }
          .hero-buttons a { justify-content: center !important; padding: 13px 20px !important; font-size: 15px !important; }

          /* Stats: 2×2 */
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid var(--card-border) !important; padding: 28px 12px !important; }
          .stats-grid > div:nth-child(odd)  { border-right: 1px solid var(--card-border) !important; }
          .stats-grid > div:nth-child(3),
          .stats-grid > div:nth-child(4)    { border-bottom: none !important; }

          /* Sections: less vertical padding */
          .lp-section-pad { padding-top: 60px !important; padding-bottom: 60px !important; }
          .lp-section-pad-sm { padding-top: 48px !important; padding-bottom: 48px !important; }

          /* Features: tighter card padding */
          .feature-card { padding: 22px !important; }

          /* How it works: single column */
          .steps-grid { grid-template-columns: 1fr !important; gap: 36px !important; text-align: left !important; }
          .step-icon  { margin: 0 0 12px !important; }

          /* CTA */
          .cta-features { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; padding: 0 8px !important; }
          .cta-btn { width: 100% !important; max-width: 320px !important; justify-content: center !important; padding: 14px 24px !important; font-size: 16px !important; }

          /* Footer */
          .lp-footer { padding: 40px 20px 28px !important; }
        }

        @media (max-width: 380px) {
          .hero-title { font-size: 22px !important; }
          .hero-logo-wrap img { width: min(200px, 88vw) !important; height: auto !important; }
          .hero-tagline { margin-top: -34px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'saturate(180%) blur(24px)', WebkitBackdropFilter: 'saturate(180%) blur(24px)', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CapaLogo size={44} />
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }} className="nav-links">
          {[['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
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
        <HeroCanvas theme={theme} />

        {/* Bottom gradient fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, var(--bg-1) 0%, transparent 100%)', zIndex: 2 }} />
        {/* Top fade (for nav) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, var(--sidebar-bg) 0%, transparent 100%)', zIndex: 2 }} />

        {/* Hero content */}
        <div className="hero-content" style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="hero-logo-wrap hero-text hero-text-2" style={{ marginBottom: -32 }}>
            <CapaLogo size={260} />
          </div>

          <p className="hero-text hero-text-3 hero-subtitle" style={{ fontSize: 20, fontWeight: 400, color: SEC, lineHeight: 1.5, marginBottom: 24, maxWidth: 520, margin: '0 auto 24px', minHeight: '1.5em' }}>
            {typedText}<span style={{ display: 'inline-block', width: 2, height: '1em', background: SEC, marginLeft: 2, verticalAlign: 'middle', animation: 'cursor-blink 0.9s step-end infinite' }} />
          </p>

          {/* Trust pillars */}
          <div className="hero-text hero-text-3 hero-trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, maxWidth: 720, width: '100%', margin: '0 auto 32px' }}>
            {[
              { t: 'CMA Regulated',      d: 'Licensed by the CMA Kenya' },
              { t: 'Bank-Grade Security', d: 'AES-256 & MFA protected' },
              { t: 'Real-Time Execution', d: 'NYSE · NASDAQ · LSE · NSE' },
              { t: 'No Hidden Fees',      d: '0.5% trade fee, nothing else' },
            ].map(({ t, d }) => (
              <div key={t} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: TEXT, margin: '0 0 2px', lineHeight: 1.3 }}>{t}</p>
                <p style={{ fontSize: 10, color: SEC, margin: 0, lineHeight: 1.4 }}>{d}</p>
              </div>
            ))}
          </div>

          <div className="hero-text hero-text-4 hero-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 28px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', boxShadow: '0 0 32px rgba(var(--accent-rgb),0.45)' }}>
              Start Investing Free <ChevronRight size={16} />
            </Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '14px 28px', borderRadius: 980, backgroundColor: 'rgba(255,255,255,0.08)', color: TEXT, textDecoration: 'none', fontSize: 17, fontWeight: 500, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              Sign In
            </Link>
          </div>
          <p className="hero-text hero-text-4" style={{ fontSize: 12, color: 'rgba(235,235,245,0.3)', margin: '10px 0 0' }}>No minimum deposit</p>
        </div>
      </section>

      {/* STATS */}
      <FadeSection>
        <section style={{ backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '56px 24px', borderTop: '1px solid var(--card-border)' }}>
          <div className="stats-grid" style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid var(--card-border)' : 'none' }}>
                <div style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* FEATURES */}
      <FadeSection>
        <section className="lp-section-pad" style={{ padding: '88px 24px', maxWidth: 980, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Built for performance</p>
          <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
            Everything you need.<br />Nothing you don't.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card" style={{ backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: 32, border: '1px solid var(--card-border)', transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb),0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--card-border)')}>
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
        <section className="lp-section-pad-sm" style={{ backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '80px 24px', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Get started in minutes</p>
            <h2 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 48, lineHeight: 1.08 }}>
              How Capa works
            </h2>
            <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
              {steps.map(({ icon: Icon, num, title, desc }) => (
                <div key={num} style={{ textAlign: 'center' }}>
                  <div className="step-icon" style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(var(--accent-rgb),0.1)', border: '1px solid rgba(var(--accent-rgb),0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
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

      {/* SOCIAL PROOF */}
      <FadeSection>
        <section className="lp-section-pad" style={{ padding: '88px 24px', maxWidth: 980, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Why investors choose Capa</p>
          <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
            Built on trust. Backed by data.
          </h2>
          {/* Trust pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 64 }}>
            {[
              { label: 'CMA Regulated', desc: 'Licensed by the Capital Markets Authority of Kenya.' },
              { label: 'Bank-Grade Security', desc: 'AES-256 encryption, MFA, and segregated custodian accounts.' },
              { label: 'Real-Time Execution', desc: 'Orders placed in milliseconds on NYSE, NASDAQ, LSE & NSE.' },
              { label: 'No Hidden Fees', desc: 'One transparent 0.5% trade fee. No inactivity or withdrawal charges.' },
            ].map(({ label, desc }) => (
              <div key={label} style={{ textAlign: 'center', padding: '28px 20px', borderRadius: 20, backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: '-0.01em' }}>{label}</p>
                <p style={{ fontSize: 13, color: SEC, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
          {/* Testimonials */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { name: 'Amara N.', role: 'Software Engineer, Nairobi', quote: 'I finally found a platform that lets me invest in Apple and Safaricom from the same account. Setup took 8 minutes.' },
              { name: 'Brian K.', role: 'Entrepreneur, Mombasa', quote: 'The limit order feature is a game changer. I set my price, go about my day, and get notified when it fills.' },
              { name: 'Wanjiru M.', role: 'Finance Analyst, Kampala', quote: 'Portfolio performance charts and real-time data — everything I expected from a global-grade investing app.' },
            ].map(({ name, role, quote }) => (
              <div key={name} style={{ padding: '28px 24px', borderRadius: 20, backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: 14, color: SEC, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>{name}</p>
                    <p style={{ fontSize: 11, color: SEC, margin: 0 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* CTA */}
      <FadeSection>
        <section style={{ backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '88px 24px', textAlign: 'center', borderTop: '1px solid var(--card-border)', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle glow behind CTA */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(var(--accent-rgb),0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, marginBottom: 16, lineHeight: 1.06 }}>
              Start investing today.
            </h2>
            <p style={{ fontSize: 17, color: SEC, marginBottom: 16, maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.55 }}>
              Open your free account in under 10 minutes. No minimum deposit.
            </p>
            <div className="cta-features" style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              {['Regulated platform', 'Instant M-Pesa deposits'].map(f => (
                <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: SEC }}>
                  <Check size={13} color={ACCENT} />{f}
                </span>
              ))}
            </div>
            <Link to="/register" className="cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '15px 38px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 600, boxShadow: '0 0 40px rgba(var(--accent-rgb),0.4)' }}>
              Create Free Account <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      </FadeSection>

      {/* FOOTER */}
      <footer className="lp-footer" style={{ backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--card-border)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CapaLogo size={18} />
              </div>
              <p style={{ fontSize: 13, color: SEC, lineHeight: 1.6, margin: 0 }}>Global investing for the African generation.</p>
            </div>
            {[
              { heading: 'Company',  links: [['About', '/about'], ['Contact', '/contact']] },
              { heading: 'Legal',    links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Security', '/security']] },
              { heading: 'Account',  links: [['Sign In', '/login'], ['Register', '/register']] },
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
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 24 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(235,235,245,0.3)', lineHeight: 1.7 }}>
              © {new Date().getFullYear()} Capa Investments Ltd. All rights reserved. Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
