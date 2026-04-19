import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateReservationStatus, cancelReservation, rateReservation } from '../reservationsSlice';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Loader from '../../../components/common/Loader';

const ReservationCard = ({ reservation, showActions = true }) => {
  const dispatch = useDispatch();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      NO_SHOW: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      NO_SHOW: 'No Show',
    };
    return icons[status] || 'Booked';
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateReservationStatus({ 
        id: reservation.id, 
        status: newStatus 
      })).unwrap();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(cancelReservation(reservation.id)).unwrap();
      setShowCancelModal(false);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRate = async () => {
    if (rating < 1 || rating > 5) {
      alert('Please provide a rating between 1 and 5');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(rateReservation({ 
        id: reservation.id, 
        rating, 
        review 
      })).unwrap();
      setShowRatingModal(false);
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Failed to rate reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCancel = reservation.can_cancel || reservation.status === 'PENDING';
  const canRate = reservation.status === 'COMPLETED' && !reservation.rating;

  return (
    <>
      <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                {getStatusIcon(reservation.status)} {reservation.status}
              </span>
              {reservation.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium">{reservation.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Service Info */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reservation.service_detail?.name}
            </h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Provider:</span>
                <span>
                  {reservation.worker_detail?.first_name} {reservation.worker_detail?.last_name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Date & Time:</span>
                <span>{formatDateTime(reservation.date_time)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Duration:</span>
                <span>{reservation.duration_minutes || reservation.service_detail?.duration_minutes} minutes</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Price:</span>
                <span className="font-semibold text-blue-600">
                  {formatPrice(reservation.total_price || reservation.service_detail?.price)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {reservation.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Notes:</span> {reservation.notes}
                </p>
              </div>
            )}

            {/* Review */}
            {reservation.review && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Review:</span> {reservation.review}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col gap-2 ml-4">
              {canCancel && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              
              {canRate && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowRatingModal(true)}
                  disabled={isSubmitting}
                >
                  Rate Service
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Reservation"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this reservation? This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              disabled={isSubmitting}
            >
              Keep Reservation
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader size="sm" /> : 'Confirm Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Rate Your Experience"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            How was your experience with this service?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    rating >= star
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-600'
                      : 'border-gray-300 hover:border-gray-400 text-gray-400'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowRatingModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRate}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader size="sm" /> : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReservationCard;
