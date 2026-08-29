import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BarChart2, Clock, Target } from 'lucide-react';

const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';
const ACCENT = 'var(--primary)';

const RISK_OPTIONS = [
  { value: 'low', icon: '🛡️', label: 'Conservative', desc: 'Preserve capital. Low volatility. Bonds and stable ETFs.' },
  { value: 'medium', icon: '⚖️', label: 'Balanced', desc: 'Mix of growth and stability. Diversified portfolio.' },
  { value: 'high', icon: '🚀', label: 'Growth', desc: 'Maximise returns. Higher volatility. Stocks and growth assets.' },
];

const GOAL_OPTIONS = [
  { value: 'retirement', icon: '🏖️', label: 'Retirement', desc: 'Build long-term wealth for later life.' },
  { value: 'wealth', icon: '💰', label: 'Wealth Building', desc: 'Grow savings beyond inflation.' },
  { value: 'income', icon: '📈', label: 'Passive Income', desc: 'Earn dividends and regular returns.' },
  { value: 'short', icon: '🎯', label: 'Short-term Goal', desc: 'Save for a specific goal in 1–3 years.' },
];

const HORIZON_OPTIONS = [
  { value: '<1', label: 'Less than 1 year' },
  { value: '1-3', label: '1–3 years' },
  { value: '3-7', label: '3–7 years' },
  { value: '7+', label: '7+ years' },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 3, width: i === current ? 24 : 12, borderRadius: 2, backgroundColor: i <= current ? ACCENT : 'var(--border)', transition: 'all 0.3s' }} />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ risk: '', goal: '', horizon: '' });

  const next = () => {
    if (step < 2) setStep(s => s + 1);
    else navigate('/dashboard');
  };

  const canNext = () => {
    if (step === 0) return !!answers.risk;
    if (step === 1) return !!answers.goal;
    if (step === 2) return !!answers.horizon;
    return true;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: 'var(--font-sans)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <StepIndicator current={step} total={3} />

        {/* Step 0: Risk tolerance */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: TEXT, marginBottom: 8, textAlign: 'center' }}>
              What's your risk tolerance?
            </h2>
            <p style={{ fontSize: 14, color: SEC, textAlign: 'center', marginBottom: 28 }}>We'll use this to suggest suitable investments.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RISK_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setAnswers(a => ({ ...a, risk: o.value }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 'var(--radius)', border: `2px solid ${answers.risk === o.value ? ACCENT : 'var(--border)'}`, backgroundColor: answers.risk === o.value ? 'var(--primary)' : 'var(--card)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 28 }}>{o.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: TEXT }}>{o.label}</p>
                    <p style={{ margin: 0, fontSize: 13, color: SEC, marginTop: 2 }}>{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Investment goal */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: TEXT, marginBottom: 8, textAlign: 'center' }}>
              What's your investment goal?
            </h2>
            <p style={{ fontSize: 14, color: SEC, textAlign: 'center', marginBottom: 28 }}>Select what best describes your objective.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {GOAL_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setAnswers(a => ({ ...a, goal: o.value }))}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: '18px 16px', borderRadius: 'var(--radius)', border: `2px solid ${answers.goal === o.value ? ACCENT : 'var(--border)'}`, backgroundColor: answers.goal === o.value ? 'var(--primary)' : 'var(--card)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 24 }}>{o.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: TEXT }}>{o.label}</p>
                    <p style={{ margin: 0, fontSize: 12, color: SEC, marginTop: 2, lineHeight: 1.5 }}>{o.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time horizon */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: TEXT, marginBottom: 8, textAlign: 'center' }}>
              How long can you invest?
            </h2>
            <p style={{ fontSize: 14, color: SEC, textAlign: 'center', marginBottom: 28 }}>Longer horizons can typically handle more risk.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {HORIZON_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setAnswers(a => ({ ...a, horizon: o.value }))}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 'var(--radius)', border: `2px solid ${answers.horizon === o.value ? ACCENT : 'var(--border)'}`, backgroundColor: answers.horizon === o.value ? 'var(--primary)' : 'var(--card)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{o.label}</span>
                  {answers.horizon === o.value && <div style={{ width: 18, height: 18, borderRadius: 'var(--radius)', backgroundColor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary"
              style={{ flex: 1, padding: '14px', fontSize: 14 }}>
              Back
            </button>
          )}
          <button onClick={next} disabled={!canNext()} className="btn-primary"
            style={{ flex: 2, padding: '14px', fontSize: 14, opacity: canNext() ? 1 : 0.5, cursor: canNext() ? 'pointer' : 'not-allowed' }}>
            {step === 2 ? 'Go to Dashboard' : 'Continue'} <ChevronRight size={16} />
          </button>
        </div>

        {/* Skip */}
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <button onClick={() => navigate('/dashboard')} style={{ color: SEC, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            Skip for now →
          </button>
        </p>
      </div>
    </div>
  );
}
