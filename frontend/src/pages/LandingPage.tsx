import { Link } from 'react-router-dom';
import { useRef, useState, useCallback } from 'react';
import { TrendingUp, Shield, Zap, Globe, ChevronRight } from 'lucide-react';
import OrangeIcon from '../components/ui/OrangeIcon';

const ACCENT = '#f5821f';
const TEXT    = '#1d1d1f';
const SEC     = '#6e6e73';

/* ── Animated tiltable orange ── */
function TiltOrange({ size = 160 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2))  / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    setTilt({ x: dy * -25, y: dx * 25 });
  }, []);
  return (
    <div className="orange-float">
      <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        style={{ display: 'inline-block', cursor: 'grab', transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.12s ease-out', transformStyle: 'preserve-3d' }}>
        <OrangeIcon size={size} />
      </div>
    </div>
  );
}

const features = [
  { icon: TrendingUp, title: 'Live Markets',      desc: 'Real-time prices across 50+ global markets. Never miss a move.' },
  { icon: Shield,     title: 'Zero Commission',   desc: 'Keep every dollar of your returns. No hidden fees, ever.' },
  { icon: Zap,        title: 'Instant Execution', desc: 'Orders filled in milliseconds. Your timing, your price.' },
  { icon: Globe,      title: 'Global Access',     desc: 'US, UK, and Kenyan markets — invest anywhere, from anywhere.' },
];

const stats = [
  { value: '50+',  label: 'Markets' },
  { value: '$0',   label: 'Commission' },
  { value: '24/7', label: 'Support' },
  { value: '1M+',  label: 'Trades' },
];

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#f5f5f7', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── NAV — Apple frosted glass ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OrangeIcon size={26} />
          <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: TEXT }}>Capa</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" style={{ padding: '5px 14px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: TEXT, textDecoration: 'none', backgroundColor: 'rgba(0,0,0,0.05)' }}>Log In</Link>
          <Link to="/register" style={{ padding: '5px 14px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: '#fff', textDecoration: 'none', backgroundColor: ACCENT }}>Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, display: 'inline-block', perspective: 600 }}>
          <TiltOrange size={120} />
        </div>

        <h1 style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.04, color: TEXT, marginBottom: 20 }}>
          The future of<br />investing is here.
        </h1>
        <p style={{ fontSize: 21, fontWeight: 400, color: SEC, lineHeight: 1.48, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
          Trade global markets with zero commission. Real-time data, instant execution, and a portfolio that works as hard as you do.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 24px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Start Investing <ChevronRight size={16} />
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '12px 24px', borderRadius: 980, backgroundColor: 'rgba(0,0,0,0.06)', color: TEXT, textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* ── STATS STRIP — black like Apple's product strip ── */}
      <section style={{ backgroundColor: '#1d1d1f', padding: '48px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <div style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginTop: 6, letterSpacing: '-0.01em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES — 2×2 card grid ── */}
      <section style={{ padding: '80px 24px', maxWidth: 980, margin: '0 auto' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Built for performance</p>
        <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
          Everything you need.<br />Nothing you don't.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.05)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(245,130,31,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon size={22} color={ACCENT} strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 600, color: TEXT, marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h3>
              <p style={{ fontSize: 15, color: SEC, lineHeight: 1.55, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA — full-bleed black like Apple ── */}
      <section style={{ backgroundColor: '#1d1d1f', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', marginBottom: 16, lineHeight: 1.06 }}>
          Unstoppable minds.<br />Unstoppable returns.
        </h2>
        <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.6)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.5 }}>
          Join investors already growing their wealth with Capa.
        </p>
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 32px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>
          Create Free Account <ChevronRight size={16} />
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#f5f5f7', borderTop: '1px solid rgba(0,0,0,0.1)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <OrangeIcon size={20} />
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Capa</span>
          </div>
          <p style={{ fontSize: 12, color: SEC, margin: 0 }}>Copyright © {new Date().getFullYear()} Capa Inc. All rights reserved.</p>
          <Link to="/login" style={{ fontSize: 13, color: ACCENT, textDecoration: 'none' }}>Sign In →</Link>
        </div>
      </footer>
    </div>
  );
}
