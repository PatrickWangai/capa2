import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ui/ErrorBoundary';
import CookieBanner from './components/ui/CookieBanner';
import CapaLogo from './components/ui/CapaLogo';
import CapaCIcon from './components/ui/CapaCIcon';

// Eagerly loaded (critical path)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/admin/AdminLayout';

// Eagerly loaded (core app pages — no loading flash on navigation)
import DashboardPage     from './pages/DashboardPage';
import MarketsPage       from './pages/MarketsPage';
import AssetDetailPage   from './pages/AssetDetailPage';
import PortfolioPage     from './pages/PortfolioPage';
import OrdersPage        from './pages/OrdersPage';
import KycPage           from './pages/KycPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage       from './pages/ProfilePage';
import OnboardingPage    from './pages/OnboardingPage';
import WalletPage                from './pages/WalletPage';
import CurrencyConverterPage    from './pages/CurrencyConverterPage';
import FxHistoryPage            from './pages/FxHistoryPage';
import WalletTransactionsPage   from './pages/WalletTransactionsPage';
import WatchlistPage            from './pages/WatchlistPage';
import DepositPage              from './pages/DepositPage';
import WithdrawPage             from './pages/WithdrawPage';
import SettingsPage             from './pages/SettingsPage';
import TradeConfirmPage         from './pages/TradeConfirmPage';

// Admin
const AdminDashboardPage    = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage        = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminKycPage          = lazy(() => import('./pages/admin/AdminKycPage'));
const AdminTransactionsPage = lazy(() => import('./pages/admin/AdminTransactionsPage'));
const AdminWalletsPage      = lazy(() => import('./pages/admin/AdminWalletsPage'));

// Auth recovery
const ForgotPasswordPage    = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage     = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage       = lazy(() => import('./pages/VerifyEmailPage'));

// Info pages
const AboutPage             = lazy(() => import('./pages/AboutPage'));
const ContactPage           = lazy(() => import('./pages/ContactPage'));
const TermsPage             = lazy(() => import('./pages/TermsPage'));
const PrivacyPage           = lazy(() => import('./pages/PrivacyPage'));
const FaqPage               = lazy(() => import('./pages/FaqPage'));
const PricingPage           = lazy(() => import('./pages/PricingPage'));
const SecurityPage          = lazy(() => import('./pages/SecurityPage'));
const NotFoundPage          = lazy(() => import('./pages/NotFoundPage'));

function PageTitle({ title }: { title: string }) {
  useEffect(() => { document.title = `${title} | Capa`; }, [title]);
  return null;
}

function LoadingSpinner() {
  return (
    <>
      <style>{`
        @keyframes _sp-bg   { from { opacity:0 } to { opacity:1 } }
        @keyframes _sp-icon {
          0%   { opacity:0; transform:scale(0.5); }
          65%  { transform:scale(1.08); }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes _sp-up {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(160deg, var(--bg-1) 0%, var(--bg-2) 50%, var(--bg-3) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif',
        zIndex: 9999,
        animation: '_sp-bg 0.2s ease both',
      }}>

        {/* C icon — spring bounce in, then draws itself */}
        <div style={{
          animation: '_sp-icon 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.05s both',
          background: 'rgba(var(--accent-rgb),0.12)',
          borderRadius: 24,
          lineHeight: 0,
        }}>
          <CapaCIcon size={80} animate bg="none" />
        </div>

        {/* Wordmark */}
        <p style={{
          margin: '18px 0 5px', padding: 0,
          fontSize: 20, fontWeight: 700, letterSpacing: '0.18em',
          color: 'var(--text)',
          animation: '_sp-up 0.45s ease 0.3s both',
        }}>CAPA</p>

        {/* Tagline */}
        <p style={{
          margin: 0, padding: 0,
          fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.02em',
          animation: '_sp-up 0.45s ease 0.45s both',
        }}>Invest Globally</p>

      </div>
    </>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.accessToken);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuthStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  if (!user?.adminRole) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.accessToken);
  return !token ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CookieBanner />
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public landing */}
            <Route path="/" element={<PublicRoute><PageTitle title="Invest Globally" /><LandingPage /></PublicRoute>} />

            {/* Auth */}
            <Route path="/login"          element={<PublicRoute><PageTitle title="Sign In" /><LoginPage /></PublicRoute>} />
            <Route path="/register"       element={<PublicRoute><PageTitle title="Create Account" /><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><PageTitle title="Reset Password" /><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password"  element={<><PageTitle title="Set New Password" /><ResetPasswordPage /></>} />
            <Route path="/verify-email"    element={<><PageTitle title="Verify Email" /><VerifyEmailPage /></>} />

            {/* Onboarding (after signup) */}
            <Route path="/onboarding" element={<PrivateRoute><PageTitle title="Welcome" /><OnboardingPage /></PrivateRoute>} />

            {/* Protected app */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="dashboard"    element={<><PageTitle title="Dashboard" /><ErrorBoundary><DashboardPage /></ErrorBoundary></>} />
              <Route path="markets"      element={<><PageTitle title="Markets" /><ErrorBoundary><MarketsPage /></ErrorBoundary></>} />
              <Route path="markets/:id"  element={<><PageTitle title="Asset" /><ErrorBoundary><AssetDetailPage /></ErrorBoundary></>} />
              <Route path="portfolio"    element={<><PageTitle title="Portfolio" /><ErrorBoundary><PortfolioPage /></ErrorBoundary></>} />
              <Route path="orders"       element={<><PageTitle title="Orders" /><ErrorBoundary><OrdersPage /></ErrorBoundary></>} />
              <Route path="kyc"          element={<><PageTitle title="Verify Identity" /><ErrorBoundary><KycPage /></ErrorBoundary></>} />
              <Route path="notifications" element={<><PageTitle title="Notifications" /><ErrorBoundary><NotificationsPage /></ErrorBoundary></>} />
              <Route path="profile"      element={<><PageTitle title="Profile" /><ErrorBoundary><ProfilePage /></ErrorBoundary></>} />
              <Route path="wallet"         element={<><PageTitle title="Wallet" /><ErrorBoundary><WalletPage /></ErrorBoundary></>} />
              <Route path="wallet/convert"       element={<><PageTitle title="Convert Currency" /><ErrorBoundary><CurrencyConverterPage /></ErrorBoundary></>} />
              <Route path="wallet/history"       element={<><PageTitle title="FX History" /><ErrorBoundary><FxHistoryPage /></ErrorBoundary></>} />
              <Route path="wallet/transactions"  element={<><PageTitle title="Wallet Transactions" /><ErrorBoundary><WalletTransactionsPage /></ErrorBoundary></>} />
              <Route path="watchlist"            element={<><PageTitle title="Watchlist" /><ErrorBoundary><WatchlistPage /></ErrorBoundary></>} />
              <Route path="deposit"              element={<><PageTitle title="Deposit" /><ErrorBoundary><DepositPage /></ErrorBoundary></>} />
              <Route path="withdraw"             element={<><PageTitle title="Withdraw" /><ErrorBoundary><WithdrawPage /></ErrorBoundary></>} />
              <Route path="settings"             element={<><PageTitle title="Settings" /><ErrorBoundary><SettingsPage /></ErrorBoundary></>} />
              <Route path="trade/confirm"        element={<><PageTitle title="Confirm Trade" /><ErrorBoundary><TradeConfirmPage /></ErrorBoundary></>} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard"    element={<><PageTitle title="Admin — Dashboard" /><AdminDashboardPage /></>} />
              <Route path="users"        element={<><PageTitle title="Admin — Users" /><AdminUsersPage /></>} />
              <Route path="kyc"          element={<><PageTitle title="Admin — KYC" /><AdminKycPage /></>} />
              <Route path="transactions" element={<><PageTitle title="Admin — Transactions" /><AdminTransactionsPage /></>} />
              <Route path="wallets"      element={<><PageTitle title="Admin — Wallets" /><AdminWalletsPage /></>} />
            </Route>

            {/* Info / marketing */}
            <Route path="/about"    element={<><PageTitle title="About" /><AboutPage /></>} />
            <Route path="/contact"  element={<><PageTitle title="Contact" /><ContactPage /></>} />
            <Route path="/terms"    element={<><PageTitle title="Terms of Service" /><TermsPage /></>} />
            <Route path="/privacy"  element={<><PageTitle title="Privacy Policy" /><PrivacyPage /></>} />
            <Route path="/faq"      element={<><PageTitle title="FAQ" /><FaqPage /></>} />
            <Route path="/pricing"  element={<><PageTitle title="Pricing" /><PricingPage /></>} />
            <Route path="/security" element={<><PageTitle title="Security" /><SecurityPage /></>} />

            {/* 404 */}
            <Route path="*" element={<><PageTitle title="Page Not Found" /><NotFoundPage /></>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
