import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Calendar, Home, Users, Settings,
  MessageSquare, BarChart3, Building2, LogOut,
  Briefcase, Bell, ChevronLeft, Bot,
} from 'lucide-react';
import { logoutUser } from '../../store/authSlice';
import { selectUser } from '../../store/authSlice';
import { toggleChat } from '../../store/chatbotSlice';
import LanguageSwitcher from '../common/LanguageSwitcher';
import ThemeToggle from '../common/ThemeToggle';
import Logo_Aimo from '../../assets/IMGs/Logo_Aimo.png';

const getRoleNavigation = (username) => ({
  owner: [
    { path: `/owner/${username}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { path: `/owner/${username}/properties`, icon: Building2, label: 'Properties' },
    { path: `/owner/${username}/bookings`, icon: Calendar, label: 'Bookings' },
    { path: `/owner/${username}/workers`, icon: Users, label: 'Workers' },
    { path: `/owner/${username}/messages`, icon: MessageSquare, label: 'Messages' },
    { path: `/owner/${username}/analytics`, icon: BarChart3, label: 'Analytics' },
    { action: 'chatbot', icon: Bot, label: 'AI Assistant' },
  ],
  worker: [
    { path: `/worker/${username}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { path: `/worker/${username}/bookings`, icon: Calendar, label: 'Bookings' },
    { path: `/worker/${username}/properties`, icon: Building2, label: 'My Properties' },
    { path: '/chatbot', icon: Bot, label: 'AI Assistant' },
  ],
  client: [
    { path: '/services', icon: Home, label: 'Browse Services' },
    { path: `/client/${username}/bookings`, icon: Calendar, label: 'My Bookings' },
  ],
  admin: [
    { path: `/owner/${username}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { path: `/owner/${username}/properties`, icon: Building2, label: 'Properties' },
    { path: `/owner/${username}/bookings`, icon: Calendar, label: 'Bookings' },
    { path: `/owner/${username}/workers`, icon: Users, label: 'Workers' },
    { path: `/owner/${username}/analytics`, icon: BarChart3, label: 'Analytics' },
  ],
});

const Sidebar = ({ collapsed = false, onCollapse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const role = user?.role || 'client';
  const username = user?.username || 'user';
  const roleNavigation = getRoleNavigation(username);
  const navItems = roleNavigation[role] || roleNavigation.client;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen flex flex-col glass border-r border-white/30 dark:border-gray-700/50 relative z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/20 dark:border-gray-700/40">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <img 
            src={Logo_Aimo} 
            alt="AIMO" 
            className="w-full h-full object-contain"
          />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-lg font-bold" style={{ color: '#087592' }}>AIMO</h1>
              <p className="text-[10px] text-gray-400 -mt-1 leading-tight">Booking Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          // Handle action-based items (like chatbot toggle)
          if (item.action === 'chatbot') {
            return (
              <button
                key={item.action}
                onClick={() => dispatch(toggleChat())}
                className="sidebar-item group w-full text-left"
              >
                <item.icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="font-medium text-sm leading-none"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          }

          // Handle path-based navigation items
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item group ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="font-medium text-sm leading-none"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* User profile + logout */}
      <div className="p-3 border-t border-white/20 dark:border-gray-700/40 space-y-2">
        {/* Profile mini */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {(user?.username || 'U')[0].toUpperCase()}
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {user?.username || 'User'}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">{role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Switcher & Theme Toggle */}
        <div className="px-3 mb-2 flex items-center justify-between">
          <LanguageSwitcher variant="buttons" />
          <ThemeToggle />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      {onCollapse && (
        <button
          onClick={onCollapse}
          className="absolute -right-3 top-20 w-6 h-6 glass rounded-full flex items-center justify-center shadow-md border border-white/40 text-gray-500 hover:text-primary-600 transition-colors"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft size={12} />
          </motion.div>
        </button>
      )}
    </motion.aside>
  );
};

export default Sidebar;
