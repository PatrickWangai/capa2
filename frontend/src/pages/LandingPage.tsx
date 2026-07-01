import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import {
  TrendingUp, Shield, Zap, Globe, ChevronRight, UserCheck, DollarSign,
  BarChart2, Check, Star, Lock, Banknote, RefreshCw, PieChart, Bell,
} from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';

const ACCENT = 'var(--accent)';
const TEXT = 'var(--text)';
const SEC = 'var(--text-secondary)';

// ── Scrolling ticker data ────────────────────────────────────
const TICKER_ITEMS = [
  { sym: 'SCOM', name: 'Safaricom',   price: '26.15',    change: '+1.82%', up: true  },
  { sym: 'EQTY', name: 'Equity Bank', price: '42.50',    change: '-0.61%', up: false },
  { sym: 'KCB',  name: 'KCB Group',  price: '38.25',    change: '+2.14%', up: true  },
  { sym: 'EABL', name: 'EABL',       price: '128.00',   change: '-1.22%', up: false },
  { sym: 'AAPL', name: 'Apple',      price: '$198.45',  change: '+0.92%', up: true  },
  { sym: 'TSLA', name: 'Tesla',      price: '$248.20',  change: '+3.41%', up: true  },
  { sym: 'NVDA', name: 'NVIDIA',     price: '$1,312.50',change: '+5.23%', up: true  },
  { sym: 'MSFT', name: 'Microsoft',  price: '$423.80',  change: '+0.74%', up: true  },
  { sym: 'GOOGL', name: 'Alphabet',  price: '$189.35',  change: '-0.31%', up: false },
  { sym: 'META', name: 'Meta',       price: '$562.10',  change: '+2.84%', up: true  },
  { sym: 'AMZN', name: 'Amazon',     price: '$198.72',  change: '+1.55%', up: true  },
  { sym: 'NCBA', name: 'NCBA Group', price: '44.30',    change: '+0.45%', up: true  },
];

function TickerBar() {
  return (
    <div style={{ background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', height: 32, display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', animation: 'ticker 40s linear infinite', whiteSpace: 'nowrap', gap: 0 }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 20px', borderRight: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: '#fff', letterSpacing: '0.04em' }}>{item.sym}</span>
            <span style={{ color: 'rgba(235,235,245,0.45)' }}>{item.price}</span>
            <span style={{ color: item.up ? '#30d158' : '#ff453a', fontWeight: 600 }}>{item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Sky + water canvas ───────────────────────────────────────
function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const elRaw = canvasRef.current;
    if (!elRaw) return;
    const ctxRaw = elRaw.getContext('2d');
    if (!ctxRaw) return;
    const el = elRaw as HTMLCanvasElement;
    const ctx = ctxRaw as CanvasRenderingContext2D;
    let animId: number, t = 0, W = 0, H = 0;

    function init() { W = el.width = el.offsetWidth; H = el.height = el.offsetHeight; }

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);
      const hy = H * 0.70;
      const sky = ctx.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0, '#0a1628'); sky.addColorStop(0.22, '#0f2d5c');
      sky.addColorStop(0.52, '#1a4aad'); sky.addColorStop(0.80, '#2563eb'); sky.addColorStop(1, '#3b82f6');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hy);
      const sg = ctx.createRadialGradient(W * 0.28, hy * 0.78, 0, W * 0.28, hy * 0.78, W * 0.38);
      sg.addColorStop(0, 'rgba(255,218,110,0.30)'); sg.addColorStop(0.45, 'rgba(255,175,55,0.08)'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = 0.04 + Math.sin(t * 0.008) * 0.008;
      const rx = W * 0.28, ry = hy * 0.60;
      for (let i = 0; i < 7; i++) {
        const a = -0.42 + i * 0.13 + Math.sin(t * 0.007 + i * 0.8) * 0.025;
        ctx.beginPath(); ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(a) * W * 1.6, ry + Math.sin(a) * H * 1.4);
        ctx.lineTo(rx + Math.cos(a + 0.055) * W * 1.6, ry + Math.sin(a + 0.055) * H * 1.4);
        ctx.closePath(); ctx.fillStyle = 'rgba(255,240,165,1)'; ctx.fill();
      }
      ctx.restore();
      const wg = ctx.createLinearGradient(0, hy, 0, H);
      wg.addColorStop(0, '#2563eb'); wg.addColorStop(0.5, '#1a4aad'); wg.addColorStop(1, '#0f2d5c');
      ctx.fillStyle = wg; ctx.fillRect(0, hy, W, H - hy);
      ctx.save();
      for (let i = 0; i < 42; i++) {
        const sx = ((i * 137.5 + t * 0.35) % W);
        const sy = hy + ((i * 79.3) % ((H - hy) * 0.65));
        const sa = (Math.sin(t * 0.055 + i * 1.9) * 0.5 + 0.5) * 0.44;
        ctx.beginPath(); ctx.ellipse(sx, sy, 10 + (i % 5) * 3, 1.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,230,${sa})`; ctx.fill();
      }
      ctx.restore();
      const hg = ctx.createLinearGradient(0, hy - 18, 0, hy + 24);
      hg.addColorStop(0, 'rgba(255,255,255,0.00)'); hg.addColorStop(0.5, 'rgba(255,255,255,0.08)'); hg.addColorStop(1, 'rgba(255,255,255,0.00)');
      ctx.fillStyle = hg; ctx.fillRect(0, hy - 18, W, 42);
      const ov = ctx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0, 'rgba(0,0,0,0.54)'); ov.addColorStop(0.40, 'rgba(0,0,0,0.18)');
      ov.addColorStop(0.65, 'rgba(0,0,0,0.06)'); ov.addColorStop(1, 'rgba(0,0,0,0.42)');
      ctx.fillStyle = ov; ctx.fillRect(0, 0, W, H);
      animId = requestAnimationFrame(draw);
    }

    init(); animId = requestAnimationFrame(draw);
    const ro = new ResizeObserver(init); ro.observe(el);
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}

// ── Section fade-in ──────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }
    }, { threshold: 0.08 });
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

// ── Animated counter ─────────────────────────────────────────
function CountUp({ end, prefix = '', suffix = '', decimals = 0 }: { end: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let startTime: number;
        const duration = 1800;
        function tick(ts: number) {
          if (!startTime) startTime = ts;
          const progress = Math.min((ts - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(parseFloat((end * eased).toFixed(decimals)));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, decimals]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}{suffix}
    </span>
  );
}

// ── Data ─────────────────────────────────────────────────────
const features = [
  { icon: TrendingUp, title: 'Live Market Data',     desc: 'Real-time prices across NSE, NYSE, NASDAQ, and LSE. Sub-second updates on every position.' },
  { icon: Shield,     title: 'Regulated & Secure',   desc: 'CMA Kenya licensed. Client funds held in segregated accounts. 256-bit TLS encryption end-to-end.' },
  { icon: Zap,        title: 'Instant Execution',    desc: 'Market orders execute in milliseconds. No delays, no slippage on standard trades.' },
  { icon: Globe,      title: 'Global Markets',       desc: 'Invest in Apple, Tesla, Safaricom, Equity Bank — all from one account, one app.' },
  { icon: Banknote,   title: 'M-Pesa Deposits',      desc: 'Fund your account with a single M-Pesa STK push. KES to USD conversion at live rates.' },
  { icon: PieChart,   title: 'Portfolio Analytics',  desc: 'Track performance, allocation, dividends, and P&L across every holding in real time.' },
];

const steps = [
  { icon: UserCheck,  num: '01', title: 'Create your account',  desc: 'Register with your email and phone number. Under 2 minutes.' },
  { icon: Shield,     num: '02', title: 'Verify your identity', desc: 'Upload your ID and a selfie. KYC approval typically within the same day.' },
  { icon: DollarSign, num: '03', title: 'Fund via M-Pesa',      desc: 'Enter an amount and receive an STK push. Confirm your PIN — funds appear instantly.' },
  { icon: BarChart2,  num: '04', title: 'Start investing',      desc: 'Browse 65+ NSE stocks plus US markets. Place your first trade in seconds.' },
];

const testimonials = [
  { name: 'Amara K.',  location: 'Nairobi, Kenya',  text: 'I never thought I could invest in Apple or Tesla from Kenya. CAPA made it simple — I was trading in 20 minutes flat.',   initials: 'AK', stars: 5 },
  { name: 'James O.',  location: 'Lagos, Nigeria',   text: 'No monthly fees won me over. Other platforms charged me just to have an account. CAPA only earns when I trade.',          initials: 'JO', stars: 5 },
  { name: 'Fatima M.', location: 'Kampala, Uganda',  text: 'KYC was done in a day. The portfolio tracking is excellent and the interface is cleaner than anything else I have used.', initials: 'FM', stars: 5 },
];

const trustBadges = [
  { icon: Shield,     label: 'CMA Kenya',           sub: 'Licensed & Regulated' },
  { icon: Lock,       label: '256-bit TLS',          sub: 'Bank-Grade Security'  },
  { icon: Banknote,   label: 'Funds Segregated',     sub: 'Client Asset Protection' },
  { icon: RefreshCw,  label: 'Instant M-Pesa',       sub: 'Deposits in Seconds'  },
  { icon: Bell,       label: 'Real-Time Alerts',     sub: 'Price & Order Notifications' },
];

const PRESS = ['Bloomberg', 'Reuters', 'Forbes Africa', 'TechCrunch', 'Business Daily'];

// ── Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ background: 'transparent', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes hero-text-in { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .hero-text { animation: hero-text-in 1s ease both; }
        .hero-text-1 { animation-delay:0.1s; }
        .hero-text-2 { animation-delay:0.3s; }
        .hero-text-3 { animation-delay:0.5s; }
        .hero-text-4 { animation-delay:0.7s; }
        @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .feature-card:hover { border-color: rgba(59,130,246,0.4) !important; transform: translateY(-2px); }
        .feature-card { transition: border-color 0.2s, transform 0.2s; }
        .star { color:#fbbf24; }
      `}</style>

      {/* TICKER */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300 }}>
        <TickerBar />
      </div>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 32, left: 0, right: 0, zIndex: 200, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', backgroundColor: 'rgba(8,46,60,0.82)', backdropFilter: 'saturate(180%) blur(24px)', WebkitBackdropFilter: 'saturate(180%) blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <CapaLogo size={44} />
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {[['About', '/about'], ['Pricing', '/pricing'], ['FAQ', '/faq'], ['Security', '/security']].map(([l, h]) => (
            <Link key={l} to={h} style={{ fontSize: 13, color: SEC, textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login"    style={{ padding: '6px 16px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: TEXT, textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.08)' }}>Log In</Link>
          <Link to="/register" style={{ padding: '6px 16px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: '#fff', textDecoration: 'none', backgroundColor: ACCENT }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 84 }}>
        <HeroCanvas />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(to top, var(--bg-1) 0%, transparent 100%)', zIndex: 2 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, rgba(8,46,60,0.5) 0%, transparent 100%)', zIndex: 2 }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Live badge */}
          <div className="hero-text hero-text-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 980, backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#30d158', display: 'inline-block', boxShadow: '0 0 8px #30d158' }} />
            <span style={{ fontSize: 12, color: '#93c5fd', fontWeight: 500, letterSpacing: '0.04em' }}>Markets are open · 65+ Kenyan & Global stocks</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <CapaLogo size={180} />
          </div>
          <h1 className="hero-text hero-text-2" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(36px,6vw,80px)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT, textShadow: '0 2px 40px rgba(0,0,0,0.6)', margin: '0 0 20px' }}>
            Unstoppable Minds
          </h1>
          <p className="hero-text hero-text-3" style={{ fontSize: 20, fontWeight: 400, color: SEC, lineHeight: 1.55, maxWidth: 560, margin: '0 auto 36px' }}>
            Trade Apple, Tesla, Safaricom, and 65+ more — using M-Pesa. No bank account needed. No monthly fees. Ever.
          </p>
          <div className="hero-text hero-text-4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '15px 32px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', boxShadow: '0 0 40px rgba(59,130,246,0.45)' }}>
              Start Investing Free <ChevronRight size={16} />
            </Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '15px 28px', borderRadius: 980, backgroundColor: 'rgba(255,255,255,0.08)', color: TEXT, textDecoration: 'none', fontSize: 17, fontWeight: 500, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              Sign In
            </Link>
          </div>
          <p className="hero-text hero-text-4" style={{ fontSize: 12, color: 'rgba(235,235,245,0.3)' }}>No minimum deposit · Capital at risk · CMA Kenya regulated</p>
        </div>
      </section>

      {/* ANIMATED STATS */}
      <FadeSection>
        <section style={{ backgroundColor: 'rgba(8,46,60,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '56px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {[
              { prefix: '', suffix: '+', end: 65,    dec: 0, label: 'Listed Assets'       },
              { prefix: '', suffix: '%', end: 0.5,   dec: 1, label: 'Trade Commission'    },
              { prefix: '<',suffix: 'm', end: 10,    dec: 0, label: 'Account Opening'     },
              { prefix: '', suffix: '/7', end: 24,   dec: 0, label: 'Customer Support'    },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  <CountUp end={s.end} prefix={s.prefix} suffix={s.suffix} decimals={s.dec} />
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* FEATURES */}
      <FadeSection>
        <section style={{ padding: '88px 24px', maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Built for performance</p>
          <h2 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
            Everything you need.<br />Nothing you don't.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="feature-card" style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: 32, border: '1px solid rgba(255,255,255,0.10)', cursor: 'default' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
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
              How CAPA works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
              {steps.map(({ icon: Icon, num, title, desc }) => (
                <div key={num} style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
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

      {/* TRUST BADGES */}
      <FadeSection>
        <section style={{ padding: '64px 24px', maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Why investors trust us</p>
          <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 700, textAlign: 'center', color: TEXT, marginBottom: 40, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Security and compliance built in from day one
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            {trustBadges.map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 14, backgroundColor: 'rgba(28,28,30,0.72)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={ACCENT} strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 11, color: SEC, margin: 0 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* PRESS */}
      <FadeSection>
        <section style={{ backgroundColor: 'rgba(8,46,60,0.55)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '36px 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(235,235,245,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>As featured in</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32, alignItems: 'center' }}>
              {PRESS.map(p => (
                <span key={p} style={{ fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '-0.02em', fontStyle: 'italic' }}>{p}</span>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* TESTIMONIALS */}
      <FadeSection>
        <section style={{ padding: '88px 24px', maxWidth: 1000, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Real investors. Real results.</p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 48, lineHeight: 1.1 }}>
            Trusted by investors across Africa
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.10)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} className="star" fill="#fbbf24" />)}
                </div>
                <p style={{ fontSize: 15, color: SEC, lineHeight: 1.7, margin: 0, fontStyle: 'italic', flex: 1 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

      {/* M-PESA HIGHLIGHT */}
      <FadeSection>
        <section style={{ backgroundColor: 'rgba(8,46,60,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>No bank account required</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: TEXT, marginBottom: 16, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                Invest with M-Pesa.<br />Withdraw with M-Pesa.
              </h2>
              <p style={{ fontSize: 16, color: SEC, lineHeight: 1.65, marginBottom: 28 }}>
                Every transaction happens over the payment rails Africans already use. No international wire transfers. No bank queues. Just tap, confirm your PIN, and you're invested.
              </p>
              {['Instant STK push deposit', 'Live KES to USD / GBP conversion', 'Same-day M-Pesa withdrawals', 'Starting from KES 500'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Check size={16} color={ACCENT} strokeWidth={2.5} />
                  <span style={{ fontSize: 14, color: SEC }}>{f}</span>
                </div>
              ))}
            </div>
            {/* Visual mockup */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 260, background: 'rgba(28,28,30,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 28, padding: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize: 13, color: SEC, marginBottom: 4 }}>M-Pesa Deposit</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: TEXT, marginBottom: 2 }}>KES 5,000</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>= USD 38.76 at live rate</div>
                <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#30d158', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>STK Push Sent</div>
                    <div style={{ fontSize: 11, color: SEC }}>Check your phone</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Enter your M-Pesa PIN to confirm</div>
              </div>
            </div>
          </div>
        </section>
      </FadeSection>

      {/* CTA */}
      <FadeSection>
        <section style={{ backgroundColor: 'rgba(8,46,60,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '100px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(59,130,246,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, marginBottom: 16, lineHeight: 1.06 }}>
              Your wealth. No borders.
            </h2>
            <p style={{ fontSize: 17, color: SEC, maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.55 }}>
              Open your free account in under 10 minutes. No minimum deposit required.
            </p>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              {['No monthly fee', 'CMA Regulated', 'Instant M-Pesa deposits', 'Fractional shares'].map(f => (
                <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: SEC }}>
                  <Check size={13} color={ACCENT} />{f}
                </span>
              ))}
            </div>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '16px 42px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 600, boxShadow: '0 0 50px rgba(59,130,246,0.45)' }}>
              Create Free Account <ChevronRight size={18} />
            </Link>
          </div>
        </section>
      </FadeSection>

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'rgba(8,46,60,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ marginBottom: 12 }}><CapaLogo size={18} /></div>
              <p style={{ fontSize: 13, color: SEC, lineHeight: 1.6, margin: 0 }}>Global investing for the African generation.</p>
              <p style={{ fontSize: 11, color: 'rgba(235,235,245,0.3)', marginTop: 10, lineHeight: 1.6 }}>Regulated by the Capital Markets Authority of Kenya.</p>
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
              &copy; {new Date().getFullYear()} CAPA Investments Ltd. All rights reserved. Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results. Capital at risk.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
