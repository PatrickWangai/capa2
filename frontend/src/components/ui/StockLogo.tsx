import { useState } from 'react';

const SVG_LOGOS = new Set(['ABSA','BOC','EVRD','ISF','JUB']);

const LOCAL_LOGOS = new Set([
  'AAPL','ABSA','AMZN','AZN','BARC','BATK','BKG','BOC','BP','BRIT','CARB',
  'CIC','COOP','CRWN','CTUM','DTK','EABL','EGAD','EQTY','EVRD','FMLY','FTGH',
  'GOOGL','IMH','ISF','JPM','JUB','KCB','KEGN','KNRE','KPC','KPLC','KQ',
  'KUKZ','LBTY','LKL','LLOY','META','MSFT','NCBA','NMG','NSE','NVDA',
  'QQQ','SASN','SCAN','SCBK','SCOM','SGL','SHEL','SLAM','SMER',
  'SMWF','SPY','TOTL','TPSE','TSLA','UMME','VOD','VTI','VUKE','VWO','XPRS',
]);

const SYMBOL_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
  '#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6','#a855f7','#10b981',
];

function symbolColor(sym: string) {
  const n = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return SYMBOL_COLORS[n % SYMBOL_COLORS.length];
}

function Sheep() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="90%" height="90%">
      {/* Fluffy wool — overlapping circles */}
      <circle cx="16" cy="14" r="7.5" fill="#f5f5f5" />
      <circle cx="10" cy="15" r="5.5" fill="#eeeeee" />
      <circle cx="22" cy="15" r="5.5" fill="#eeeeee" />
      <circle cx="13" cy="10" r="5" fill="#f0f0f0" />
      <circle cx="19" cy="10" r="5" fill="#f0f0f0" />
      <circle cx="16" cy="8.5" r="5" fill="#f8f8f8" />

      {/* Face */}
      <ellipse cx="16" cy="22" rx="5" ry="5" fill="#3d2010" />

      {/* Ears */}
      <ellipse cx="11.2" cy="20" rx="2.2" ry="1.4" fill="#c49a7a" transform="rotate(-25 11.2 20)" />
      <ellipse cx="20.8" cy="20" rx="2.2" ry="1.4" fill="#c49a7a" transform="rotate(25 20.8 20)" />

      {/* Eyes */}
      <circle cx="14" cy="21.2" r="1.4" fill="white" />
      <circle cx="18" cy="21.2" r="1.4" fill="white" />
      <circle cx="14.4" cy="21.5" r="0.7" fill="#111111" />
      <circle cx="18.4" cy="21.5" r="0.7" fill="#111111" />
      {/* Eye shine */}
      <circle cx="14.7" cy="21.1" r="0.28" fill="white" />
      <circle cx="18.7" cy="21.1" r="0.28" fill="white" />

      {/* Nose */}
      <ellipse cx="16" cy="23.8" rx="1.3" ry="0.85" fill="#7a4030" />

      {/* Smile */}
      <path d="M14.5 25.2 Q16 26.4 17.5 25.2" stroke="#7a4030" strokeWidth="0.8" strokeLinecap="round" fill="none" />

      {/* Legs */}
      <rect x="11.5" y="27" width="2.8" height="4.5" rx="1.4" fill="#3d2010" />
      <rect x="17.7" y="27" width="2.8" height="4.5" rx="1.4" fill="#3d2010" />
    </svg>
  );
}

interface StockLogoProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StockLogo({ symbol, size = 'md', className = '' }: StockLogoProps) {
  const [failed, setFailed] = useState(false);

  const sizeClass =
    size === 'sm' ? 'w-8 h-8 text-[10px]' :
    size === 'lg' ? 'w-14 h-14 text-base' :
                   'w-9 h-9 text-xs';

  if (LOCAL_LOGOS.has(symbol) && !failed) {
    const ext = SVG_LOGOS.has(symbol) ? 'svg' : 'png';
    return (
      <div className={`${sizeClass} rounded-lg bg-white overflow-hidden flex items-center justify-center p-0.5 shrink-0 ${className}`}>
        <img
          src={`/logos/${symbol}.${ext}`}
          alt={symbol}
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const bg = symbolColor(symbol);
  return (
    <div
      className={`${sizeClass} rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ backgroundColor: bg }}
    >
      <Sheep />
    </div>
  );
}
