import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bell, Search, Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import { selectUser } from '../../store/authSlice';
import ChatbotWidget from '../chatbot/ChatbotWidget';

/**
 * DashboardLayout — shared layout for owner, worker, and admin interfaces.
 * Features collapsible sidebar, top navbar, and notification bell.
 */
const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const user = useSelector(selectUser);
  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-surface dark:gradient-dark">
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <div className="hidden md:flex flex-shrink-0" style={{ width: sidebarWidth }}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapse={() => setSidebarCollapsed((p) => !p)}
        />
      </div>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────────── */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 z-40 h-full md:hidden" style={{ width: 260 }}>
            <Sidebar onCollapse={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 glass border-b border-white/30 dark:border-gray-700/50 flex-shrink-0">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="btn-ghost md:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative hidden sm:flex items-center">
            <Search size={16} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="aimo-input pl-9 py-2 w-64 text-sm"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <button className="relative btn-ghost w-11 h-11 rounded-xl flex items-center justify-center">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center cursor-pointer shadow-sm">
              <span className="text-white text-sm font-bold">
                {(user?.username || 'U')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6 max-w-[1600px] mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: 'white',
            color: '#1a1a2e',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            padding: '12px 16px',
          },
        }}
      />

      {/* AI Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
};

export default DashboardLayout;
