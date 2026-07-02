import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; message: string }

const TEXT = '#ffffff';
const SEC = 'rgba(235,235,245,0.6)';
const ACCENT = 'var(--accent)';

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', err, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: SEC, marginBottom: 8, maxWidth: 380, lineHeight: 1.6 }}>
          This section encountered an unexpected error. Your account and investments are safe.
        </p>
        {this.state.message && (
          <p style={{ fontSize: 12, color: 'rgba(255,100,100,0.85)', marginBottom: 20, maxWidth: 480, fontFamily: 'monospace', background: 'rgba(255,60,60,0.08)', padding: '8px 14px', borderRadius: 8, wordBreak: 'break-word' }}>
            {this.state.message}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            style={{ padding: '10px 20px', borderRadius: 980, background: ACCENT, color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Try Again
          </button>
          <Link to="/dashboard" style={{ padding: '10px 20px', borderRadius: 980, background: 'rgba(255,255,255,0.08)', color: TEXT, textDecoration: 'none', fontSize: 14 }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}
