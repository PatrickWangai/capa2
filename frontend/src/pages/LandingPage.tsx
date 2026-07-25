import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { TrendingUp, Shield, Zap, Globe, ChevronRight, BarChart2, Bell, Check, UserCheck, DollarSign } from 'lucide-react';
import CapaCCircle from '../components/ui/CapaCCircle';

const BLUE   = '#2563eb';
const TEXT   = '#1d1d1f';
const MUTED  = 'rgba(29,29,31,0.52)';
const SURF   = '#f5f5f7';
const BORDER = 'rgba(0,0,0,0.08)';

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

type SparkPoint = [number, number];

function Sparkline({ points, up }: { points: SparkPoint[]; up: boolean }) {
  const w = 100, h = 44;
  const pts = points.map(([x, y]) => `${x * w / 100},${(1 - y) * h}`).join(' ');
  const color = up ? '#16a34a' : '#dc2626';
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const tickerItems = [
  { sym: 'AAPL',     price: '$213.49',    change: '+1.14%', up: true },
  { sym: 'MSFT',     price: '$421.90',    change: '+0.82%', up: true },
  { sym: 'TSLA',     price: '$248.23',    change: '-0.40%', up: false },
  { sym: 'GOOGL',    price: '$178.50',    change: '+1.52%', up: true },
  { sym: 'NVDA',     price: '$137.85',    change: '+2.10%', up: true },
  { sym: 'AMZN',     price: '$196.40',    change: '-0.22%', up: false },
  { sym: 'META',     price: '$587.12',    change: '+0.94%', up: true },
  { sym: 'SCOM.NBO', price: 'KES 16.30', change: '+0.62%', up: true },
  { sym: 'EQTY.NBO', price: 'KES 52.75', change: '-0.28%', up: false },
  { sym: 'KCB.NBO',  price: 'KES 38.00', change: '+1.07%', up: true },
];

const markets = [
  {
    sym: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ',
    price: '$213.49', pct: '+1.14%', up: true,
    spark: [[0,0.40],[15,0.50],[28,0.35],[40,0.45],[52,0.60],[65,0.55],[78,0.75],[90,0.80],[100,0.90]] as SparkPoint[],
  },
  {
    sym: 'SCOM', name: 'Safaricom PLC', exchange: 'NSE',
    price: 'KES 16.30', pct: '+0.62%', up: true,
    spark: [[0,0.55],[15,0.50],[28,0.62],[40,0.52],[52,0.60],[65,0.68],[78,0.62],[90,0.71],[100,0.74]] as SparkPoint[],
  },
  {
    sym: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ',
    price: '$248.23', pct: '-0.40%', up: false,
    spark: [[0,0.85],[15,0.78],[28,0.82],[40,0.70],[52,0.65],[65,0.72],[78,0.55],[90,0.48],[100,0.40]] as SparkPoint[],
  },
];

const features = [
  { icon: TrendingUp, title: 'Live Markets',       desc: 'Real-time prices across NYSE, NASDAQ, LSE and NSE. Never miss a move.' },
  { icon: Zap,        title: 'Instant Execution',  desc: 'Orders filled in milliseconds. Your timing, your price, zero slippage.' },
  { icon: Shield,     title: 'Capital Protected',  desc: 'Assets held by a regulated custodian, segregated from company funds.' },
  { icon: Globe,      title: 'Global Access',      desc: 'Invest in US, UK, and Kenyan markets from anywhere in Africa.' },
  { icon: Bell,       title: 'Price Alerts',       desc: 'Get notified the moment your target price is hit, any market.' },
  { icon: BarChart2,  title: 'Portfolio Analytics',desc: 'Detailed performance breakdowns with exportable reports.' },
];

const stats = [
  { value: '50+',  label: 'Markets' },
  { value: '2%',   label: 'Trade Fee' },
  { value: '24/7', label: 'Support' },
  { value: '<10m', label: 'Account Setup' },
];

const steps = [
  { num: '1', icon: UserCheck,  title: 'Create your account',  desc: 'Register with your email and basic details. Takes under two minutes.' },
  { num: '2', icon: Shield,     title: 'Verify your identity', desc: 'Upload your ID and a selfie. KYC is typically approved the same day.' },
  { num: '3', icon: DollarSign, title: 'Start investing',      desc: 'Fund via M-Pesa, bank transfer, or card and place your first trade.' },
];

export default function LandingPage() {
  const typedText = useTypeOnce(HERO_TEXT);

  return (
    <div style={{ background: '#fff', color: TEXT, minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .lp-feat-card:hover { border-color: rgba(37,99,235,0.28) !important; }
        .lp-mkt-card:hover  { box-shadow: 0 8px 32px rgba(0,0,0,0.09) !important; }
        @media (max-width: 640px) {
          .lp-nav { padding: 0 16px !important; }
          .lp-nav-links { display: none !important; }
          .lp-hero { padding: 116px 24px 72px !important; }
          .lp-hero-title { font-size: 36px !important; }
          .lp-hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .lp-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .lp-stats-grid > div { border-right: none !important; border-bottom: 1px solid rgba(0,0,0,0.08) !important; padding: 24px 12px !important; }
          .lp-stats-grid > div:nth-child(odd) { border-right: 1px solid rgba(0,0,0,0.08) !important; }
          .lp-stats-grid > div:nth-child(3),
          .lp-stats-grid > div:nth-child(4) { border-bottom: none !important; }
          .lp-mkt-grid  { grid-template-columns: 1fr !important; }
          .lp-feat-grid { grid-template-columns: 1fr !important; }
          .lp-steps-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', background: 'rgba(255,255,255,0.82)', backdropFilter: 'saturate(180%) blur(24px)', WebkitBackdropFilter: 'saturate(180%) blur(24px)', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CapaCCircle size={30} />
          <span style={{ fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>Capa</span>
        </div>
        <div className="lp-nav-links" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {([['About', '/about'], ['Contact', '/contact']] as [string, string][]).map(([l, h]) => (
            <Link key={l} to={h} style={{ fontSize: 14, color: MUTED, textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login"    style={{ padding: '6px 14px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: TEXT, textDecoration: 'none', background: 'rgba(0,0,0,0.06)' }}>Sign In</Link>
          <Link to="/register" style={{ padding: '6px 14px', borderRadius: 980, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', background: BLUE }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero" style={{ paddingTop: 140, paddingBottom: 96, paddingLeft: 24, paddingRight: 24, textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Global Investing for Africa</p>
        <h1 className="lp-hero-title" style={{ fontSize: 'clamp(42px,7vw,80px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.04, color: TEXT, marginBottom: 28 }}>
          Invest in global markets.<br />
          <span style={{ color: BLUE }}>From anywhere.</span>
        </h1>
        <p style={{ fontSize: 20, color: MUTED, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 36px', minHeight: '1.5em' }}>
          {typedText}<span style={{ display: 'inline-block', width: 2, height: '1em', background: typedText.length < HERO_TEXT.length ? MUTED : 'transparent', marginLeft: 2, verticalAlign: 'middle', animation: typedText.length < HERO_TEXT.length ? 'cursor-blink 0.9s step-end infinite' : 'none' }} />
        </p>
        <div className="lp-hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 28px', borderRadius: 980, background: BLUE, color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Start Free <ChevronRight size={16} />
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 28px', borderRadius: 980, background: SURF, color: TEXT, textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(29,29,31,0.32)', margin: 0 }}>No minimum deposit · No credit card required</p>
      </section>

      {/* TICKER */}
      <div style={{ background: SURF, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, overflow: 'hidden', height: 42, display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', animation: 'ticker 38s linear infinite', whiteSpace: 'nowrap', willChange: 'transform' }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 28px', fontSize: 12, fontWeight: 500 }}>
              <span style={{ color: TEXT, letterSpacing: '0.03em', fontWeight: 600 }}>{item.sym}</span>
              <span style={{ color: TEXT }}>{item.price}</span>
              <span style={{ color: item.up ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{item.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <FadeSection>
        <section style={{ background: SURF, borderBottom: `1px solid ${BORDER}`, padding: '56px 24px' }}>
          <div className="lp-stats-grid" style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, color: TEXT, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeSection>

      {/* MARKETS */}
      <FadeSection>
        <section style={{ background: '#fff', padding: '88px 24px' }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Live Markets</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 48, lineHeight: 1.1 }}>
              Markets at a glance
            </h2>
            <div className="lp-mkt-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {markets.map(m => (
                <div key={m.sym} className="lp-mkt-card" style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 20, padding: 24, transition: 'box-shadow 0.2s', cursor: 'default' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.01em' }}>{m.sym}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{m.name}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, background: SURF, borderRadius: 6, padding: '3px 7px', letterSpacing: '0.04em' }}>{m.exchange}</span>
                  </div>
                  <Sparkline points={m.spark} up={m.up} />
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{m.price}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: m.up ? '#16a34a' : '#dc2626' }}>{m.pct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* FEATURES */}
      <FadeSection>
        <section style={{ background: SURF, padding: '88px 24px', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Built for performance</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 48, lineHeight: 1.1 }}>
              Everything you need.
            </h2>
            <div className="lp-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="lp-feat-card" style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: '28px 26px', transition: 'border-color 0.2s', cursor: 'default' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={20} color={BLUE} strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 6, letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* HOW IT WORKS */}
      <FadeSection>
        <section style={{ background: '#fff', padding: '88px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: BLUE, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Get started in minutes</p>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 60, lineHeight: 1.1 }}>
              How Capa works
            </h2>
            <div className="lp-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, textAlign: 'center' }}>
              {steps.map(({ num, icon: Icon, title, desc }) => (
                <div key={num}>
                  <div style={{ fontSize: 80, fontWeight: 800, color: 'rgba(37,99,235,0.07)', letterSpacing: '-0.06em', lineHeight: 1, marginBottom: -12 }}>{num}</div>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon size={22} color={BLUE} strokeWidth={1.8} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeSection>

      {/* CTA */}
      <FadeSection>
        <section style={{ background: SURF, padding: '96px 24px', textAlign: 'center', borderTop: `1px solid ${BORDER}` }}>
          <h2 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.04em', color: TEXT, marginBottom: 16, lineHeight: 1.07 }}>
            Start investing today.
          </h2>
          <p style={{ fontSize: 18, color: MUTED, maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.55 }}>
            Open your free account in under 10 minutes. No minimum deposit.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {['Regulated platform', 'Instant M-Pesa deposits', 'No hidden fees'].map(f => (
              <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: MUTED }}>
                <Check size={13} color={BLUE} />{f}
              </span>
            ))}
          </div>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '15px 38px', borderRadius: 980, background: BLUE, color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 600 }}>
            Create Free Account <ChevronRight size={18} />
          </Link>
        </section>
      </FadeSection>

      {/* FOOTER */}
      <footer style={{ background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <CapaCCircle size={24} />
                <span style={{ fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>Capa</span>
              </div>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>Global investing for the African generation.</p>
            </div>
            {([
              { heading: 'Company', links: [['About', '/about'], ['Contact', '/contact']] as [string,string][] },
              { heading: 'Legal',   links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Security', '/security']] as [string,string][] },
              { heading: 'Account', links: [['Sign In', '/login'], ['Register', '/register']] as [string,string][] },
            ]).map(({ heading, links }) => (
              <div key={heading}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(29,29,31,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{heading}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {links.map(([label, href]) => (
                    <Link key={label} to={href} style={{ fontSize: 14, color: MUTED, textDecoration: 'none' }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(29,29,31,0.30)', lineHeight: 1.7 }}>
              © {new Date().getFullYear()} Capa Investments Ltd. All rights reserved. Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
