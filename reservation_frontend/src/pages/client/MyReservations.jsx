import React, { useState, useEffect } from 'react';
import reservationService from '../../services/reservation.service';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await reservationService.getAll();
      setReservations(data.results || data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;

    try {
      await reservationService.cancel(cancelModal.id, cancelReason);
      await fetchReservations();
      setCancelModal(null);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reservations</h1>

      {reservations.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No reservations found
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reservation.service_detail?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    With {reservation.worker_detail?.first_name} {reservation.worker_detail?.last_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(reservation.date_time).toLocaleString()}
                  </p>
                  {reservation.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      Notes: {reservation.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      reservation.status
                    )}`}
                  >
                    {reservation.status}
                  </span>

                  {reservation.status === 'PENDING' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelModal(reservation)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Reservation"
      >
        <div className="space-y-4">
          <p>Are you sure you want to cancel this reservation?</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Why are you canceling?"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setCancelModal(null)}>
              Keep Reservation
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyReservations;