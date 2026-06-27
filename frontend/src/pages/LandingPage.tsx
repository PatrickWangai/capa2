import { Link } from 'react-router-dom';
import { useRef, useState, useCallback } from 'react';
import { TrendingUp, Shield, Zap, Globe, ChevronRight, UserCheck, DollarSign, BarChart2, Check } from 'lucide-react';
import OrangeIcon from '../components/ui/OrangeIcon';

const ACCENT = '#f5821f';
const TEXT    = '#ffffff';
const SEC     = 'rgba(235,235,245,0.6)';

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
  { icon: TrendingUp, title: 'Live Markets',      desc: 'Real-time prices across NYSE, NASDAQ, LSE and NSE. Never miss a move.' },
  { icon: Shield,     title: 'Capital Protected', desc: 'Your assets are held by a regulated custodian, segregated from company funds.' },
  { icon: Zap,        title: 'Instant Execution', desc: 'Orders filled in milliseconds. Your timing, your price, zero slippage.' },
  { icon: Globe,      title: 'Global Access',     desc: 'Invest in US, UK, and Kenyan markets — from anywhere in Africa.' },
];

const stats = [
  { value: '50+',  label: 'Global Markets' },
  { value: '0.5%', label: 'Trade Fee' },
  { value: '24/7', label: 'Support' },
  { value: '<10m', label: 'To Open Account' },
];

const steps = [
  { icon: UserCheck, num: '01', title: 'Create your account', desc: 'Register with your email. Takes under 2 minutes.' },
  { icon: Shield,    num: '02', title: 'Verify your identity', desc: 'Upload your ID and a selfie. KYC typically approved same day.' },
  { icon: DollarSign, num: '03', title: 'Fund your account', desc: 'Deposit via M-Pesa, bank transfer, or card. Funds appear instantly.' },
  { icon: BarChart2, num: '04', title: 'Start investing', desc: 'Browse global markets and place your first trade in seconds.' },
];

const testimonials = [
  { name: 'Amara K.', location: 'Nairobi, Kenya', text: 'I never thought I could invest in Apple or Tesla from Kenya. Capa made it simple — I was trading in 20 minutes.', initials: 'AK' },
  { name: 'James O.', location: 'Lagos, Nigeria',  text: 'The zero monthly fee model won me over. Other platforms were charging me just to exist. Capa only charges when I trade.', initials: 'JO' },
  { name: 'Fatima M.', location: 'Kampala, Uganda', text: 'KYC was painless — done in a day. The interface is clean and the portfolio tracking is excellent.', initials: 'FM' },
];

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#000000', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OrangeIcon size={26} />
          <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: TEXT }}>Capa</span>
        </div>
        <div style={{ display: 'none', gap: 20 }} className="nav-links">
          {[['About', '/about'], ['Pricing', '/pricing'], ['FAQ', '/faq'], ['Security', '/security']].map(([l, h]) => (
            <Link key={l} to={h} style={{ fontSize: 13, color: SEC, textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" style={{ padding: '5px 14px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: TEXT, textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.08)' }}>Log In</Link>
          <Link to="/register" style={{ padding: '5px 14px', borderRadius: 980, fontSize: 13, fontWeight: 500, color: '#fff', textDecoration: 'none', backgroundColor: ACCENT }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, display: 'inline-block', perspective: 600 }}>
          <TiltOrange size={120} />
        </div>
        <h1 style={{ fontSize: 'clamp(48px,7vw,96px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.04, color: TEXT, marginBottom: 20 }}>
          The future of<br />investing is here.
        </h1>
        <p style={{ fontSize: 21, fontWeight: 400, color: SEC, lineHeight: 1.48, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
          Trade global markets from Africa. Real-time data, instant execution, and no monthly fees — ever.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '13px 26px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Start Investing Free <ChevronRight size={16} />
          </Link>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '13px 26px', borderRadius: 980, backgroundColor: 'rgba(255,255,255,0.08)', color: TEXT, textDecoration: 'none', fontSize: 17, fontWeight: 500 }}>
            Sign In
          </Link>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(235,235,245,0.35)', margin: 0 }}>No minimum deposit · Capital at risk</p>
      </section>

      {/* STATS STRIP */}
      <section style={{ backgroundColor: '#111111', padding: '48px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <div style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6, letterSpacing: '-0.01em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px', maxWidth: 980, margin: '0 auto' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Built for performance</p>
        <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
          Everything you need.<br />Nothing you don't.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ backgroundColor: '#1c1c1e', borderRadius: 20, padding: 32, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(245,130,31,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon size={22} color={ACCENT} strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 600, color: TEXT, marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h3>
              <p style={{ fontSize: 15, color: SEC, lineHeight: 1.55, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ backgroundColor: '#0a0a0a', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase' }}>Get started in minutes</p>
          <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 56, lineHeight: 1.08 }}>
            How Capa works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {steps.map(({ icon: Icon, num, title, desc }) => (
              <div key={num} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(245,130,31,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon size={24} color={ACCENT} strokeWidth={1.8} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.05em' }}>{num}</span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: TEXT, margin: '6px 0 8px', letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ fontSize: 14, color: SEC, margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 24px', maxWidth: 980, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: TEXT, marginBottom: 48, lineHeight: 1.1 }}>
          Trusted by investors across Africa
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ backgroundColor: '#1c1c1e', borderRadius: 20, padding: 28, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 15, color: SEC, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #f5821f, #ff4500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
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

      {/* CTA */}
      <section style={{ backgroundColor: '#111111', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, letterSpacing: '-0.03em', color: TEXT, marginBottom: 16, lineHeight: 1.06 }}>
          Start investing today.
        </h2>
        <p style={{ fontSize: 17, color: SEC, marginBottom: 16, maxWidth: 440, margin: '0 auto 16px', lineHeight: 1.5 }}>
          Open your free account in under 10 minutes. No minimum deposit.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          {['No monthly fee', 'Regulated platform', 'Instant M-Pesa deposits'].map(f => (
            <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: SEC }}>
              <Check size={13} color={ACCENT} />{f}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 36px', borderRadius: 980, backgroundColor: ACCENT, color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 500 }}>
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#000000', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <OrangeIcon size={22} />
                <span style={{ fontWeight: 700, fontSize: 16, color: TEXT }}>Capa</span>
              </div>
              <p style={{ fontSize: 13, color: SEC, lineHeight: 1.6, margin: 0 }}>Global investing for the African generation.</p>
            </div>
            {[
              { heading: 'Company', links: [['About', '/about'], ['Pricing', '/pricing'], ['Security', '/security'], ['Contact', '/contact']] },
              { heading: 'Legal', links: [['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['FAQ', '/faq']] },
              { heading: 'Account', links: [['Sign In', '/login'], ['Register', '/register']] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{heading}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {links.map(([label, href]) => (
                    <Link key={label} to={href} style={{ fontSize: 14, color: SEC, textDecoration: 'none' }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(235,235,245,0.35)', lineHeight: 1.7 }}>
              © {new Date().getFullYear()} Capa Investments Ltd. All rights reserved.
              Investing involves risk, including the possible loss of principal. Past performance is not indicative of future results.
              Capa is a regulated investment platform. Capital at risk.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
