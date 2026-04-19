import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, LogOut, Globe, ChevronDown, Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import toast from 'react-hot-toast';
import Logo_Aimo from '../../assets/IMGs/Logo_Aimo.png';

const ProfessionalAppBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileDropdown(false);
      setShowLanguageDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/services', icon: 'home', description: 'Dashboard' },
    { name: 'Properties', path: '/services', icon: 'building', description: 'Browse stays' },
    { name: 'About Us', path: '/about', icon: 'info', description: 'Our story' },
    { name: 'Contact', path: '/contact', icon: 'phone', description: 'Get in touch' },
  ];

  const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'AR', name: 'العربية', flag: '🇸🇦' },
    { code: 'FR', name: 'Français', flag: '🇫🇷' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Bar - Premium Contact Info */}
      <div className="hidden lg:block">
        <div className="gradient-primary text-white">
          <div className="max-w-7xl mx-auto px-6 py-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-6">
                <motion.div 
                  className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  whileHover={{ x: 2 }}
                >
                  <Phone size={14} className="text-white/80" />
                  <span className="font-medium">+213 123 456 789</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  whileHover={{ x: 2 }}
                >
                  <Mail size={14} className="text-white/80" />
                  <span className="font-medium">info@aimo-dz.com</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                  whileHover={{ x: 2 }}
                >
                  <MapPin size={14} className="text-white/80" />
                  <span className="font-medium">Algiers, Algeria</span>
                </motion.div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Language Selector */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Globe size={14} />
                    <span className="font-medium">{currentLanguage}</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showLanguageDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-48 glass-card overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {languages.map((lang) => (
                          <motion.button
                            key={lang.code}
                            onClick={() => {
                              setCurrentLanguage(lang.code);
                              setShowLanguageDropdown(false);
                              toast.success(`Language changed to ${lang.name}`);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors ${
                              currentLanguage === lang.code ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <div className="font-medium">{lang.name}</div>
                              <div className="text-xs opacity-70">{lang.code}</div>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <motion.header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass shadow-lg border-b border-white/10' 
            : 'bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/services" className="flex items-center gap-3 group">
                <div className="relative">
                  <img 
                    src={Logo_Aimo} 
                    alt="AIMO" 
                    className="h-10 lg:h-12 w-auto transition-transform duration-300 group-hover:rotate-3" 
                  />
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl lg:text-2xl font-bold text-gradient">AIMO</h1>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 font-medium">Your Gateway to Premium Stays</p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => (
                <motion.div key={item.name} whileHover={{ y: -2 }}>
                  <Link
                    to={item.path}
                    className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 group ${
                      location.pathname === item.path
                        ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40'
                        : 'text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {location.pathname === item.path && (
                      <motion.div
                        className="absolute inset-0 bg-primary-100 dark:bg-primary-950/60 rounded-xl"
                        layoutId="activeTab"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <motion.form 
                onSubmit={handleSearch}
                className="relative w-full"
                whileFocus={{ scale: 1.02 }}
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties..."
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  {searchQuery && (
                    <motion.button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </div>
              </motion.form>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 group"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                      <User size={16} />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                      {user?.username || 'User'}
                    </span>
                    <ChevronDown 
                      size={14} 
                      className={`text-gray-400 transition-transform duration-200 ${
                        showProfileDropdown ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-56 glass-card overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.username || 'User'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
                        </div>
                        
                        <div className="p-1">
                          <Link
                            to="/client/bookings"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center">
                              <User size={16} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <div className="font-medium">My Bookings</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">View reservations</div>
                            </div>
                          </Link>
                          
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-950/60 flex items-center justify-center">
                              <Sparkles size={16} className="text-accent-600 dark:text-accent-400" />
                            </div>
                            <div>
                              <div className="font-medium">Profile Settings</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Manage account</div>
                            </div>
                          </Link>
                        </div>
                        
                        <div className="p-1 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileDropdown(false);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
                              <LogOut size={16} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">Logout</div>
                              <div className="text-xs text-red-500 dark:text-red-400">Sign out of account</div>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="btn-ghost text-sm font-medium"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="btn-primary text-sm"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden border-t border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search properties..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </form>

                {/* Mobile Nav Items */}
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <motion.div key={item.name} whileHover={{ x: 4 }}>
                      <Link
                        to={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                          location.pathname === item.path
                            ? 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-800'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          location.pathname === item.path
                            ? 'bg-primary-100 dark:bg-primary-950/60'
                            : 'bg-gray-100 dark:bg-surface-700'
                        }`}>
                          {item.name === 'Home' && <span className="text-primary-600 dark:text-primary-400">Home</span>}
                          {item.name === 'Properties' && <span className="text-primary-600 dark:text-primary-400">Properties</span>}
                          {item.name === 'About Us' && <span className="text-primary-600 dark:text-primary-400">About</span>}
                          {item.name === 'Contact' && <span className="text-primary-600 dark:text-primary-400">Contact</span>}
                        </div>
                        <div>
                          <div>{item.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile Auth */}
                {!isAuthenticated && (
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/login"
                        onClick={() => handleNavigation('/login')}
                        className="block w-full text-center px-4 py-3 rounded-xl border border-primary-500 text-primary-600 dark:text-primary-400 font-medium text-sm hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/register"
                        onClick={() => handleNavigation('/register')}
                        className="block w-full text-center px-4 py-3 rounded-xl gradient-primary text-white font-medium text-sm shadow-md hover:shadow-glow transition-all"
                      >
                        Sign Up
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default ProfessionalAppBar;
