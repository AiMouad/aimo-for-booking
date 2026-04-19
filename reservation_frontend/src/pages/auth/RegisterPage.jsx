import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Lock, Phone, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser, selectAuthLoading, selectAuthError, clearRegistration, clearError } from '../../store/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const STEPS = ['Account Type', 'Subscription', 'Your Info', 'Done'];

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    role: 'client',
    subscription: 'demo',
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (error) {
      const msg = typeof error === 'string' ? error :
        Object.values(error).flat().join(' ') || 'Registration failed.';
      toast.error(msg);
      dispatch(clearError());
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      setSuccess(true);
      setStep(3);
      dispatch(clearRegistration());
    }
  };

  const roleOptions = [
    { value: 'client', label: 'Client', icon: null, desc: 'Browse and book properties' },
    { value: 'owner', label: 'Owner', icon: null, desc: 'Manage your properties and workers' },
  ];

  const subscriptionOptions = [
    { value: 'demo', label: 'DEMO', price: 'Free', desc: 'Free trial to complete your project', features: ['Full access', 'No credit card required', 'Perfect for testing'] },
    { value: 'basic', label: 'Basic', price: '$29/mo', desc: 'Essential features for small businesses', features: ['Up to 10 properties', 'Basic analytics', 'Email support'] },
    { value: 'pro', label: 'Pro', price: '$99/mo', desc: 'Advanced features for growing businesses', features: ['Unlimited properties', 'Advanced analytics', 'Priority support', 'API access'] },
  ];

  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-2xl font-bold text-gradient">AIMO</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the smart booking platform</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300
                  ${i < step ? 'gradient-primary text-white' :
                    i === step ? 'border-2 border-primary-500 text-primary-600' :
                    'border-2 border-gray-200 text-gray-400'}
                `}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 max-w-12 transition-all duration-300 ${i < step ? 'bg-primary-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">

            {/* Step 0: Role selection */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-800">How will you use AIMO?</h2>
                <div className="grid grid-cols-1 gap-3">
                  {roleOptions.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setForm({ ...form, role: r.value })}
                      className={`
                        flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all
                        ${form.role === r.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
                      `}
                    >
                      <User size={32} className="text-primary-500" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{r.label}</p>
                        <p className="text-sm text-gray-500">{r.desc}</p>
                      </div>
                      {form.role === r.value && (
                        <CheckCircle size={20} className="ml-auto text-primary-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <Button fullWidth onClick={() => setStep(1)} rightIcon={<ArrowRight size={16} />}>
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 1: Subscription selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-800">Choose your subscription</h2>
                <div className="grid grid-cols-1 gap-3">
                  {subscriptionOptions.map((sub) => (
                    <button
                      key={sub.value}
                      onClick={() => setForm({ ...form, subscription: sub.value })}
                      className={`
                        flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all
                        ${form.subscription === sub.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
                      `}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{sub.label}</p>
                          <p className="text-primary-600 font-bold">{sub.price}</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{sub.desc}</p>
                        <div className="flex flex-wrap gap-1">
                          {sub.features.map((feature, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      {form.subscription === sub.value && (
                        <CheckCircle size={20} className="text-primary-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setStep(0)} leftIcon={<ArrowLeft size={16} />}>
                    Back
                  </Button>
                  <Button fullWidth onClick={() => setStep(2)} rightIcon={<ArrowRight size={16} />}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: User info */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-gray-800">Your information</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First name" value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John" id="reg-firstname" />
                  <Input label="Last name" value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Doe" id="reg-lastname" />
                </div>
                <Input label="Username" required value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  leftIcon={<User size={15} />} placeholder="johndoe"
                  id="reg-username" />
                <Input label="Email" type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  leftIcon={<Mail size={15} />} placeholder="you@example.com"
                  id="reg-email" />
                <Input label="Phone" type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  leftIcon={<Phone size={15} />} placeholder="+1 234 567 8900"
                  id="reg-phone" />
                <Input label="Password" type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  leftIcon={<Lock size={15} />} placeholder="Minimum 8 characters"
                  id="reg-password" />
                <Input label="Confirm password" type="password" required value={form.password_confirm}
                  onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                  leftIcon={<Lock size={15} />} placeholder="Repeat password"
                  id="reg-confirm" />

                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setStep(1)} leftIcon={<ArrowLeft size={16} />}>
                    Back
                  </Button>
                  <Button type="submit" fullWidth isLoading={isLoading} id="reg-submit">
                    Create Account
                  </Button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow animate-pulse-glow">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  {form.email
                    ? 'Please check your email to verify your account before signing in.'
                    : 'Your account is ready. Sign in to get started!'}
                </p>
                <Button onClick={() => navigate('/login')} fullWidth>
                  Go to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
