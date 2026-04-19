import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReservations, fetchReservationStatistics } from '../../reservations/reservationsSlice';
import { fetchServices } from '../../services/servicesSlice';
import { fetchUsers } from '../../auth/authSlice';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';

const OwnerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reservations, statistics, isLoading } = useSelector((state) => state.reservations);
  const { services } = useSelector((state) => state.services);
  
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchReservationStatistics());
    dispatch(fetchReservations({ limit: 10 }));
    dispatch(fetchServices({ limit: 10 }));
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    dispatch(fetchReservationStatistics({ timeRange: newRange }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(statistics?.revenue?.total_revenue || 0),
      change: '+12.5%',
      changeType: 'positive',
      icon: 'Money',
      color: 'green',
    },
    {
      title: 'Total Reservations',
      value: statistics?.summary?.total || 0,
      change: '+8.2%',
      changeType: 'positive',
      icon: 'Calendar',
      color: 'blue',
    },
    {
      title: 'Active Services',
      value: services.filter(s => s.is_active).length,
      change: '+2',
      changeType: 'positive',
      icon: 'Tools',
      color: 'purple',
    },
    {
      title: 'Completion Rate',
      value: formatPercentage(
        (statistics?.summary?.completed || 0) / (statistics?.summary?.total || 1)
      ),
      change: '+5.1%',
      changeType: 'positive',
      icon: 'Check',
      color: 'emerald',
    },
  ];

  const recentActivity = statistics?.recent_activity || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.first_name}!
              </h1>
              <p className="text-gray-600">Here's what's happening with your business today</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button>Export Report</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`text-3xl ${stat.color === 'green' ? 'text-green-500' : 
                  stat.color === 'blue' ? 'text-blue-500' : 
                  stat.color === 'purple' ? 'text-purple-500' : 'text-emerald-500'
                }`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['overview', 'reservations', 'services', 'users', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {activity.service_detail?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.client_detail?.first_name} {activity.client_detail?.last_name} • 
                            {new Date(activity.date_time).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          activity.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          activity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="primary" className="w-full">
                    Add New Service
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Manage Staff
                  </Button>
                  <Button variant="secondary" className="w-full">
                    View Analytics
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'reservations' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reservations</h3>
                <div className="space-y-3">
                  {reservations.slice(0, 10).map((reservation) => (
                    <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {reservation.service_detail?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {reservation.client_detail?.first_name} {reservation.client_detail?.last_name} • 
                            {new Date(reservation.date_time).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          reservation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          reservation.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reservation.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                  <Button variant="primary">➕ Add Service</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.slice(0, 6).map((service) => (
                    <Card key={service.id} className="p-4">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {formatCurrency(service.price)}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                  <Button variant="primary">Invite User</Button>
                </div>
                <p className="text-gray-600">User management interface coming soon...</p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
                <p className="text-gray-600">Advanced analytics dashboard coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
