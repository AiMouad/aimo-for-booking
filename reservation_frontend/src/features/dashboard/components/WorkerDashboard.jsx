import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUpcomingReservations, fetchReservationHistory, updateReservationStatus } from '../../reservations/reservationsSlice';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';

const WorkerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    upcomingReservations, 
    reservationHistory, 
    isLoading 
  } = useSelector((state) => state.reservations);
  
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    dispatch(fetchUpcomingReservations());
    dispatch(fetchReservationHistory());
  }, [dispatch]);

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      await dispatch(updateReservationStatus({ 
        id: reservationId, 
        status: newStatus 
      })).unwrap();
    } catch (error) {
      console.error('Failed to update reservation status:', error);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const todayReservations = upcomingReservations.filter(r => 
    new Date(r.date_time).toDateString() === new Date().toDateString()
  );

  const upcomingReservationsFiltered = upcomingReservations.filter(r => 
    new Date(r.date_time) > new Date()
  );

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
                Worker Dashboard
              </h1>
              <p className="text-gray-600">Manage your schedule and reservations</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome back, {user?.first_name}!
              </div>
              <Button variant="secondary">⚙️ Profile Settings</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{todayReservations.length}</p>
              </div>
              <div className="text-3xl text-blue-500">Calendar</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingReservationsFiltered.length}</p>
              </div>
              <div className="text-3xl text-purple-500">Clock</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingReservations.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
              <div className="text-3xl text-yellow-500">Pending</div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservationHistory.filter(r => r.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="text-3xl text-green-500">✅</div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['schedule', 'upcoming', 'history', 'availability'].map((tab) => (
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
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    View Schedule for:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Today's Schedule */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                  {todayReservations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-6xl mb-4">Calendar</div>
                      <p>No reservations for today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayReservations.map((reservation) => (
                        <Card key={reservation.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {reservation.service_detail?.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatDateTime(reservation.date_time)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Client: {reservation.client_detail?.first_name} {reservation.client_detail?.last_name}
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                {formatCurrency(reservation.total_price)}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                {reservation.status}
                              </span>
                              {reservation.status === 'PENDING' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleStatusUpdate(reservation.id, 'CONFIRMED')}
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleStatusUpdate(reservation.id, 'CANCELLED')}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                              {reservation.status === 'CONFIRMED' && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleStatusUpdate(reservation.id, 'COMPLETED')}
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reservations</h3>
                {upcomingReservationsFiltered.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No upcoming reservations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingReservationsFiltered.map((reservation) => (
                      <Card key={reservation.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {reservation.service_detail?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(reservation.date_time)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Client: {reservation.client_detail?.first_name} {reservation.client_detail?.last_name}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation History</h3>
                {reservationHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No reservation history</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservationHistory.slice(0, 20).map((reservation) => (
                      <Card key={reservation.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {reservation.service_detail?.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(reservation.date_time)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Client: {reservation.client_detail?.first_name} {reservation.client_detail?.last_name}
                            </p>
                            {reservation.rating && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-medium">{reservation.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Availability</h3>
                <p className="text-gray-600 mb-4">
                  Set your working hours and availability for bookings
                </p>
                <div className="text-center py-8">
                  <Button variant="primary" className="mr-4">
                    Calendar Set Working Hours
                  </Button>
                  <Button variant="secondary">
                    Block Dates
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
