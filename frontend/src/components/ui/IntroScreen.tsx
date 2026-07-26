import { useEffect, useRef, useState } from 'react';

interface Props { onDone: () => void; }

const PANELS = [
  { sym: 'SCOM', price: '1,628', chg: '+2.4%', up: true  },
  { sym: 'EQTY', price: '42.50', chg: '+1.8%', up: true  },
  { sym: 'SBIC', price: '18.30', chg: '-0.5%', up: false },
  { sym: 'KCB',  price: '38.75', chg: '+3.1%', up: true  },
  { sym: 'NCBA', price: '51.20', chg: '-1.2%', up: false },
  { sym: 'EABL', price: '182.0', chg: '+0.8%', up: true  },
  { sym: 'BATK', price: '440.0', chg: '+1.5%', up: true  },
  { sym: 'COOP', price: '12.85', chg: '-0.3%', up: false },
  { sym: 'CIC',  price: '2.850', chg: '+0.4%', up: true  },
  { sym: 'KPLC', price: '2.590', chg: '-2.1%', up: false },
  { sym: 'KQ',   price: '5.410', chg: '+1.9%', up: true  },
  { sym: 'NMG',  price: '11.00', chg: '-0.9%', up: false },
];

const ACCENTS = ['#20d4b8', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const FLASH_END  = 1900;
const LOGO_START = 1900;
const FADE_START = 3100;
const DONE_AT    = 3750;

function drawFrame(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  const progress = t / FLASH_END;
  const isMobile = w < 520;
  const COLS = isMobile ? 2 : 3;
  const ROWS = isMobile ? 3 : 2;
  const GAP = 3;

  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, w, h);

  const pw = (w - GAP * (COLS + 1)) / COLS;
  const ph = (h - GAP * (ROWS + 1)) / ROWS;

  const speed = Math.max(38, 110 - progress * 72);
  const frame = Math.floor(t / speed);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const px = GAP + c * (pw + GAP);
      const py = GAP + r * (ph + GAP);
      const di = (frame * COLS + r * COLS + c) % PANELS.length;
      const d  = PANELS[di];
      const acc = ACCENTS[(frame + r + c) % ACCENTS.length];

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(px, py, pw, ph);

      ctx.strokeStyle = acc + '50';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + .5, py + .5, pw - 1, ph - 1);

      // Accent top bar
      ctx.fillStyle = acc + '80';
      ctx.fillRect(px, py, pw, 2);

      // Mini chart
      const N = 18;
      const cx0 = px + 8, cy0 = py + ph * 0.58;
      const cw = pw - 16, chh = ph * 0.26;
      ctx.beginPath();
      ctx.strokeStyle = d.up ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < N; i++) {
        const x = cx0 + (i / (N - 1)) * cw;
        const v = Math.sin(i * 0.9 + di * 1.3 + frame * 0.07) * 0.35
                + Math.sin(i * 0.3 + di * 0.7) * 0.45
                + (d.up ? i / N : -i / N) * 0.5;
        const y = cy0 - chh * (0.2 + v * 0.4);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Chart fill
      ctx.lineTo(cx0 + cw, cy0);
      ctx.lineTo(cx0, cy0);
      ctx.closePath();
      ctx.fillStyle = (d.up ? '#22c55e' : '#ef4444') + '18';
      ctx.fill();

      const fs = Math.max(9, Math.round(pw * 0.115));
      const pad = 8;

      ctx.save();
      ctx.beginPath();
      ctx.rect(px + 2, py + 2, pw - 4, ph - 4);
      ctx.clip();

      ctx.font = `700 ${fs}px -apple-system,BlinkMacSystemFont,sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(d.sym, px + pad, py + fs + 10);

      ctx.font = `${Math.round(fs * 0.82)}px -apple-system,BlinkMacSystemFont,sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.50)';
      ctx.fillText(d.price, px + pad, py + fs + 10 + fs);

      ctx.font = `600 ${Math.round(fs * 0.82)}px -apple-system,BlinkMacSystemFont,sans-serif`;
      ctx.fillStyle = d.up ? '#22c55e' : '#ef4444';
      ctx.fillText(d.chg, px + pad, py + fs + 10 + fs * 2.05);

      ctx.restore();
    }
  }

  // Scan line
  const sy = (t * 0.38) % (h + 28) - 14;
  const sg = ctx.createLinearGradient(0, sy - 12, 0, sy + 12);
  sg.addColorStop(0,   'rgba(255,255,255,0)');
  sg.addColorStop(0.5, 'rgba(255,255,255,0.07)');
  sg.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, sy - 12, w, 24);

  // Vignette
  const vg = ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.2, w/2, h/2, Math.min(w,h)*0.8);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  // White flash at end
  if (progress > 0.87) {
    const fa = Math.min(1, (progress - 0.87) / 0.13);
    ctx.fillStyle = `rgba(255,255,255,${fa * 0.97})`;
    ctx.fillRect(0, 0, w, h);
  }
}

export default function IntroScreen({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'flash' | 'logo' | 'fade'>('flash');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase('logo'), LOGO_START),
      setTimeout(() => setPhase('fade'), FADE_START),
      setTimeout(onDone,                 DONE_AT),
    ];

    const canvas = canvasRef.current;
    if (!canvas) return () => timers.forEach(clearTimeout);
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => timers.forEach(clearTimeout);

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const t = now - start;
      if (t < FLASH_END) {
        drawFrame(ctx, t, canvas.width, canvas.height);
        raf = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      timers.forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#000000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: phase === 'fade' ? 0 : 1,
        transition: phase === 'fade' ? 'opacity 0.65s ease-out' : 'none',
        pointerEvents: phase === 'fade' ? 'none' : 'all',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          display: phase === 'flash' ? 'block' : 'none',
        }}
      />

      {phase !== 'flash' && (
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          animation: 'capaIntroReveal 0.75s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          <div style={{
            filter:
              'drop-shadow(0 0 32px rgba(32,212,184,0.55)) ' +
              'drop-shadow(0 0 80px rgba(32,212,184,0.28)) ' +
              'drop-shadow(0 2px 12px rgba(0,0,0,0.8))',
          }}>
            <img
              src="/capa-logo.png"
              alt="CAPA"
              draggable={false}
              style={{ width: 280, height: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      )}

      <button
        onClick={onDone}
        style={{
          position: 'absolute', bottom: 28, right: 28, zIndex: 2,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.16)',
          color: 'rgba(255,255,255,0.40)',
          padding: '7px 18px', borderRadius: 6,
          fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase',
          cursor: 'pointer',
          fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.40)';
        }}
      >
        Skip
      </button>

      <style>{`
        @keyframes capaIntroReveal {
          0%   { opacity: 0; transform: scale(0.52); }
          55%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
