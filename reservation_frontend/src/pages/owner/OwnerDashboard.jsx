import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Building2, Calendar, DollarSign, Users,
  TrendingUp, CheckCircle, Clock, XCircle,
  ArrowUpRight, LogIn, LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../../services/api';
import Badge from '../../components/common/Badge';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const StatCard = ({ icon: Icon, label, value, sub, color = 'primary', trend }) => (
  <motion.div variants={item} className="stat-card">
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center
        ${color === 'primary' ? 'bg-primary-100 text-primary-600' :
          color === 'success' ? 'bg-emerald-100 text-emerald-600' :
          color === 'warning' ? 'bg-amber-100 text-amber-600' :
          'bg-red-100 text-red-600'
        }`}>
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          <ArrowUpRight size={12} className={trend < 0 ? 'rotate-180' : ''} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 shadow-xl border border-white/40 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const OwnerDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, mo, rb, oc] = await Promise.all([
          analyticsAPI.overview(),
          analyticsAPI.monthly(6),
          analyticsAPI.recentBookings(),
          analyticsAPI.occupancy(),
        ]);
        setOverview(ov.data);
        setMonthly(mo.data);
        setRecentBookings(Array.isArray(rb.data) ? rb.data : rb.data?.results || []);
        setOccupancy(oc.data?.slice(-14) || []);
      } catch {
        toast.error('Failed to load analytics data.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 h-32 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge status="active" label="Live" animated size="md" />
        </div>
      </motion.div>

      {/* ── Today stats row ───────────────────────────────────── */}
      {overview && (
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-card p-4 flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <LogIn size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{overview.arrivals_today}</p>
              <p className="text-xs text-gray-500">Arrivals today</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <LogOut size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{overview.departures_today}</p>
              <p className="text-xs text-gray-500">Departures today</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{overview.active_guests}</p>
              <p className="text-xs text-gray-500">Active guests</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{overview.pending_bookings}</p>
              <p className="text-xs text-gray-500">Pending requests</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Main Stat Cards ───────────────────────────────────── */}
      {overview && (
        <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue"
            value={`$${Number(overview.total_revenue).toLocaleString()}`}
            sub={`$${Number(overview.monthly_revenue).toLocaleString()} this month`}
            color="success" />
          <StatCard icon={Calendar} label="Total Bookings"
            value={overview.total_bookings}
            sub={`${overview.confirmed_bookings} confirmed`}
            color="primary" />
          <StatCard icon={Building2} label="Properties"
            value={overview.total_properties}
            sub={`${overview.total_apartments} apartments`}
            color="primary" />
          <StatCard icon={CheckCircle} label="Confirmed"
            value={overview.confirmed_bookings}
            sub={`${overview.cancelled_bookings} cancelled`}
            color="success" />
        </motion.div>
      )}

      {/* ── Charts Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue + Bookings Chart */}
        {monthly.length > 0 && (
          <motion.div variants={item} className="glass-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Revenue & Bookings</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last {monthly.length} months</p>
              </div>
              <TrendingUp size={18} className="text-primary-500" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(221,90%,52%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(221,90%,52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue ($)"
                  stroke="hsl(221,90%,52%)" fill="url(#revenue-grad)" strokeWidth={2} />
                <Bar dataKey="bookings" name="Bookings"
                  fill="hsl(262,90%,56%)" radius={[4,4,0,0]} opacity={0.7} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Occupancy Mini Chart */}
        {occupancy.length > 0 && (
          <motion.div variants={item} className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Occupancy</h3>
                <p className="text-xs text-gray-400 mt-0.5">Last 14 days</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={occupancy} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }}
                  tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" name="Occupancy %" fill="hsl(158,65%,40%)"
                  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* ── Recent Bookings ───────────────────────────────────── */}
      {recentBookings.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Recent Bookings</h3>
            <a href="/owner/bookings" className="text-primary-600 text-sm font-medium hover:underline">
              View all →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['Guest', 'Property', 'Check-in', 'Nights', 'Status'].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {recentBookings.slice(0, 8).map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">
                      {booking.guest_name || booking.first_name || 'Guest'}
                    </td>
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                      {booking.property_name}
                    </td>
                    <td className="py-3 px-3 text-gray-500">
                      {booking.date_in}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{booking.num_nights}n</td>
                    <td className="py-3 px-3">
                      <Badge status={booking.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OwnerDashboard;
