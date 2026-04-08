import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser, selectAuthLoading, selectAuthError, selectIsAuthenticated, selectUserRole, clearError } from '../../store/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ROLE_REDIRECTS = {
  owner: '/owner/dashboard',
  worker: '/worker/dashboard',
  client: '/services',
  admin: '/owner/dashboard',
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(ROLE_REDIRECTS[userRole] || '/services', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  useEffect(() => {
    if (error) toast.error(typeof error === 'string' ? error : 'Login failed.');
    return () => dispatch(clearError());
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user?.role || 'client';
      toast.success(`Welcome back! 👋`);
      navigate(ROLE_REDIRECTS[role] || '/services', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex gradient-surface">
      {/* ── Left Panel — Branding ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-1/2 gradient-primary p-12 text-white relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">AIMO</h1>
          </div>
          <p className="text-blue-200 text-sm">Advanced Intelligent Management for Online Booking</p>
        </div>

        <div className="relative space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Manage bookings<br />with intelligence. ✨
            </h2>
            <p className="text-blue-200 text-lg">
              AI-powered platform for property owners, workers, and clients.
              Streamline your reservations seamlessly.
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['🤖 AI Chatbot', '📊 Analytics', '📅 Smart Booking', '👥 Role Management'].map((f) => (
              <span key={f} className="px-3 py-1.5 bg-white/15 rounded-full text-sm font-medium">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-blue-300 text-xs">
          © {new Date().getFullYear()} AIMO Reservation Platform
        </p>
      </motion.div>

      {/* ── Right Panel — Login Form ──────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">AIMO</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-gray-500 mt-2">Sign in to your AIMO account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              leftIcon={<Mail size={16} />}
              id="login-email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              id="login-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              id="login-submit"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
