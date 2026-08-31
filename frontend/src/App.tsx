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

// Wraps each route's content so every page-to-page navigation gets a
// consistent fade + rise-in. No router-level key trick is needed: React
// Router already mounts a fresh element subtree whenever the matched route
// changes (different route = different component type at that position),
// so a plain CSS mount animation on this wrapper replays naturally on every
// navigation — including inside AppLayout/AdminLayout's <Outlet />, where
// only the swapped page animates while the persistent sidebar/nav chrome
// stays mounted and untouched.
function Reveal({ children }: { children: React.ReactNode }) {
  return <div className="route-reveal">{children}</div>;
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
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20,
      zIndex: 9999,
    }}>
      <style>{`
        @keyframes ls-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
        @keyframes ls-dot{0%,80%,100%{opacity:.2}40%{opacity:1}}
        .ls-icon{animation:ls-pulse 2s ease-in-out infinite}
        .ls-d1{animation:ls-dot 1.4s ease-in-out infinite}
        .ls-d2{animation:ls-dot 1.4s ease-in-out .22s infinite}
        .ls-d3{animation:ls-dot 1.4s ease-in-out .44s infinite}
      `}</style>
      <div className="ls-icon">
        <svg viewBox="0 0 120 120" width="110" height="110" xmlns="http://www.w3.org/2000/svg">
          <circle cx="63" cy="63" r="50" fill="#0a0f1e"/>
          <circle cx="60" cy="60" r="50" fill="#2B4FD4" stroke="#0a0f1e" strokeWidth="5"/>
          <clipPath id="ls-clip"><circle cx="60" cy="60" r="50"/></clipPath>
          <g clipPath="url(#ls-clip)" stroke="white" strokeWidth="5" opacity="0.22">
            <line x1="-30" y1="10"  x2="70"  y2="145"/>
            <line x1="-15" y1="10"  x2="85"  y2="145"/>
            <line x1="0"   y1="10"  x2="100" y2="145"/>
            <line x1="15"  y1="10"  x2="115" y2="145"/>
            <line x1="30"  y1="10"  x2="130" y2="145"/>
            <line x1="45"  y1="10"  x2="145" y2="145"/>
            <line x1="60"  y1="10"  x2="160" y2="145"/>
            <line x1="75"  y1="10"  x2="175" y2="145"/>
            <line x1="90"  y1="10"  x2="190" y2="145"/>
          </g>
          <rect x="29" y="31" width="20" height="58" rx="5" fill="white" stroke="#0a0f1e" strokeWidth="3.5"/>
          <rect x="71" y="31" width="20" height="58" rx="5" fill="white" stroke="#0a0f1e" strokeWidth="3.5"/>
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="ls-d1" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'inline-block' }}/>
        <span className="ls-d2" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'inline-block' }}/>
        <span className="ls-d3" style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'inline-block' }}/>
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
            <Route path="/" element={<PublicRoute><Reveal><PageTitle title="Invest Globally" /><LandingPage /></Reveal></PublicRoute>} />

            {/* Auth */}
            <Route path="/login"          element={<PublicRoute><Reveal><PageTitle title="Sign In" /><LoginPage /></Reveal></PublicRoute>} />
            <Route path="/register"       element={<PublicRoute><Reveal><PageTitle title="Create Account" /><RegisterPage /></Reveal></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><Reveal><PageTitle title="Reset Password" /><ForgotPasswordPage /></Reveal></PublicRoute>} />
            <Route path="/reset-password"  element={<Reveal><PageTitle title="Set New Password" /><ResetPasswordPage /></Reveal>} />
            <Route path="/verify-email"    element={<Reveal><PageTitle title="Verify Email" /><VerifyEmailPage /></Reveal>} />

            {/* Onboarding (after signup) */}
            <Route path="/onboarding" element={<PrivateRoute><Reveal><PageTitle title="Welcome" /><OnboardingPage /></Reveal></PrivateRoute>} />

            {/* Protected app */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="dashboard"    element={<Reveal><PageTitle title="Dashboard" /><ErrorBoundary><DashboardPage /></ErrorBoundary></Reveal>} />
              <Route path="markets"      element={<Reveal><PageTitle title="Markets" /><ErrorBoundary><MarketsPage /></ErrorBoundary></Reveal>} />
              <Route path="markets/:id"  element={<Reveal><PageTitle title="Asset" /><ErrorBoundary><AssetDetailPage /></ErrorBoundary></Reveal>} />
              <Route path="portfolio"    element={<Reveal><PageTitle title="Portfolio" /><ErrorBoundary><PortfolioPage /></ErrorBoundary></Reveal>} />
              <Route path="orders"       element={<Reveal><PageTitle title="Orders" /><ErrorBoundary><OrdersPage /></ErrorBoundary></Reveal>} />
              <Route path="kyc"          element={<Reveal><PageTitle title="Verify Identity" /><ErrorBoundary><KycPage /></ErrorBoundary></Reveal>} />
              <Route path="notifications" element={<Reveal><PageTitle title="Notifications" /><ErrorBoundary><NotificationsPage /></ErrorBoundary></Reveal>} />
              <Route path="profile"      element={<Reveal><PageTitle title="Profile" /><ErrorBoundary><ProfilePage /></ErrorBoundary></Reveal>} />
              <Route path="wallet"         element={<Reveal><PageTitle title="Wallet" /><ErrorBoundary><WalletPage /></ErrorBoundary></Reveal>} />
              <Route path="wallet/convert"       element={<Reveal><PageTitle title="Convert Currency" /><ErrorBoundary><CurrencyConverterPage /></ErrorBoundary></Reveal>} />
              <Route path="wallet/history"       element={<Reveal><PageTitle title="FX History" /><ErrorBoundary><FxHistoryPage /></ErrorBoundary></Reveal>} />
              <Route path="wallet/transactions"  element={<Reveal><PageTitle title="Wallet Transactions" /><ErrorBoundary><WalletTransactionsPage /></ErrorBoundary></Reveal>} />
              <Route path="watchlist"            element={<Reveal><PageTitle title="Watchlist" /><ErrorBoundary><WatchlistPage /></ErrorBoundary></Reveal>} />
              <Route path="deposit"              element={<Reveal><PageTitle title="Deposit" /><ErrorBoundary><DepositPage /></ErrorBoundary></Reveal>} />
              <Route path="withdraw"             element={<Reveal><PageTitle title="Withdraw" /><ErrorBoundary><WithdrawPage /></ErrorBoundary></Reveal>} />
              <Route path="settings"             element={<Reveal><PageTitle title="Settings" /><ErrorBoundary><SettingsPage /></ErrorBoundary></Reveal>} />
              <Route path="trade/confirm"        element={<Reveal><PageTitle title="Confirm Trade" /><ErrorBoundary><TradeConfirmPage /></ErrorBoundary></Reveal>} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard"    element={<Reveal><PageTitle title="Admin — Dashboard" /><AdminDashboardPage /></Reveal>} />
              <Route path="users"        element={<Reveal><PageTitle title="Admin — Users" /><AdminUsersPage /></Reveal>} />
              <Route path="kyc"          element={<Reveal><PageTitle title="Admin — KYC" /><AdminKycPage /></Reveal>} />
              <Route path="transactions" element={<Reveal><PageTitle title="Admin — Transactions" /><AdminTransactionsPage /></Reveal>} />
              <Route path="wallets"      element={<Reveal><PageTitle title="Admin — Wallets" /><AdminWalletsPage /></Reveal>} />
            </Route>

            {/* Info / marketing */}
            <Route path="/about"    element={<Reveal><PageTitle title="About" /><AboutPage /></Reveal>} />
            <Route path="/contact"  element={<Reveal><PageTitle title="Contact" /><ContactPage /></Reveal>} />
            <Route path="/terms"    element={<Reveal><PageTitle title="Terms of Service" /><TermsPage /></Reveal>} />
            <Route path="/privacy"  element={<Reveal><PageTitle title="Privacy Policy" /><PrivacyPage /></Reveal>} />
            <Route path="/faq"      element={<Reveal><PageTitle title="FAQ" /><FaqPage /></Reveal>} />
            <Route path="/pricing"  element={<Reveal><PageTitle title="Pricing" /><PricingPage /></Reveal>} />
            <Route path="/security" element={<Reveal><PageTitle title="Security" /><SecurityPage /></Reveal>} />

            {/* 404 */}
            <Route path="*" element={<Reveal><PageTitle title="Page Not Found" /><NotFoundPage /></Reveal>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
