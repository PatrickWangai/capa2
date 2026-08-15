import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CapaCCircle from '../components/ui/CapaCCircle';
import { useTheme } from '../context/ThemeContext';

/* ─── Background ──────────────────────────────────────────────────────────────
   To use your own image or video:
     1. Drop it in  frontend/public/  (e.g. hero-bg.mp4)
     2. Set CUSTOM_BG to '/hero-bg.mp4'
   ─────────────────────────────────────────────────────────────────────────── */
const CUSTOM_BG: string = '/hero-bg.mp4';

function BackgroundCanvas() {
  if (CUSTOM_BG) {
    const isVid = CUSTOM_BG.endsWith('.mp4') || CUSTOM_BG.endsWith('.webm');
    return (
      <>
        {isVid
          ? <video autoPlay loop muted playsInline src={CUSTOM_BG}
              style={{ position:'fixed',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:0 }} />
          : <div style={{ position:'fixed',inset:0,zIndex:0,backgroundImage:`url(${CUSTOM_BG})`,backgroundSize:'cover',backgroundPosition:'center' }} />
        }
        <div style={{ position:'fixed',inset:0,zIndex:1,background:'linear-gradient(to bottom,rgba(0,0,0,.50) 0%,rgba(0,0,0,.20) 50%,rgba(0,0,0,.65) 100%)',pointerEvents:'none' }} />
      </>
    );
  }
  return (
    <div style={{ position:'fixed',inset:0,zIndex:0,background:'#060a10',overflow:'hidden' }}>
      <div className="wd-blob wd-blob-1" />
      <div className="wd-blob wd-blob-2" />
      <div className="wd-blob wd-blob-3" />
    </div>
  );
}

/* ─── Clock ─── */
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fn = () => setT(new Date().toLocaleTimeString('en-KE',
      { timeZone:'Africa/Nairobi', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false }));
    fn(); const id = setInterval(fn, 1000); return () => clearInterval(id);
  }, []);
  return <span style={{ fontVariantNumeric:'tabular-nums' }}>[ {t} EAT ]</span>;
}

/* ─── Rotating nav label ─── */
const NAV_LABELS = ['TRADE NSE STOCKS. SIMPLY.','NSE LIVE MARKET DATA','M-PESA DEPOSITS','CMA REGULATED'];
function NavLabel() {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx(i => (i+1) % NAV_LABELS.length); setVis(true); }, 280);
    }, 3600);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily:'monospace',fontSize:11,letterSpacing:'0.12em',color:'rgba(255,255,255,0.38)',textTransform:'uppercase',opacity:vis?1:0,transition:'opacity 0.28s ease' }}>
      {NAV_LABELS[idx]}
    </span>
  );
}

/* ─── Status bar ─── */
function StatusBar() {
  const items: [React.ReactNode, boolean][] = [
    ['64+ STOCKS', true],
    ['NAIROBI BASED', true],
    [<Clock key="c" />, true],
    [<><span style={{ color:'var(--accent)',marginRight:5 }}>●</span>NSE LIVE</>, true],
    ['CMA REGULATED', false],
  ];
  return (
    <div style={{ display:'flex',alignItems:'stretch',borderTop:'1px solid rgba(255,255,255,0.08)',fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.34)',letterSpacing:'0.08em',textTransform:'uppercase' }}>
      {items.map(([label, div], i) => (
        <span key={i} style={{ display:'flex',alignItems:'center' }}>
          <span style={{ padding:'0 22px',lineHeight:'44px' }}>{label}</span>
          {div && <span style={{ color:'rgba(255,255,255,0.10)' }}>|</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── Expandable pillar card (lamalama core-values style) ─── */
function PillarCard({ num, title, body, PAD, BORDER }: { num:string; title:string; body:string; PAD:string; BORDER:string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop:BORDER }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:`24px ${PAD}`,cursor:'pointer',userSelect:'none' }}>
        <div style={{ display:'flex',gap:40,alignItems:'center' }}>
          <span style={{ fontFamily:'monospace',fontSize:11,letterSpacing:'0.10em',color:'rgba(255,255,255,0.28)',textTransform:'uppercase',minWidth:24 }}>{num}</span>
          <h3 style={{ fontSize:'clamp(17px,2.2vw,28px)',fontWeight:800,margin:0,letterSpacing:'-0.02em',color:'#fff',textTransform:'uppercase' }}>{title}</h3>
        </div>
        <span style={{ fontFamily:'monospace',fontSize:11,letterSpacing:'0.08em',color:'rgba(255,255,255,0.40)',border:'1px solid rgba(255,255,255,0.15)',padding:'5px 14px',borderRadius:2 }}>
          ( {open ? '−' : '+'} )
        </span>
      </div>
      <div style={{ overflow:'hidden',maxHeight:open?300:0,transition:'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',paddingLeft:`calc(${PAD} + 64px)`,paddingRight:PAD }}>
        <p style={{ fontSize:'clamp(14px,1.5vw,18px)',color:'rgba(255,255,255,0.50)',lineHeight:1.65,margin:`0 0 32px`,maxWidth:620 }}>{body}</p>
      </div>
    </div>
  );
}

/* ─── Market card (lamalama featured-work style) ─── */
function MarketCard({ name, tags, stat, statLabel, desc }: { name:string; tags:string[]; stat:string; statLabel:string; desc:string }) {
  const LS = { fontFamily:'monospace',fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase' as const,color:'rgba(255,255,255,0.34)' };
  return (
    <div style={{ padding:'44px 48px',background:'rgba(255,255,255,0.02)',position:'relative',overflow:'hidden',minHeight:320 }}>
      <div style={{ position:'absolute',top:0,right:0,width:220,height:220,background:`radial-gradient(ellipse at top right,rgba(var(--accent-rgb),0.08) 0%,transparent 70%)`,pointerEvents:'none' }} />
      <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:28 }}>
        {tags.map(t => <span key={t} style={{ ...LS,border:'1px solid rgba(255,255,255,0.12)',padding:'3px 10px',borderRadius:2 }}>{t}</span>)}
      </div>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
        <h3 style={{ fontSize:'clamp(22px,3vw,40px)',fontWeight:900,margin:0,letterSpacing:'-0.03em',color:'#fff',textTransform:'uppercase',lineHeight:0.95 }}>{name}</h3>
        <div style={{ textAlign:'right',flexShrink:0,marginLeft:20 }}>
          <p style={{ fontSize:'clamp(22px,2.5vw,36px)',fontWeight:900,margin:0,color:'var(--accent)',letterSpacing:'-0.03em',fontVariantNumeric:'tabular-nums' }}>{stat}</p>
          <p style={{ ...LS,margin:'4px 0 0' }}>{statLabel}</p>
        </div>
      </div>
      <p style={{ fontSize:14,color:'rgba(255,255,255,0.44)',lineHeight:1.6,margin:'0 0 28px',maxWidth:380 }}>{desc}</p>
      <Link to="/register" style={{ fontFamily:'monospace',fontSize:11,letterSpacing:'0.10em',textTransform:'uppercase',color:'var(--accent)',textDecoration:'none' }}>
        TRADE NOW →
      </Link>
    </div>
  );
}

/* ─── Page ─── */
export default function LandingPage() {
  const { theme } = useTheme(); void theme;
  const [scrolled, setScrolled] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 380);
    return () => clearTimeout(t);
  }, []);

  const PAD    = 'max(28px, 5.5vw)';
  const BORDER = '1px solid rgba(255,255,255,0.08)';
  const H2     = { fontSize:'clamp(48px,8vw,112px)',fontWeight:900,letterSpacing:'-0.035em',lineHeight:0.90,color:'#fff',margin:0,textTransform:'uppercase' as const };
  const LABEL  = { fontFamily:'monospace',fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase' as const,color:'rgba(255,255,255,0.34)' };
  const BODY   = { fontSize:'clamp(15px,1.6vw,20px)',color:'rgba(255,255,255,0.52)',lineHeight:1.65 };

  const MARKETS = [
    { name:'NSE Main Market',  tags:['Blue Chip','Live Data','KES'],       stat:'64+',  statLabel:'Listed companies',   desc:'Trade Kenya\'s largest and most liquid stocks — Safaricom, KCB, Equity Group and more.' },
    { name:'Growth Stocks',    tags:['Mid-cap','High Upside'],             stat:'20+',  statLabel:'Growth counters',    desc:'High-growth Kenyan companies with strong fundamentals and significant upside potential.' },
    { name:'Dividend Stocks',  tags:['Income','Regular Payouts'],          stat:'30+',  statLabel:'Dividend payers',    desc:'NSE companies with a consistent history of paying shareholder dividends — earn while you hold.' },
    { name:'GEMS',             tags:['SME','Growth Enterprise'],           stat:'5+',   statLabel:'GEMS listings',      desc:'Growth Enterprise Market Segment — Kenya\'s emerging small and mid-size companies.' },
  ];

  const PARTNERS = ['CMA KENYA','NAIROBI SECURITIES EXCHANGE','M-PESA','SAFARICOM','KCB GROUP','EQUITY GROUP','EABL','BAMBURI','STANBIC','ABSA KENYA','NCBA','DIAMOND TRUST BANK'];

  const PILLARS = [
    { num:'01', title:'Think global, invest local',
      body:"We built Capa so any Kenyan — regardless of income or background — can access the same global financial instruments available to the world's wealthiest investors. No middlemen. No gatekeeping." },
    { num:'02', title:'Radical transparency',
      body:"0.5% flat fee. That's it. No management fees, no withdrawal fees, no subscription tiers. You see exactly what you pay before confirming any trade. Trust built through clarity." },
    { num:'03', title:'Built for real impact',
      body:"Every dividend, every return, every shilling stays in your account. We don't lend your holdings or use them for our benefit. Your money is yours — working as hard as you are." },
    { num:'04', title:"Everything we've got",
      body:"When we say CMA-regulated, we mean it. When we say same-day KYC, we mean it. When we say instant M-Pesa deposits, we mean it. We make one promise at a time and deliver on every one." },
  ];

  return (
    <>
      <BackgroundCanvas />

      {/* Dot-grid — only when no custom bg */}
      {!CUSTOM_BG && (
        <div aria-hidden style={{ position:'fixed',inset:0,zIndex:2,backgroundImage:'radial-gradient(rgba(255,255,255,0.22) 2px,transparent 0)',backgroundSize:'22px 22px',pointerEvents:'none' }} />
      )}

      {/* Page-reveal */}
      <div aria-hidden style={{ position:'fixed',inset:0,zIndex:300,backgroundColor:'#060a10',opacity:revealed?0:1,transition:'opacity 1.1s cubic-bezier(0.4,0,0.2,1)',pointerEvents:'none',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ opacity:revealed?0:1,transition:'opacity 0.4s' }}>
          <CapaCCircle size={52} />
        </div>
      </div>

      <style>{`
        .wd-blob { position:absolute; border-radius:50%; }
        .wd-blob-1 { width:1100px;height:1100px;left:42%;top:40%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(var(--accent-rgb),.22) 0%,rgba(var(--accent-rgb),.06) 42%,transparent 68%);filter:blur(72px);animation:wdBlob1 22s ease-in-out infinite; }
        .wd-blob-2 { width:780px;height:780px;left:70%;top:68%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(var(--accent-rgb),.14) 0%,transparent 65%);filter:blur(60px);animation:wdBlob2 30s ease-in-out infinite; }
        .wd-blob-3 { width:650px;height:650px;left:18%;top:58%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(var(--accent-rgb),.09) 0%,transparent 65%);filter:blur(80px);animation:wdBlob3 38s ease-in-out infinite; }
        @keyframes wdBlob1 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 33%{transform:translate(calc(-50% + 100px),calc(-50% - 80px)) scale(1.18)} 66%{transform:translate(calc(-50% - 60px),calc(-50% + 55px)) scale(0.88)} }
        @keyframes wdBlob2 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 40%{transform:translate(calc(-50% - 120px),calc(-50% + 90px)) scale(1.22)} 72%{transform:translate(calc(-50% + 80px),calc(-50% - 45px)) scale(0.85)} }
        @keyframes wdBlob3 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(calc(-50% + 70px),calc(-50% + 65px)) scale(1.14)} }
        @keyframes ll-up { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        .ll-in { animation:ll-up 0.9s cubic-bezier(.16,1,.3,1) both; }
        .ll-in-1{animation-delay:.08s} .ll-in-2{animation-delay:.18s} .ll-in-3{animation-delay:.28s} .ll-in-4{animation-delay:.40s}
        .ll-btn { display:inline-flex;align-items:center;gap:8px;padding:13px 26px;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;border:1px solid rgba(255,255,255,0.18);color:rgba(255,255,255,0.75);transition:border-color .2s,color .2s,background .2s;font-family:monospace;border-radius:2px; }
        .ll-btn:hover { border-color:rgba(255,255,255,0.50);color:#fff; }
        .ll-btn-primary { background:var(--accent);border-color:var(--accent);color:#fff; }
        .ll-btn-primary:hover { opacity:.86; }
        .ll-nlink { font-family:monospace;font-size:11px;letter-spacing:0.10em;text-transform:uppercase;color:rgba(255,255,255,0.34);text-decoration:none;transition:color .2s; }
        .ll-nlink:hover { color:rgba(255,255,255,0.80); }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @media(max-width:820px){
          .rg2{grid-template-columns:1fr !important}
          .rg2>.hero-right{margin-top:32px}
          .rg3{grid-template-columns:1fr !important}
          .rg3>div{border-left:none !important;border-top:1px solid rgba(255,255,255,0.08);padding-left:0 !important}
          .rg-cta>div:last-child{text-align:left}
        }
        @media(max-width:560px){ .nav-center{display:none !important} }
        @media(prefers-reduced-motion:reduce){ .ll-in{animation:none !important;opacity:1 !important;transform:none !important} }
      `}</style>

      <div style={{ position:'relative',zIndex:10,color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif',WebkitFontSmoothing:'antialiased' }}>

        {/* ───── NAV ───── */}
        <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:200,height:52,display:'flex',alignItems:'center',justifyContent:'space-between',padding:`0 ${PAD}`,background:scrolled?'rgba(6,10,16,0.94)':'transparent',backdropFilter:scrolled?'blur(20px)':'none',WebkitBackdropFilter:scrolled?'blur(20px)':'none',borderBottom:scrolled?BORDER:'none',transition:'background .35s,border-color .35s' }}>
          <CapaCCircle size={28} />
          <div className="nav-center"><NavLabel /></div>
          <div style={{ display:'flex',gap:12,alignItems:'center' }}>
            <Link to="/login" className="ll-nlink">Sign In</Link>
            <Link to="/register" className="ll-btn ll-btn-primary" style={{ padding:'7px 18px',fontSize:12 }}>GET STARTED →</Link>
          </div>
        </nav>

        {/* ───── HERO ───── */}
        <section style={{ minHeight:'100dvh',display:'flex',flexDirection:'column',justifyContent:'flex-end',borderBottom:BORDER }}>
          <div style={{ padding:`0 ${PAD}`,borderTop:BORDER }}>
            <p style={{ ...LABEL,padding:'20px 0 16px',margin:0 }} className="ll-in ll-in-1">[ WE ARE CAPA ]</p>
            <div className="rg2 ll-in ll-in-2" style={{ display:'grid',gridTemplateColumns:'1fr 400px',gap:'0 64px',alignItems:'flex-end',paddingBottom:44 }}>
              <h1 style={{ fontSize:'clamp(38px,6.8vw,100px)',fontWeight:900,letterSpacing:'-0.035em',lineHeight:0.92,color:'#fff',margin:0,textTransform:'uppercase' }}>
                A GLOBAL INVESTMENT<br />PLATFORM BUILT FOR<br /><span style={{ color:'var(--accent)' }}>AMBITIOUS KENYANS.</span>
              </h1>
              <div className="hero-right ll-in ll-in-4">
                <p style={{ ...BODY,marginBottom:32 }}>
                  We build wealth pathways for Kenyans everywhere. Real-time NSE data, instant execution, M-Pesa deposits — all on one CMA-regulated platform.
                </p>
                <div style={{ display:'flex',gap:10,flexWrap:'wrap',marginBottom:36 }}>
                  <Link to="/register" className="ll-btn ll-btn-primary">OPEN ACCOUNT →</Link>
                  <Link to="/login" className="ll-btn">SIGN IN</Link>
                </div>
                <div style={{ display:'flex',gap:32 }}>
                  {[['64+','NSE stocks'],['0.5%','Flat fee'],['CMA','Regulated']].map(([v,l]) => (
                    <div key={l}>
                      <p style={{ fontSize:22,fontWeight:700,margin:0,letterSpacing:'-0.025em',fontVariantNumeric:'tabular-nums' }}>{v}</p>
                      <p style={{ ...LABEL,margin:'4px 0 0',fontSize:10 }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <StatusBar />
        </section>

        {/* ───── FEATURED MARKETS ───── */}
        <section style={{ borderBottom:BORDER }}>
          <div style={{ padding:`22px ${PAD}`,borderBottom:BORDER,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <p style={LABEL}>[ LIVE MARKETS ]</p>
            <Link to="/register" style={{ ...LABEL,color:'var(--accent)',textDecoration:'none' }}>VIEW ALL →</Link>
          </div>
          <div className="rg2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,background:'rgba(255,255,255,0.06)' }}>
            {MARKETS.map(m => <MarketCard key={m.name} {...m} />)}
          </div>
        </section>

        {/* ───── WHAT WE DO ───── */}
        <section style={{ borderBottom:BORDER }}>
          <div style={{ padding:`22px ${PAD}`,borderBottom:BORDER,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <p style={LABEL}>[ HOW WE INVEST ]</p>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {['NSE Equities','Live Trading','Dividends'].map(t => (
                <span key={t} style={{ ...LABEL,border:'1px solid rgba(255,255,255,0.12)',padding:'4px 12px',borderRadius:2 }}>{t} ↗</span>
              ))}
            </div>
          </div>
          <div className="rg2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 80px',padding:`56px ${PAD} 0` }}>
            <h2 style={H2}>WHAT<br />WE DO.</h2>
            <div style={{ paddingTop:8 }}>
              <p style={{ ...BODY,marginBottom:24 }}>We make it simple for Kenyans to buy and sell stocks on the Nairobi Securities Exchange. Real-time prices, instant execution, M-Pesa deposits — no broker, no paperwork, no gatekeeping.</p>
              <p style={{ fontSize:'clamp(13px,1.3vw,16px)',color:'rgba(255,255,255,0.30)',margin:0 }}>
                TLDR; we just want you to grow your money.{' '}
                <Link to="/register" style={{ color:'var(--accent)',textDecoration:'none' }}>OPEN AN ACCOUNT →</Link>
              </p>
            </div>
          </div>
          <div className="rg3" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',margin:`48px ${PAD} 0`,borderTop:BORDER }}>
            {[
              ['TRADING',   ['Buy & sell NSE stocks','Market & limit orders','Real-time price quotes','Price alerts','Instant M-Pesa funding']],
              ['RESEARCH',  ['Live market data','Company financials','Price charts','NSE announcements','Watchlists']],
              ['PORTFOLIO', ['Holdings tracker','P&L analysis','Dividend calendar','Performance reports','Transaction history']],
            ].map(([title, items], i) => (
              <div key={title as string} style={{ padding:'40px 0',paddingLeft:i>0?40:0,borderLeft:i>0?BORDER:'none' }}>
                <p style={{ ...LABEL,marginBottom:24,color:'rgba(255,255,255,0.28)' }}>[ {title} ]</p>
                {(items as string[]).map(item => (
                  <p key={item} style={{ fontSize:14,color:'rgba(255,255,255,0.52)',margin:'0 0 10px',lineHeight:1.4 }}>{item}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ margin:`0 ${PAD}`,height:1,background:'rgba(255,255,255,0.08)' }} />
          <div style={{ padding:`32px ${PAD}` }}>
            <Link to="/register" className="ll-btn">START INVESTING ↗</Link>
          </div>
        </section>

        {/* ───── TRUSTED BY ───── */}
        <section style={{ borderBottom:BORDER,overflow:'hidden' }}>
          <div style={{ padding:`22px ${PAD}`,borderBottom:BORDER }}>
            <p style={LABEL}>[ TRUSTED BY ]</p>
          </div>
          <div style={{ padding:'32px 0',overflow:'hidden' }}>
            <div style={{ display:'flex',animation:'ticker 30s linear infinite',width:'max-content' }}>
              {[...PARTNERS,...PARTNERS].map((p,i) => (
                <span key={i} style={{ fontFamily:'monospace',fontSize:12,letterSpacing:'0.10em',textTransform:'uppercase',color:'rgba(255,255,255,0.28)',whiteSpace:'nowrap',padding:'0 40px',borderRight:'1px solid rgba(255,255,255,0.08)' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ───── CREDENTIALS ───── */}
        <section style={{ borderBottom:BORDER }}>
          <div style={{ padding:`22px ${PAD}`,borderBottom:BORDER }}>
            <p style={LABEL}>[ OUR CREDENTIALS ]</p>
          </div>
          <div className="rg2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 80px',padding:`56px ${PAD}` }}>
            <h2 style={{ ...H2,fontSize:'clamp(40px,6.5vw,88px)' }}>CMA<br />REGULATED.</h2>
            <div style={{ paddingTop:8 }}>
              <p style={{ ...BODY,marginBottom:36 }}>
                Capa is fully licensed by the Capital Markets Authority of Kenya. Every trade, every deposit — protected under Kenyan law and CMA oversight.
              </p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px 32px' }}>
                {[
                  ['&lt; 10 min','Account opening'],
                  ['Same day','KYC verification'],
                  ['24 / 7','Market access'],
                  ['Insured','Client funds'],
                ].map(([v,l]) => (
                  <div key={l} style={{ borderTop:BORDER,paddingTop:20 }}>
                    <p style={{ fontSize:'clamp(20px,2.5vw,32px)',fontWeight:900,margin:'0 0 6px',letterSpacing:'-0.025em',fontVariantNumeric:'tabular-nums',color:'var(--accent)' }}
                      dangerouslySetInnerHTML={{ __html: v }} />
                    <p style={{ ...LABEL,margin:0,fontSize:10 }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───── OUR STORY ───── */}
        <section style={{ borderBottom:BORDER }}>
          <div style={{ padding:`22px ${PAD}`,borderBottom:BORDER }}>
            <p style={LABEL}>[ OUR STORY ]</p>
          </div>
          <div style={{ padding:`80px ${PAD}`,maxWidth:920 }}>
            <p style={{ fontSize:'clamp(22px,3.2vw,42px)',fontWeight:700,color:'#fff',lineHeight:1.28,letterSpacing:'-0.025em',margin:0 }}>
              Built in the beating heart of Nairobi. We believe every Kenyan deserves the same financial access as anyone in New York, London or Tokyo — starting today.
            </p>
          </div>
          <div className="rg3" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',margin:`0 ${PAD}`,borderTop:BORDER }}>
            {[
              ['No minimum deposit',  'Start with whatever you have. No limits, no gatekeeping.'],
              ['Flat 0.5% fee',       'One rate, every trade. No hidden costs, ever.'],
              ["Same-day KYC",        "Verified and investing the same day. We don't slow you down."],
            ].map(([title, sub], i) => (
              <div key={title} style={{ padding:'36px 0',paddingLeft:i>0?40:0,borderLeft:i>0?BORDER:'none' }}>
                <p style={{ fontSize:16,fontWeight:700,color:'#fff',margin:'0 0 8px' }}>{title}</p>
                <p style={{ fontSize:13,color:'rgba(255,255,255,0.40)',margin:0 }}>{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───── PLATFORM PILLARS ───── */}
        <section style={{ borderBottom:BORDER }}>
          <div style={{ padding:`22px ${PAD}`,borderBottom:BORDER }}>
            <p style={LABEL}>[ WHAT WE STAND FOR ]</p>
          </div>
          {PILLARS.map(p => <PillarCard key={p.num} {...p} PAD={PAD} BORDER={BORDER} />)}
          <div style={{ borderTop:BORDER }} />
        </section>

        {/* ───── PHILOSOPHY ───── */}
        <section style={{ borderBottom:BORDER }}>
          <div style={{ padding:`22px ${PAD}`,borderBottom:BORDER }}>
            <p style={LABEL}>[ OUR PHILOSOPHY ]</p>
          </div>
          <div className="rg2" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 80px',padding:`64px ${PAD}`,alignItems:'center' }}>
            <h2 style={H2}>ALL IN<br />OR<br /><span style={{ color:'var(--accent)' }}>NOTHING.</span></h2>
            <div>
              <p style={{ ...BODY,marginBottom:24 }}>
                When we say we're all in for every Kenyan investor, we mean it. We don't do halfway platforms, halfway transparency, or halfway commitment. When you open an account with Capa, you get everything we've got.
              </p>
              <p style={{ fontSize:14,color:'rgba(255,255,255,0.30)',lineHeight:1.65,margin:0 }}>
                We don't do halfway.
              </p>
            </div>
          </div>
        </section>

        {/* ───── FOOTER CTA ───── */}
        <section style={{ borderBottom:BORDER }}>
          <div style={{ padding:`22px ${PAD}`,borderBottom:BORDER }}>
            <p style={LABEL}>[ READY? ]</p>
          </div>
          <div className="rg2 rg-cta" style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:'0 80px',alignItems:'flex-end',padding:`64px ${PAD} 60px` }}>
            <h2 style={H2}>OPEN YOUR<br />ACCOUNT.<br /><span style={{ color:'var(--accent)' }}>IT'S THAT SIMPLE.</span></h2>
            <div style={{ paddingBottom:8,textAlign:'right' }}>
              <p style={{ ...BODY,fontSize:14,marginBottom:28,maxWidth:300,textAlign:'left' }}>
                Feel free to reach out. We'll make it work.
              </p>
              <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                <Link to="/register" className="ll-btn ll-btn-primary">START INVESTING ↗</Link>
                <Link to="/login" className="ll-btn">SIGN IN</Link>
              </div>
            </div>
          </div>
          <StatusBar />
        </section>

        {/* ───── FOOTER ───── */}
        <footer>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:`18px ${PAD}`,flexWrap:'wrap',gap:16 }}>
            <div style={{ display:'flex',gap:28,alignItems:'center',flexWrap:'wrap' }}>
              <CapaCCircle size={24} />
              {[['About','/about'],['Contact','/contact'],['Terms','/terms'],['Privacy','/privacy'],['Security','/security'],['FAQ','/faq']].map(([l,h]) => (
                <Link key={l} to={h} style={{ fontFamily:'monospace',fontSize:11,letterSpacing:'0.08em',textTransform:'uppercase',color:'rgba(255,255,255,0.28)',textDecoration:'none' }}>{l}</Link>
              ))}
            </div>
            <p style={{ fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.20)',margin:0,letterSpacing:'0.06em',textTransform:'uppercase' }}>
              © {new Date().getFullYear()} Capa Investments Ltd. — CMA Regulated
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
