import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Clock } from 'lucide-react';
import CapaLogo from '../components/ui/CapaLogo';
import toast from 'react-hot-toast';

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = '#20d4b8';
const CARD = '#1c1c1e';

function Nav() {
  return (
    <nav style={{ position: 'sticky', top: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid rgba(84,84,88,0.45)', zIndex: 100 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <CapaLogo size={44} />
        <span style={{ color: TEXT, fontWeight: 600, fontSize: 15 }}>Capa</span>
      </Link>
      <div style={{ display: 'flex', gap: 20 }}>
        <Link to="/login" style={{ color: SEC, textDecoration: 'none', fontSize: 14 }}>Sign In</Link>
        <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontSize: 14, background: ACCENT, padding: '5px 14px', borderRadius: 980 }}>Get Started</Link>
      </div>
    </nav>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 15,
    border: `1px solid ${focused === name ? ACCENT : 'rgba(84,84,88,0.65)'}`,
    boxShadow: focused === name ? '0 0 0 3px rgba(245,130,31,0.18)' : 'none',
    outline: 'none', backgroundColor: '#2c2c2e', color: TEXT,
    fontFamily: 'inherit', transition: 'border 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to a form backend (Formspree, EmailJS, or your own API)
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setSent(true);
  };

  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: SEC, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: TEXT, fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <Nav />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, letterSpacing: '-0.04em', margin: '0 0 12px' }}>Get in Touch</h1>
          <p style={{ fontSize: 17, color: SEC, margin: 0 }}>We typically respond within 24 hours on business days.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: Mail, label: 'Email', value: 'support@capa.invest' },
              { icon: MessageSquare, label: 'Chat', value: 'Live chat in the app' },
              { icon: Clock, label: 'Hours', value: 'Mon–Fri, 8am–6pm EAT' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ backgroundColor: CARD, borderRadius: 16, padding: 20, boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
                <Icon size={18} color={ACCENT} style={{ marginBottom: 8 }} />
                <p style={{ margin: '0 0 2px', fontSize: 13, color: SEC }}>{label}</p>
                <p style={{ margin: 0, fontSize: 14, color: TEXT, fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ backgroundColor: CARD, borderRadius: 20, padding: '28px 28px', boxShadow: '0 0 0 0.5px rgba(255,255,255,0.08)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
                <h3 style={{ color: TEXT, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Message sent!</h3>
                <p style={{ color: SEC, fontSize: 15 }}>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={lbl}>Name</label>
                    <input required style={inputStyle('name')} value={form.name} onChange={set('name')} placeholder="Your name" onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
                  </div>
                  <div>
                    <label style={lbl}>Email</label>
                    <input required type="email" style={inputStyle('email')} value={form.email} onChange={set('email')} placeholder="you@example.com" onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Subject</label>
                  <select required style={{ ...inputStyle('subject'), appearance: 'auto' }} value={form.subject} onChange={set('subject')} onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}>
                    <option value="">Select a topic…</option>
                    <option>Account & Registration</option>
                    <option>KYC Verification</option>
                    <option>Deposits & Withdrawals</option>
                    <option>Trading & Orders</option>
                    <option>Technical Issue</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Message</label>
                  <textarea required style={{ ...inputStyle('message'), minHeight: 120, resize: 'vertical' } as React.CSSProperties} value={form.message} onChange={set('message')} placeholder="Describe your issue or question…" onFocus={() => setFocused('message')} onBlur={() => setFocused(null)} />
                </div>
                <button type="submit" style={{ padding: '13px', borderRadius: 12, backgroundColor: ACCENT, color: '#fff', border: 'none', fontSize: 16, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer style={{ padding: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ margin: 0, fontSize: 12, color: SEC }}>
          © 2024 Capa Investments Ltd. Capital at risk.{' '}
          <Link to="/terms" style={{ color: SEC }}>Terms</Link> · <Link to="/privacy" style={{ color: SEC }}>Privacy</Link>
        </p>
      </footer>
    </div>
  );
}
