import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Building2, Users, Clock, CheckCircle, LogIn, Briefcase } from 'lucide-react';
import { workersAPI } from '../../services/api';
import { fetchBookings } from '../../store/bookingsSlice';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const WorkerDashboard = () => {
  const dispatch = useDispatch();
  const { items: bookings, isLoading } = useSelector((s) => s.bookings);
  const user = useSelector((s) => s.auth.user);

  const [workerProfile, setWorkerProfile] = useState(null);
  const [workerBookings, setWorkerBookings] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, wBookings] = await Promise.all([
          workersAPI.myProfile(),
          workersAPI.myBookings(),
        ]);
        setWorkerProfile(profile.data);
        setWorkerBookings(Array.isArray(wBookings.data) ? wBookings.data : wBookings.data?.results || []);
      } catch {
        toast.error('Could not load worker data.');
      }
    };
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayArrivals = workerBookings.filter((b) => b.date_in === today && b.status === 'confirmed');
  const todayDepartures = workerBookings.filter((b) => b.date_out === today && b.status === 'confirmed');
  const pendingCount = workerBookings.filter((b) => b.status === 'pending').length;
  const assignedCount = workerProfile?.assigned_properties?.length || 0;

  const stats = [
    { icon: Building2, label: 'Assigned Properties', value: assignedCount, color: 'primary' },
    { icon: LogIn, label: "Today's Arrivals", value: todayArrivals.length, color: 'success' },
    { icon: LogIn, label: "Today's Departures", value: todayDepartures.length, color: 'warning' },
    { icon: Clock, label: 'Pending Bookings', value: pendingCount, color: 'danger' },
  ];

  const colorMap = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-red-100 text-red-600',
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.username || 'Worker'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}>
              <stat.icon size={18} />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Arrivals */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogIn size={18} className="text-green-500" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Today's Arrivals
              {todayArrivals.length > 0 && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {todayArrivals.length}
                </span>
              )}
            </h3>
          </div>
          {todayArrivals.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No arrivals today</p>
          ) : (
            <div className="space-y-3">
              {todayArrivals.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-surface-700/50">
                  <div>
                    <p className="font-medium text-sm">{b.guest_name || b.first_name || 'Guest'}</p>
                    <p className="text-xs text-gray-400">{b.property_name} · {b.num_nights}n</p>
                  </div>
                  <Badge status="confirmed" size="sm" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent bookings list */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-primary-500" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Recent Bookings</h3>
          </div>
          {workerBookings.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">No bookings assigned</p>
          ) : (
            <div className="space-y-3">
              {workerBookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-surface-700/50">
                  <div>
                    <p className="font-medium text-sm">{b.guest_name || b.first_name || 'Guest'}</p>
                    <p className="text-xs text-gray-400">{b.date_in} → {b.date_out}</p>
                  </div>
                  <Badge status={b.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Assigned properties */}
      {workerProfile?.assigned_properties?.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-primary-500" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">My Assigned Properties</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workerProfile.assigned_properties.map((p) => (
              <div key={p} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <Building2 size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">{p.name || `Property`}</p>
                  <p className="text-xs text-gray-400">{p.location || 'Location N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WorkerDashboard;
