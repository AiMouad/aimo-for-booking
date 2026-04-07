import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyReservations, cancelReservation, rateReservation } from '../reservationsSlice';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Loader from '../../../components/common/Loader';

const MyReservations = () => {
  const dispatch = useDispatch();
  const { upcomingReservations, reservationHistory, isLoading } = useSelector((state) => state.reservations);
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('upcoming');
  const [rating, setRating] = useState({});
  const [review, setReview] = useState({});

  useEffect(() => {
    dispatch(fetchMyReservations());
  }, [dispatch]);

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await dispatch(cancelReservation(reservationId)).unwrap();
        dispatch(fetchMyReservations());
      } catch (error) {
        alert('Failed to cancel reservation: ' + (error.detail || error.message));
      }
    }
  };

  const handleRateReservation = async (reservationId) => {
    try {
      await dispatch(rateReservation({
        id: reservationId,
        rating: rating[reservationId],
        review: review[reservationId]
      })).unwrap();
      dispatch(fetchMyReservations());
      setRating({ ...rating, [reservationId]: 0 });
      setReview({ ...review, [reservationId]: '' });
    } catch (error) {
      alert('Failed to rate reservation: ' + (error.detail || error.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancel = (reservation) => {
    const now = new Date();
    const reservationDate = new Date(reservation.date_time);
    const hoursUntil = (reservationDate - now) / (1000 * 60 * 60);
    return hoursUntil > 24 && ['PENDING', 'CONFIRMED'].includes(reservation.status);
  };

  const canRate = (reservation) => {
    return reservation.status === 'COMPLETED' && !reservation.rating;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reservations</h1>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['upcoming', 'history'].map((tab) => (
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
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'upcoming' && (
            <>
              {upcomingReservations.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-gray-500">
                    <h3 className="text-lg font-medium mb-2">No Upcoming Reservations</h3>
                    <p className="mb-4">You don't have any upcoming reservations.</p>
                    <Button onClick={() => window.location.href = '/services'}>
                      Browse Services
                    </Button>
                  </div>
                </Card>
              ) : (
                upcomingReservations.map((reservation) => (
                  <Card key={reservation.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.service_detail?.name}
                          </h3>
                          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>
                        
                        <div className="text-gray-600 mb-2">
                          <p className="flex items-center mb-1">
                            <span className="font-medium">Date & Time:</span>
                            <span className="ml-2">{formatDate(reservation.date_time)}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium">Price:</span>
                            <span className="ml-2">${reservation.service_detail?.price}</span>
                          </p>
                          {reservation.notes && (
                            <p className="flex items-center mt-2">
                              <span className="font-medium">Notes:</span>
                              <span className="ml-2">{reservation.notes}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {canCancel(reservation) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCancelReservation(reservation.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        
                        {canRate(reservation) && (
                          <div className="space-y-2">
                            <select
                              value={rating[reservation.id] || ''}
                              onChange={(e) => setRating({ ...rating, [reservation.id]: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            >
                              <option value="">Rate this service</option>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <option key={star} value={star}>
                                  {star} {star === 1 ? 'star' : 'stars'}
                                </option>
                              ))}
                            </select>
                            
                            {rating[reservation.id] && (
                              <>
                                <textarea
                                  value={review[reservation.id] || ''}
                                  onChange={(e) => setReview({ ...review, [reservation.id]: e.target.value })}
                                  placeholder="Write a review (optional)"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  rows={2}
                                />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleRateReservation(reservation.id)}
                                >
                                  Submit Review
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              {reservationHistory.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-gray-500">
                    <h3 className="text-lg font-medium mb-2">No Reservation History</h3>
                    <p className="mb-4">You haven't completed any reservations yet.</p>
                    <Button onClick={() => window.location.href = '/services'}>
                      Browse Services
                    </Button>
                  </div>
                </Card>
              ) : (
                reservationHistory.map((reservation) => (
                  <Card key={reservation.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.service_detail?.name}
                          </h3>
                          <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>
                        
                        <div className="text-gray-600 mb-2">
                          <p className="flex items-center mb-1">
                            <span className="font-medium">Date & Time:</span>
                            <span className="ml-2">{formatDate(reservation.date_time)}</span>
                          </p>
                          <p className="flex items-center">
                            <span className="font-medium">Price:</span>
                            <span className="ml-2">${reservation.service_detail?.price}</span>
                          </p>
                          {reservation.rating && (
                            <p className="flex items-center mt-2">
                              <span className="font-medium">Your Rating:</span>
                              <span className="ml-2">
                                {'⭐'.repeat(reservation.rating)} ({reservation.rating}/5)
                              </span>
                            </p>
                          )}
                          {reservation.review && (
                            <p className="flex items-center mt-2">
                              <span className="font-medium">Your Review:</span>
                              <span className="ml-2">{reservation.review}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReservations;
