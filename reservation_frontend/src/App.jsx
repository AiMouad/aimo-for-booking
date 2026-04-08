import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// ── Worker ─────────────────────────────────────────────────────────────────────
import WorkerDashboard from './pages/worker/WorkerDashboard';

// ── Client / Public ────────────────────────────────────────────────────────────
import ServicesPage from './pages/client/ServicesPage';
import ClientBookings from './pages/client/ClientBookings';

// ── Chatbot Widget (available everywhere when logged in) ───────────────────────
import ChatbotWidget from './components/chatbot/ChatbotWidget';

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles } = {}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const redirects = {
      owner: '/owner/dashboard',
      worker: '/worker/dashboard',
      client: '/services',
      admin: '/owner/dashboard',
    };
    return <Navigate to={redirects[role] || '/services'} replace />;
  }

  return <Outlet />;
};

// ─── Client shell (public navbar + chatbot widget) ────────────────────────────
const ClientShell = () => (
  <div className="min-h-screen gradient-surface">
    <nav className="h-16 glass border-b border-white/30 dark:border-gray-700/50 flex items-center px-6 justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold">A</span>
        </div>
        <span className="font-bold text-gradient text-lg">AIMO</span>
      </div>
      <div className="flex items-center gap-3">
        <a href="/services" className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors">Services</a>
        <a href="/client/bookings" className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors">My Bookings</a>
        <a href="/login" className="btn-primary text-xs px-4 py-2">Login</a>
      </div>
    </nav>
    <Outlet />
    <ChatbotWidget />
  </div>
);

// ─── Root redirect based on role ──────────────────────────────────────────────
const RootRedirect = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const destinations = {
    owner: '/owner/dashboard',
    worker: '/worker/dashboard',
    client: '/services',
    admin: '/owner/dashboard',
  };
  return <Navigate to={destinations[role] || '/services'} replace />;
};

// ─── Analytics placeholder (Phase 2 enhancement) ─────────────────────────────
const AnalyticsPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
    <div className="glass-card p-12 text-center">
      <div className="text-6xl mb-4">📊</div>
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
        {/* ── Root ──────────────────────────────────────────────── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Auth (public) ─────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Public Services (no login needed to browse) ────────── */}
        <Route element={<ClientShell />}>
          <Route path="/services" element={<ServicesPage />} />
        </Route>

        {/* ── Owner Routes ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/properties" element={<OwnerProperties />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
            <Route path="/owner/workers" element={<OwnerWorkers />} />
            <Route path="/owner/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        {/* ── Worker Routes ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['worker', 'owner', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/bookings" element={<OwnerBookings />} />  {/* Reuse booking manager */}
            <Route path="/worker/properties" element={<OwnerProperties />} />
          </Route>
        </Route>

        {/* ── Client Routes ──────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['client', 'owner', 'worker', 'admin']} />}>
          <Route element={<ClientShell />}>
            <Route path="/client/bookings" element={<ClientBookings />} />
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