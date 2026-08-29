import { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import * as Sentry from '@sentry/react';

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; message: string }

const TEXT = 'var(--foreground)';
const SEC = 'var(--muted-foreground)';

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', err, info.componentStack);
    Sentry.captureException(err, { contexts: { react: { componentStack: info.componentStack } } });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, textTransform: 'uppercase', color: TEXT, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 14, color: SEC, marginBottom: 8, maxWidth: 380, lineHeight: 1.6 }}>
          This section encountered an unexpected error. Your account and investments are safe.
        </p>
        {this.state.message && (
          <p style={{ fontSize: 12, color: 'var(--destructive)', marginBottom: 20, maxWidth: 480, fontFamily: 'var(--font-sans)', background: 'var(--destructive-muted)', padding: '8px 14px', borderRadius: 'var(--radius)', wordBreak: 'break-word' }}>
            {this.state.message}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: 13 }}
          >
            Try Again
          </button>
          <Link to="/dashboard" className="btn-secondary" style={{ padding: '10px 20px', textDecoration: 'none', fontSize: 13 }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
}
