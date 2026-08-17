import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { initGA, trackPageView } from './lib/analytics';
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

initGA();

function PageTitle({ title }: { title: string }) {
  useEffect(() => { document.title = `${title} | Capa`; }, [title]);
  return null;
}

function RouteTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
  return null;
}

function LoadingSpinner() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#07090f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <style>{`
        @keyframes capa-spin-cw  { to { transform: rotate(360deg);  } }
        @keyframes capa-spin-ccw { to { transform: rotate(-360deg); } }
        .capa-ring {
          position: absolute; border-radius: 50%;
          border: 11px solid transparent;
        }
        .capa-ring-1 {
          width: 200px; height: 200px;
          border-top-color:    #1a6fa8;
          border-right-color:  #1a6fa8;
          border-bottom-color: #1a6fa8;
          animation: capa-spin-cw 1.6s cubic-bezier(.6,.1,.4,.9) infinite;
        }
        .capa-ring-2 {
          width: 152px; height: 152px;
          border-top-color:   #b8620a;
          border-left-color:  #b8620a;
          border-bottom-color:#b8620a;
          animation: capa-spin-ccw 1.2s cubic-bezier(.6,.1,.4,.9) infinite;
        }
        .capa-ring-3 {
          width: 104px; height: 104px;
          border-top-color:   #9b2d7a;
          border-right-color: #9b2d7a;
          animation: capa-spin-cw 0.9s cubic-bezier(.6,.1,.4,.9) infinite;
        }
      `}</style>
      <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="capa-ring capa-ring-1" />
        <div className="capa-ring capa-ring-2" />
        <div className="capa-ring capa-ring-3" />
        <img
          src="/capa-logo.png"
          style={{ width: 52, height: 'auto', objectFit: 'contain', position: 'relative', zIndex: 1, opacity: 0.92 }}
          alt="CAPA"
          draggable={false}
        />
      </div>
    </div>
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
      <RouteTracker />
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
