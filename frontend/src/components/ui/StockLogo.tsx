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
      className={`${sizeClass} rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${className}`}
      style={{ backgroundColor: bg }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
