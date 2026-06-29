import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ui/ErrorBoundary';
import CookieBanner from './components/ui/CookieBanner';

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
import DepositPage       from './pages/DepositPage';
import OrdersPage        from './pages/OrdersPage';
import KycPage           from './pages/KycPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage       from './pages/ProfilePage';
import OnboardingPage    from './pages/OnboardingPage';

// Admin
const AdminDashboardPage    = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage        = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminKycPage          = lazy(() => import('./pages/admin/AdminKycPage'));
const AdminTransactionsPage = lazy(() => import('./pages/admin/AdminTransactionsPage'));

// Auth recovery
const ForgotPasswordPage    = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage     = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage       = lazy(() => import('./pages/VerifyEmailPage'));

// Info pages
const AboutPage             = lazy(() => import('./pages/AboutPage'));
const ContactPage           = lazy(() => import('./pages/ContactPage'));
const FaqPage               = lazy(() => import('./pages/FaqPage'));
const PricingPage           = lazy(() => import('./pages/PricingPage'));
const SecurityPage          = lazy(() => import('./pages/SecurityPage'));
const TermsPage             = lazy(() => import('./pages/TermsPage'));
const PrivacyPage           = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage          = lazy(() => import('./pages/NotFoundPage'));

function PageTitle({ title }: { title: string }) {
  useEffect(() => { document.title = `${title} | Capa`; }, [title]);
  return null;
}

function LoadingSpinner() {
  return (
    <>
      <style>{`
        @keyframes capa-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.04); }
        }
        @keyframes capa-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes capa-bar {
          0%   { width: 0%; }
          60%  { width: 70%; }
          100% { width: 91%; }
        }
        @keyframes capa-shimmer {
          0%   { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(400%)  skewX(-20deg); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #082e3c 0%, #0c5260 18%, #0f8878 45%, #18c0a8 72%, #2acfbc 88%, #1aaa96 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Arial,sans-serif',
      }}>
        {/* feColorMatrix filter: black→transparent, white→opaque */}
        <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
          <defs>
            <filter id="loading-logo-mask">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 0 0 0 0" />
            </filter>
          </defs>
        </svg>

        {/* Logo — pulse */}
        <div style={{ animation: 'capa-pulse 2.4s ease-in-out infinite', marginBottom: 16 }}>
          <img
            src="/capa-logo.png" alt="CAPA"
            width={300} height={169}
            draggable={false}
            style={{ display: 'block', filter: 'url(#loading-logo-mask)', userSelect: 'none' }}
          />
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.24em', color: '#20d4b8',
          textTransform: 'uppercase', margin: '0 0 28px',
          animation: 'capa-fade-up 0.7s ease 0.2s both',
        }}>Unstoppable Minds</p>

        {/* Progress bar */}
        <div style={{
          width: 160, height: 2, borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden',
          animation: 'capa-fade-up 0.7s ease 0.4s both',
          position: 'relative',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            backgroundColor: '#20d4b8',
            animation: 'capa-bar 2.8s cubic-bezier(0.4,0,0.2,1) forwards',
          }} />
          {/* Shimmer sweep */}
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '30%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
            animation: 'capa-shimmer 1.6s ease-in-out 0.8s infinite',
          }} />
        </div>
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
            <Route path="/reset-password"  element={<PageTitle title="Set New Password" />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/verify-email"    element={<PageTitle title="Verify Email" />} />
            <Route path="/verify-email"    element={<VerifyEmailPage />} />

            {/* Onboarding (after signup) */}
            <Route path="/onboarding" element={<PrivateRoute><PageTitle title="Welcome" /><OnboardingPage /></PrivateRoute>} />

            {/* Protected app */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="dashboard"    element={<><PageTitle title="Dashboard" /><ErrorBoundary><DashboardPage /></ErrorBoundary></>} />
              <Route path="markets"      element={<><PageTitle title="Markets" /><ErrorBoundary><MarketsPage /></ErrorBoundary></>} />
              <Route path="markets/:id"  element={<><PageTitle title="Asset" /><ErrorBoundary><AssetDetailPage /></ErrorBoundary></>} />
              <Route path="portfolio"    element={<><PageTitle title="Portfolio" /><ErrorBoundary><PortfolioPage /></ErrorBoundary></>} />
              <Route path="deposit"      element={<><PageTitle title="Deposit" /><ErrorBoundary><DepositPage /></ErrorBoundary></>} />
              <Route path="orders"       element={<><PageTitle title="Orders" /><ErrorBoundary><OrdersPage /></ErrorBoundary></>} />
              <Route path="kyc"          element={<><PageTitle title="Verify Identity" /><ErrorBoundary><KycPage /></ErrorBoundary></>} />
              <Route path="notifications" element={<><PageTitle title="Notifications" /><ErrorBoundary><NotificationsPage /></ErrorBoundary></>} />
              <Route path="profile"      element={<><PageTitle title="Profile" /><ErrorBoundary><ProfilePage /></ErrorBoundary></>} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard"    element={<><PageTitle title="Admin — Dashboard" /><AdminDashboardPage /></>} />
              <Route path="users"        element={<><PageTitle title="Admin — Users" /><AdminUsersPage /></>} />
              <Route path="kyc"          element={<><PageTitle title="Admin — KYC" /><AdminKycPage /></>} />
              <Route path="transactions" element={<><PageTitle title="Admin — Transactions" /><AdminTransactionsPage /></>} />
            </Route>

            {/* Info / marketing */}
            <Route path="/about"    element={<><PageTitle title="About" /><AboutPage /></>} />
            <Route path="/contact"  element={<><PageTitle title="Contact" /><ContactPage /></>} />
            <Route path="/faq"      element={<><PageTitle title="FAQ" /><FaqPage /></>} />
            <Route path="/pricing"  element={<><PageTitle title="Pricing" /><PricingPage /></>} />
            <Route path="/security" element={<><PageTitle title="Security" /><SecurityPage /></>} />
            <Route path="/terms"    element={<><PageTitle title="Terms of Service" /><TermsPage /></>} />
            <Route path="/privacy"  element={<><PageTitle title="Privacy Policy" /><PrivacyPage /></>} />

            {/* 404 */}
            <Route path="*" element={<><PageTitle title="Page Not Found" /><NotFoundPage /></>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
