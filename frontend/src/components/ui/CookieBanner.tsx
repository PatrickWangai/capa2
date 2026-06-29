import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'capa_cookies_accepted';
const ACCENT = 'var(--accent)';
const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'all');
    setVisible(false);
  };
  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 640,
      backgroundColor: 'rgba(28,28,30,0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 18,
      padding: '20px 24px',
      boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', gap: 20,
      flexWrap: 'wrap',
      fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ margin: 0, fontSize: 14, color: TEXT, fontWeight: 500, marginBottom: 4 }}>🍪 We use cookies</p>
        <p style={{ margin: 0, fontSize: 13, color: SEC, lineHeight: 1.5 }}>
          Essential cookies keep the app working. Analytics cookies help us improve.{' '}
          <Link to="/privacy" style={{ color: ACCENT }}>Privacy Policy</Link>
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={decline} style={{ padding: '9px 16px', borderRadius: 980, background: 'rgba(255,255,255,0.08)', color: TEXT, border: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          Essential only
        </button>
        <button onClick={accept} style={{ padding: '9px 16px', borderRadius: 980, background: ACCENT, color: '#fff', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          Accept all
        </button>
      </div>
    </div>
  );
}
