import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { TrendingUp, Shield, Zap, UserCheck, DollarSign, BarChart2, Check, ArrowUpRight } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';
import CapaCCircle from '../components/ui/CapaCCircle';

const ACCENT = 'var(--accent)';
const TEXT = 'var(--text)';
const SEC = 'var(--text-secondary)';

const HERO_TEXT = 'Invest in global markets with real-time data and instant execution.';

function useTypeOnce(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (displayed.length >= text.length) return;
    const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
    return () => clearTimeout(t);
  }, [displayed, text, speed]);
  return displayed;
}

// ── Scramble text effect ──────────────────────────────────────
// Exact chars visible in Lamalama's scramble: >##_%(__)%@# family
const SCRAMBLE_CHARS = '#@%^&*()_<>!?-+';

function useScramble(text: string) {
  const [display, setDisplay] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const noise = () =>
    text.split('').map(ch =>
      ch === ' ' ? ' ' : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
    ).join('');

  const scramble = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let frame = 0;
    const FRAMES = 7; // flicker 7 full-word scrambles then snap
    timerRef.current = setInterval(() => {
      frame++;
      if (frame >= FRAMES) {
        clearInterval(timerRef.current!);
        setDisplay(text);
      } else {
        setDisplay(noise());
      }
    }, 45);
  };

  return { display, scramble };
}

function ScrambleSpan({ text, style }: { text: string; style?: React.CSSProperties }) {
  const { display, scramble } = useScramble(text);
  return <span onMouseEnter={scramble} style={style}>{display}</span>;
}


// ── Gradient-border glow pill button ─────────────────────────
function GlowPill({ to, text, icon, className = '', innerStyle }: { to: string; text: string; icon?: React.ReactNode; className?: string; innerStyle?: React.CSSProperties }) {
  const { display, scramble } = useScramble(text);
  return (
    <div className={`glow-pill${className ? ' ' + className : ''}`}>
      <Link to={to} className="glow-pill-inner" style={innerStyle} onMouseEnter={scramble}>
        {display}{icon && <>{' '}{icon}</>}
      </Link>
    </div>
  );
}

// ── Glitch section entrance ───────────────────────────────────
function GlitchSection({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.animation = 'section-fade-in 0.7s ease both';
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: 0, ...style }}>
      {children}
    </div>
  );
}

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

const MONO = "'Sometype Mono', ui-monospace, 'SF Mono', monospace";

// ── Preloader ─────────────────────────────────────────────────
function usePreloader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      const step = p < 60 ? 8 : p < 85 ? 4 : p < 95 ? 2 : 1;
      p = Math.min(100, p + step);
      setPct(p);
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setGone(true), 1200);
      }
    }, 70);
    return () => clearInterval(id);
  }, []);
  return { pct, gone };
}

function Preloader() {
  const { pct, gone } = usePreloader();
  if (gone) return null;
  const exiting = pct >= 100;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(1.06)' : 'scale(1)',
      transition: exiting
        ? 'opacity 1.1s cubic-bezier(0.76,0,0.24,1), transform 1.1s cubic-bezier(0.76,0,0.24,1)'
        : 'none',
      pointerEvents: exiting ? 'none' : 'all',
    }}>
      <span style={{
        fontFamily: MONO, fontSize: 13,
        color: 'rgba(255,255,255,0.65)', letterSpacing: '0.06em',
        opacity: pct >= 96 ? 0 : 1,
        transition: 'opacity 0.35s ease',
      }}>
        {pct}%
      </span>
    </div>
  );
}

// Animated 10×10 pixel art icon — two interleaved frames that toggle
function PixelIcon({ size = 14, color = 'currentColor', animDelay = 0 }: { size?: number; color?: string; animDelay?: number }) {
  const d = animDelay;
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}>
      {/* Frame A — base diagonal */}
      <path d="M2 0H0V2H2V0Z"   style={{ animation: `px-a 3s ${d}s ease-in-out infinite` }} />
      <path d="M6 0H4V2H6V0Z"   style={{ animation: `px-b 3s ${d}s ease-in-out infinite` }} />
      <path d="M10 0H8V2H10V0Z" style={{ animation: `px-a 3s ${d}s ease-in-out infinite` }} />
      <path d="M4 2H2V4H4V2Z"   style={{ animation: `px-b 3s ${d}s ease-in-out infinite` }} />
      <path d="M8 2H6V4H8V2Z"   style={{ animation: `px-a 3s ${d}s ease-in-out infinite` }} />
      <path d="M2 4H0V6H2V4Z"   style={{ animation: `px-b 3s ${d}s ease-in-out infinite` }} />
      <path d="M6 4H4V6H6V4Z"   style={{ animation: `px-a 3s ${d}s ease-in-out infinite` }} />
      <path d="M10 4H8V6H10V4Z" style={{ animation: `px-b 3s ${d}s ease-in-out infinite` }} />
      <path d="M4 6H2V8H4V6Z"   style={{ animation: `px-a 3s ${d}s ease-in-out infinite` }} />
      <path d="M8 6H6V8H8V6Z"   style={{ animation: `px-b 3s ${d}s ease-in-out infinite` }} />
      <path d="M2 8H0V10H2V8Z"  style={{ animation: `px-a 3s ${d}s ease-in-out infinite` }} />
      <path d="M6 8H4V10H6V8Z"  style={{ animation: `px-b 3s ${d}s ease-in-out infinite` }} />
      <path d="M10 8H8V10H10V8Z" style={{ animation: `px-a 3s ${d}s ease-in-out infinite` }} />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Markets',   href: '/markets' },
  { label: 'Invest',    href: '/register' },
  { label: 'Portfolio', href: '/dashboard' },
  { label: 'About',     href: '/about' },
  { label: 'Contact',   href: '/contact' },
  { label: 'Log In',    href: '/login' },
];

function FloatingNav() {
  const [open, setOpen] = useState(false);
  const { display: openAccText, scramble: scrambleOpenAcc } = useScramble('Open Account');
  return (
    <div style={{
      position: 'fixed', top: 'max(16px, env(safe-area-inset-top, 0px) + 8px)', left: '50%', transform: 'translateX(-50%)',
      width: 'calc(100vw - 2rem)', maxWidth: '27.375rem', zIndex: 200,
      fontFamily: MONO,
    }}>
      {/* Pill backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(10,10,10,0.72)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Top row ── */}
        <div style={{
          height: '3.125rem', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 0.8125rem 0 0.5625rem',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', opacity: 0.90, padding: '0 4px' }}>
            <CapaCCircle size={20} />
          </Link>

          {/* Centre contextual label */}
          <span style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            fontFamily: MONO, fontSize: '0.5625rem', fontWeight: 500,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.38)', pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>
            {open ? 'Menu' : 'Invest Globally.'}
          </span>

          {/* Hamburger → X */}
          <button onClick={() => setOpen(v => !v)} aria-label="Toggle menu" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.625rem 0.375rem',
            display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end',
          }}>
            {([0, 1, 2] as const).map(i => (
              <span key={i} style={{
                display: 'block', width: 16, height: 1.5, borderRadius: 1,
                background: 'rgba(255,255,255,0.75)',
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                opacity: i === 1 ? (open ? 0 : 1) : 1,
                transform: i === 0 ? (open ? 'translateY(6.5px) rotate(45deg)' : 'none')
                         : i === 2 ? (open ? 'translateY(-6.5px) rotate(-45deg)' : 'none')
                         : 'none',
              }} />
            ))}
          </button>
        </div>

        {/* ── Expandable nav items ── */}
        <div style={{
          maxHeight: open ? 600 : 0, overflow: 'hidden',
          transition: 'max-height 0.5s cubic-bezier(0.77,0,0.18,1)',
        }}>
          {NAV_ITEMS.map(({ label, href }, i) => (
            <Link key={label} to={href} onClick={() => setOpen(false)}
              className="capa-nav-item"
              style={{
                display: 'flex', alignItems: 'center',
                height: '3.125rem',
                padding: '0 0.875rem 0 0.8125rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none', position: 'relative', gap: '1rem',
                overflow: 'hidden',
              }}>
              {/* Accent top line on hover */}
              <div className="capa-nav-line" style={{
                position: 'absolute', top: -1, left: 0, right: 0, height: 1,
                background: 'var(--accent)', transform: 'scaleX(0)',
                transformOrigin: 'left', transition: 'transform 0.28s ease',
              }} />
              {/* Animated pixel icon */}
              <PixelIcon size={13} color="rgba(255,255,255,0.30)" animDelay={i * 0.4} />
              {/* Clipped text reveal */}
              <ScrambleSpan text={label} style={{
                fontFamily: MONO, fontSize: '0.8125rem', fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.78)', display: 'block',
                transition: `clip-path 0.44s ease ${0.06 + i * 0.06}s, transform 0.44s ease ${0.06 + i * 0.06}s, color 0.2s`,
                clipPath: open ? 'inset(0% 0% 0%)' : 'inset(0% 0% 100%)',
                transform: open ? 'translateY(0%)' : 'translateY(80%)',
              }} />
            </Link>
          ))}

          {/* Open Account button */}
          <div style={{ padding: '0.625rem 0.8125rem 0.8125rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/register" onClick={() => setOpen(false)} onMouseEnter={scrambleOpenAcc} style={{
              display: 'block', textAlign: 'center',
              padding: '0.75rem 1rem', borderRadius: 3,
              background: '#fff', color: '#000',
              textDecoration: 'none', fontFamily: MONO,
              fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              border: '1px solid #fff',
              transition: `clip-path 0.44s ease 0.42s, transform 0.44s ease 0.42s`,
              clipPath: open ? 'inset(0% 0% 0%)' : 'inset(0% 0% 100%)',
              transform: open ? 'translateY(0%)' : 'translateY(80%)',
            }}>
              {openAccText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function useHeroProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => setP(Math.min(window.scrollY / window.innerHeight, 1));
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return p;
}

export default function LandingPage() {
  const typedText = useTypeOnce(HERO_TEXT);
  const heroP = useHeroProgress();
  const { display: signInText, scramble: scrambleSignIn } = useScramble('Sign In');
  return (
    <div style={{ background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Preloader />
      <style>{`
        @keyframes hero-text-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .hero-text { animation: hero-text-in 0.9s ease both; }
        .hero-text-1 { animation-delay: 2.5s; }
        .hero-text-2 { animation-delay: 2.75s; }
        .hero-text-3 { animation-delay: 3.0s; }
        .hero-text-4 { animation-delay: 3.2s; }

        .capa-nav-item:hover .capa-nav-line { transform: scaleX(1) !important; }
        .capa-nav-item:hover > span { color: rgba(255,255,255,1) !important; }

        @keyframes px-a {
          0%,45%  { opacity: 1; }
          50%,95% { opacity: 0.15; }
          100%    { opacity: 1; }
        }
        @keyframes px-b {
          0%,45%  { opacity: 0.15; }
          50%,95% { opacity: 1; }
          100%    { opacity: 0.15; }
        }

        @keyframes section-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scroll-line {
          0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
          40%  { opacity: 1; transform: scaleY(1); transform-origin: top; }
          80%  { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
          100% { opacity: 0; }
        }

        @media (max-width: 640px) {
          .hero-content { padding: 0 20px max(80px, env(safe-area-inset-bottom, 0px) + 60px) 20px !important; }
          .hero-logo-wrap { margin-bottom: -16px !important; margin-left: -4px !important; }
          .hero-logo-wrap img { width: min(110px, 55vw) !important; height: auto !important; }
          .hero-subtitle { font-size: 15px !important; margin-bottom: 20px !important; max-width: 100% !important; }
          .hero-buttons { flex-direction: column !important; align-items: stretch !important; width: 100% !important; max-width: 100% !important; gap: 10px !important; }
          .hero-buttons a { justify-content: center !important; padding: 14px 20px !important; font-size: 15px !important; }
          .lp-section-pad { padding-top: 60px !important; padding-bottom: 60px !important; }
          .lp-section-pad-sm { padding-top: 48px !important; padding-bottom: 48px !important; }
          .feature-card { padding: 22px !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 36px !important; text-align: left !important; }
          .step-icon  { margin: 0 0 12px !important; }
          .cta-features { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; padding: 0 8px !important; }
          .cta-btn { width: 100% !important; max-width: 320px !important; justify-content: center !important; padding: 14px 24px !important; font-size: 16px !important; }
          .lp-footer { padding: 40px 20px max(28px, env(safe-area-inset-bottom, 0px) + 16px) !important; }
        }
        @media (max-width: 380px) {
          .hero-content { padding: 0 16px max(72px, env(safe-area-inset-bottom, 0px) + 52px) 16px !important; }
          .hero-subtitle { font-size: 14px !important; }
        }

        /* ── Lamalama-style rectangular buttons ── */
        .glow-pill { display: inline-flex; }
        .glow-pill-inner {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 7px; border-radius: 3px;
          background: #fff;
          color: #000 !important; text-decoration: none;
          font-family: 'Sometype Mono', ui-monospace, 'SF Mono', monospace;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 14px 22px; white-space: nowrap;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          border: 1px solid #fff;
        }
        .glow-pill-inner:hover { background: transparent; color: #fff !important; }
        .cta-glow .glow-pill-inner { font-size: 12px; padding: 16px 32px; }
        @media (max-width: 640px) {
          .hero-buttons .glow-pill { width: 100%; }
          .hero-buttons .glow-pill-inner { width: 100%; padding: 14px 20px !important; justify-content: center; }
          .cta-glow { width: 100%; max-width: 340px; }
          .cta-glow .glow-pill-inner { width: 100%; }
        }
      `}</style>

      <FloatingNav />

      {/* HERO — sticky so the content sheet slides over it on scroll */}
      <div style={{ position: 'sticky', top: 0, zIndex: 0, height: '100svh', minHeight: 600 }}>
        <section style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', background: '#060d1f' }}>

          {/* Background video */}
          <video
            autoPlay muted loop playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }}
          >
            <source src="/Untitled6.mp4" type="video/mp4" />
          </video>

          {/* Cinematic gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to top right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 40%, transparent 100%)' }} />

          {/* Bottom fade — blends into content sheet */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', zIndex: 2 }} />

          {/* Content — fades + recedes as the card slides over */}
          <div className="hero-content" style={{
            position: 'relative', zIndex: 10, textAlign: 'left',
            padding: '0 0 72px 52px', maxWidth: 620,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            opacity: Math.max(0, 1 - heroP * 2.2),
            transform: `scale(${1 - heroP * 0.06}) translateY(${heroP * -36}px)`,
            willChange: 'opacity, transform',
          }}>
            <div className="hero-logo-wrap hero-text hero-text-1" style={{ marginBottom: -36, marginLeft: -28 }}>
              <CapaLogo size={130} />
            </div>

            <p className="hero-text hero-text-2 hero-subtitle" style={{ fontSize: 18, fontWeight: 400, color: SEC, lineHeight: 1.55, maxWidth: 460, margin: '0 0 28px', minHeight: '1.5em' }}>
              {typedText}<span style={{ display: 'inline-block', width: 2, height: '1em', background: typedText.length < HERO_TEXT.length ? SEC : 'transparent', marginLeft: 2, verticalAlign: 'middle', animation: typedText.length < HERO_TEXT.length ? 'cursor-blink 0.9s step-end infinite' : 'none' }} />
            </p>

            <div className="hero-text hero-text-3 hero-buttons" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
              <GlowPill to="/register" text="Start" icon={<ArrowUpRight size={13} />} />
              <Link to="/login" onMouseEnter={scrambleSignIn} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '14px 22px', borderRadius: 3, backgroundColor: 'transparent', color: '#fff', textDecoration: 'none', fontFamily: "'Sometype Mono', ui-monospace, monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.45)', transition: 'background 0.15s, border-color 0.15s' }}>
                {signInText}
              </Link>
            </div>
            <p className="hero-text hero-text-3" style={{ fontSize: 11, color: 'rgba(235,235,245,0.28)', margin: '6px 0 0' }}>No minimum deposit</p>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
            opacity: Math.max(0, 1 - heroP * 5), transition: 'opacity 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'inherit' }}>Scroll</span>
            <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)', animation: 'scroll-line 1.6s ease-in-out infinite' }} />
          </div>
        </section>
      </div>

      {/* Content sheet — slides over the pinned hero */}
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--bg-1)', borderRadius: '28px 28px 0 0', boxShadow: '0 -40px 80px rgba(0,0,0,0.7), 0 -1px 0 rgba(255,255,255,0.06)' }}>

      {/* FEATURES */}
      <GlitchSection>
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
      </GlitchSection>

      {/* HOW IT WORKS */}
      <GlitchSection>
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
      </GlitchSection>

      {/* SOCIAL PROOF */}
      <GlitchSection>
        <section className="lp-section-pad" style={{ padding: '88px 24px', maxWidth: 980, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Why investors choose Capa</p>
          <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
            Built on trust. Backed by data.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 64 }}>
            {[
              { label: 'CMA Regulated',      desc: 'Licensed by the Capital Markets Authority of Kenya.' },
              { label: 'Bank-Grade Security', desc: 'AES-256 encryption, MFA, and segregated custodian accounts.' },
              { label: 'No Hidden Fees',      desc: 'One transparent 0.5% trade fee. No inactivity or withdrawal charges.' },
            ].map(({ label, desc }) => (
              <div key={label} style={{ textAlign: 'center', padding: '28px 20px', borderRadius: 20, backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: '-0.01em' }}>{label}</p>
                <p style={{ fontSize: 13, color: SEC, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </GlitchSection>

      {/* CTA */}
      <GlitchSection>
        <section style={{ backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '88px 24px', textAlign: 'center', borderTop: '1px solid var(--card-border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, marginBottom: 16, lineHeight: 1.06 }}>
              Start investing today.
            </h2>
            <p style={{ fontSize: 17, color: SEC, maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.55 }}>
              Open your free account in under 10 minutes. No minimum deposit.
            </p>
            <div className="cta-features" style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              {['Regulated platform', 'Instant M-Pesa deposits'].map(f => (
                <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: SEC }}>
                  <Check size={13} color={ACCENT} />{f}
                </span>
              ))}
            </div>
            <GlowPill to="/register" text="Create Free Account" icon={<ArrowUpRight size={15} />} className="cta-glow" />
          </div>
        </section>
      </GlitchSection>

      {/* FOOTER */}
      <footer className="lp-footer" style={{ backgroundColor: 'var(--sidebar-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--card-border)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CapaLogo size={18} />
              </div>
            </div>
            {[
              { heading: 'Company',  links: [['About', '/about'], ['Contact', '/contact']] as const },
              { heading: 'Legal',    links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Security', '/security']] as const },
              { heading: 'Account',  links: [['Sign In', '/login'], ['Register', '/register']] as const },
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
      </div>{/* end content sheet */}
    </div>
  );
}
