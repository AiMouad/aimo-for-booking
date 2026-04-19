import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { fetchCurrentUser, selectIsAuthenticated, selectUserRole } from './store/authSlice';

// ── Layouts ────────────────────────────────────────────────────────────────────
import DashboardLayout from './components/layout/DashboardLayout';

// ── Auth ───────────────────────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// ── Owner ──────────────────────────────────────────────────────────────────────
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerBookings from './pages/owner/OwnerBookings';
import OwnerProperties from './pages/owner/OwnerProperties';
import OwnerWorkers from './pages/owner/OwnerWorkers';
import OwnerSettingsPage from './pages/owner/OwnerSettingsPage';
import MessagesPage from './pages/owner/MessagesPage';
import PropertyRoomsPage from './pages/owner/PropertyRoomsPage';

// ── Worker ─────────────────────────────────────────────────────────────────────
import WorkerDashboard from './pages/worker/WorkerDashboard';

// ── Client / Public ────────────────────────────────────────────────────────────
import ProfessionalServicesPage from './pages/client/ProfessionalServicesPage';
import ClientBookings from './pages/client/ClientBookings';
import AboutPage from './pages/client/AboutPage';
import ContactPage from './pages/client/ContactPage';
import PropertyDetailPage from './pages/client/PropertyDetailPage';
import Logo_Aimo from './assets/IMGs/Logo_Aimo.png';
import LanguageSwitcher from './components/common/LanguageSwitcher';
import ThemeToggle from './components/common/ThemeToggle';

// ── Chatbot Widget (available everywhere when logged in) ───────────────────────
import ChatbotWidget from './components/chatbot/ChatbotWidget';

// Temporary fix
import ClearAuth from './components/common/ClearAuth';

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles } = {}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const user = useSelector((state) => state.auth.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const username = user?.username || 'user';
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const redirects = {
      owner: `/owner/${username}/dashboard`,
      worker: `/worker/${username}/dashboard`,
      client: '/services',
      admin: `/owner/${username}/dashboard`,
    };
    return <Navigate to={redirects[role] || '/services'} replace />;
  }

  return <Outlet />;
};

// ─── Client shell (public navbar + chatbot widget) ────────────────────────────
const ClientShell = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-surface">
      <nav className="h-16 glass border-b border-white/30 dark:border-gray-700/50 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={Logo_Aimo} alt="AIMO" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-lg" style={{ color: '#087592' }}>AIMO</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors">Services</a>
          <LanguageSwitcher />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <a href={`/client/${user?.username}/bookings`} className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors">My Bookings</a>
              <button onClick={() => navigate(`/${user?.role}/${user?.username}/dashboard`)} className="btn-primary text-xs px-4 py-2">
                Dashboard
              </button>
            </>
          ) : (
            <a href="/login" className="btn-primary text-xs px-4 py-2">Login</a>
          )}
        </div>
      </nav>
      <Outlet />
      {isAuthenticated && <ChatbotWidget />}
    </div>
  );
};

// ─── Root redirect based on role ──────────────────────────────────────────────
const RootRedirect = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const user = useSelector((state) => state.auth.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const username = user?.username || 'user';
  const destinations = {
    owner: `/owner/${username}/dashboard`,
    worker: `/worker/${username}/dashboard`,
    client: '/services',
    admin: `/owner/${username}/dashboard`,
  };
  return <Navigate to={destinations[role] || '/services'} replace />;
};

// ─── Analytics placeholder (Phase 2 enhancement) ─────────────────────────────
const AnalyticsPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
    <div className="glass-card p-12 text-center">
      <div className="text-6xl mb-4 text-primary-500">Analytics</div>
      <p className="text-gray-500">Detailed analytics view — coming in next update.</p>
      <p className="text-gray-400 text-sm mt-2">Your dashboard already shows key metrics.</p>
    </div>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Landing Page (SEO optimized) ───────────────────────────── */}
        <Route path="/" element={<ProfessionalServicesPage />} />

        {/* ── Auth (public) ───────────────────────────────────────{/* Auth (public) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Temporary fix for routing */}
        <Route path="/clear-auth" element={<ClearAuth />} />

        {/* Public Services (redirect to / for SEO) */}
        <Route path="/services" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services/:propertyId" element={<PropertyDetailPage />} />

        {/* ── Owner Routes ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/owner/:username/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/:username/properties" element={<OwnerProperties />} />
            <Route path="/owner/:username/properties/:propertyId/rooms" element={<PropertyRoomsPage />} />
            <Route path="/owner/:username/bookings" element={<OwnerBookings />} />
            <Route path="/owner/:username/workers" element={<OwnerWorkers />} />
            <Route path="/owner/:username/settings" element={<OwnerSettingsPage />} />
            <Route path="/owner/:username/messages" element={<MessagesPage />} />
            <Route path="/owner/:username/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        {/* ── Worker Routes ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['worker', 'owner', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/worker/:username/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/:username/bookings" element={<OwnerBookings />} />  {/* Reuse booking manager */}
            <Route path="/worker/:username/properties" element={<OwnerProperties />} />
          </Route>
        </Route>

        {/* ── Client Routes ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['client', 'owner', 'worker', 'admin']} />}>
          <Route element={<ClientShell />}>
            <Route path="/client/:username/bookings" element={<ClientBookings />} />
          </Route>
        </Route>

        {/* ── Catch-all ──────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#1a1a2e',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </BrowserRouter>
  );
};

export default App;