import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'capa_cookies_accepted';
const ACCENT = 'var(--primary)';
const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';

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
      backgroundColor: 'var(--card)',
      border: '2px solid var(--foreground)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
      flexWrap: 'wrap',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ margin: 0, fontSize: 14, color: TEXT, fontWeight: 700, marginBottom: 4 }}>🍪 We use cookies</p>
        <p style={{ margin: 0, fontSize: 13, color: SEC, lineHeight: 1.5 }}>
          Essential cookies keep the app working. Analytics cookies help us improve.{' '}
          <Link to="/privacy" style={{ color: ACCENT }}>Privacy Policy</Link>
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={decline} className="btn-secondary" style={{ padding: '9px 16px', fontSize: 13 }}>
          Essential only
        </button>
        <button onClick={accept} className="btn-primary" style={{ padding: '9px 16px', fontSize: 13 }}>
          Accept all
        </button>
      </div>
    </div>
  );
}
