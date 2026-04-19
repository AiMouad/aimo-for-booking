import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, User, Phone, Briefcase, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { register, clearError } from '../authSlice';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Loader from '../../../components/common/Loader';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'CLIENT',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleFieldFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const { confirmPassword, ...submitData } = formData;

    try {
      await dispatch(register(submitData)).unwrap();
      navigate('/login');
    } catch (err) {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-surface flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Creating your amazing account...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-3xl font-bold text-gradient group-hover:scale-105 transition-transform duration-300">AIMO</span>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Create Your Account
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Join our premium reservation platform
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentStep === step ? 'bg-primary-600 w-8' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl mb-6"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Personal Information Section */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus('first_name')}
                        onBlur={handleFieldBlur}
                        required
                        placeholder="Enter your first name"
                        className={`w-full px-4 py-3 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                          focusedField === 'first_name' 
                            ? 'border-primary-500 ring-2 ring-primary-200' 
                            : 'border-gray-200 dark:border-gray-700'
                        } focus:outline-none text-gray-900 dark:text-gray-100 ${
                          errors.first_name ? 'border-red-500 ring-2 ring-red-200' : ''
                        }`}
                      />
                      {errors.first_name && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -bottom-5 left-0 text-red-500 text-xs font-medium"
                        >
                          {errors.first_name}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus('last_name')}
                        onBlur={handleFieldBlur}
                        required
                        placeholder="Enter your last name"
                        className={`w-full px-4 py-3 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                          focusedField === 'last_name' 
                            ? 'border-primary-500 ring-2 ring-primary-200' 
                            : 'border-gray-200 dark:border-gray-700'
                        } focus:outline-none text-gray-900 dark:text-gray-100 ${
                          errors.last_name ? 'border-red-500 ring-2 ring-red-200' : ''
                        }`}
                      />
                      {errors.last_name && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -bottom-5 left-0 text-red-500 text-xs font-medium"
                        >
                          {errors.last_name}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Username */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      focusedField === 'username' ? 'text-primary-500' : 'text-gray-400'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus('username')}
                      onBlur={handleFieldBlur}
                      required
                      placeholder="Choose a unique username"
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                        focusedField === 'username' 
                          ? 'border-primary-500 ring-2 ring-primary-200' 
                          : 'border-gray-200 dark:border-gray-700'
                      } focus:outline-none text-gray-900 dark:text-gray-100 ${
                        errors.username ? 'border-red-500 ring-2 ring-red-200' : ''
                      }`}
                    />
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -bottom-5 left-0 text-red-500 text-xs font-medium"
                      >
                        {errors.username}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Contact Information Section */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary-500" />
                    Contact Information
                  </h3>
                  
                  {/* Email */}
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      focusedField === 'email' ? 'text-primary-500' : 'text-gray-400'
                    }`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus('email')}
                      onBlur={handleFieldBlur}
                      required
                      placeholder="Enter your email address"
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                        focusedField === 'email' 
                          ? 'border-primary-500 ring-2 ring-primary-200' 
                          : 'border-gray-200 dark:border-gray-700'
                      } focus:outline-none text-gray-900 dark:text-gray-100 ${
                        errors.email ? 'border-red-500 ring-2 ring-red-200' : ''
                      }`}
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -bottom-5 left-0 text-red-500 text-xs font-medium"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="relative mt-4">
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                      focusedField === 'phone' ? 'text-primary-500' : 'text-gray-400'
                    }`}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFieldFocus('phone')}
                      onBlur={handleFieldBlur}
                      placeholder="Enter your phone number"
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                        focusedField === 'phone' 
                          ? 'border-primary-500 ring-2 ring-primary-200' 
                          : 'border-gray-200 dark:border-gray-700'
                      } focus:outline-none text-gray-900 dark:text-gray-100`}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Security Section */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary-500" />
                    Security
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="relative">
                      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                        focusedField === 'password' ? 'text-primary-500' : 'text-gray-400'
                      }`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus('password')}
                        onBlur={handleFieldBlur}
                        required
                        placeholder="Create a strong password"
                        className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                          focusedField === 'password' 
                            ? 'border-primary-500 ring-2 ring-primary-200' 
                            : 'border-gray-200 dark:border-gray-700'
                        } focus:outline-none text-gray-900 dark:text-gray-100 ${
                          errors.password ? 'border-red-500 ring-2 ring-red-200' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -bottom-5 left-0 text-red-500 text-xs font-medium"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                        focusedField === 'confirmPassword' ? 'text-primary-500' : 'text-gray-400'
                      }`}>
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => handleFieldFocus('confirmPassword')}
                        onBlur={handleFieldBlur}
                        required
                        placeholder="Confirm your password"
                        className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                          focusedField === 'confirmPassword' 
                            ? 'border-primary-500 ring-2 ring-primary-200' 
                            : 'border-gray-200 dark:border-gray-700'
                        } focus:outline-none text-gray-900 dark:text-gray-100 ${
                          errors.confirmPassword ? 'border-red-500 ring-2 ring-red-200' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute -bottom-5 left-0 text-red-500 text-xs font-medium"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Account Type */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-500" />
                  Account Type
                </label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                    focusedField === 'role' ? 'text-primary-500' : 'text-gray-400'
                  }`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    onFocus={() => handleFieldFocus('role')}
                    onBlur={handleFieldBlur}
                    className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-800 border rounded-xl transition-all duration-200 appearance-none cursor-pointer ${
                      focusedField === 'role' 
                        ? 'border-primary-500 ring-2 ring-primary-200' 
                        : 'border-gray-200 dark:border-gray-700'
                    } focus:outline-none text-gray-900 dark:text-gray-100`}
                  >
                    <option value="CLIENT">Client - Looking for stays</option>
                    <option value="WORKER">Worker - Service provider</option>
                    <option value="OWNER">Owner - Property manager</option>
                  </select>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-4 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </motion.div>
            </div>

            {/* Form Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="text-center pt-6 border-t border-gray-100 dark:border-gray-800"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Secure registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Data protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">GDPR compliant</span>
                </div>
              </div>
            </motion.div>
          </form>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 text-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Why Choose AIMO?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle, title: 'Premium Properties', desc: 'Handpicked luxury stays' },
              { icon: Lock, title: 'Secure Booking', desc: 'Safe payment processing' },
              { icon: CheckCircle, title: 'Instant Confirmation', desc: 'Real-time availability' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{benefit.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterForm;
