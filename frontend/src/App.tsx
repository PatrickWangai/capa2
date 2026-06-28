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

// Lazy loaded (reduces initial bundle)
const DashboardPage         = lazy(() => import('./pages/DashboardPage'));
const MarketsPage           = lazy(() => import('./pages/MarketsPage'));
const AssetDetailPage       = lazy(() => import('./pages/AssetDetailPage'));
const PortfolioPage         = lazy(() => import('./pages/PortfolioPage'));
const DepositPage           = lazy(() => import('./pages/DepositPage'));
const OrdersPage            = lazy(() => import('./pages/OrdersPage'));
const KycPage               = lazy(() => import('./pages/KycPage'));
const NotificationsPage     = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage           = lazy(() => import('./pages/ProfilePage'));
const OnboardingPage        = lazy(() => import('./pages/OnboardingPage'));

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
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(245,130,31,0.2)', borderTopColor: '#f5821f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
