import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CapaCCircle from '../components/ui/CapaCCircle';
import CapaLogo from '../components/ui/CapaLogo';
import { useTheme } from '../context/ThemeContext';

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
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const PAD = 'max(28px, 5.5vw)';
  const BORDER = '1px solid rgba(255,255,255,0.08)';
  const H1 = { fontSize: 'clamp(58px, 9.5vw, 132px)', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 0.90, color: '#fff', margin: 0, textTransform: 'uppercase' as const };
  const H2 = { fontSize: 'clamp(52px, 8.5vw, 116px)', fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 0.90, color: '#fff', margin: 0, textTransform: 'uppercase' as const };
  const LABEL = { fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.34)' };
  const BODY = { fontSize: 'clamp(15px, 1.6vw, 20px)', color: 'rgba(255,255,255,0.52)', lineHeight: 1.65 };

  return (
    <>
      {/* ── Fixed dot-grid background ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, backgroundColor: '#0c0c0c', backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 2px, transparent 0)', backgroundSize: '22px 22px' }} />

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

      {/* ── Page wrapper ── */}
      <div style={{ position: 'relative', color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

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

              {/* Left — logo */}
              <div className="ll-in ll-in-1">
                <CapaLogo size={140} />
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
