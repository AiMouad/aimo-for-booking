import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar, MapPin, Clock, CheckCircle, XCircle,
  AlertCircle, Building2, Moon, Ban,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMyBookings, cancelBooking } from '../../store/bookingsSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'refused', 'cancelled'];

const BookingCard = ({ booking, onCancel }) => {
  const canCancel = booking.status === 'pending';
  const statusIcons = {
    pending: <Clock size={16} className="text-amber-500" />,
    confirmed: <CheckCircle size={16} className="text-emerald-500" />,
    refused: <XCircle size={16} className="text-red-500" />,
    cancelled: <Ban size={16} className="text-gray-400" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 flex flex-col sm:flex-row gap-4"
    >
      {/* Property thumbnail */}
      <div className="w-full sm:w-28 h-24 sm:h-auto rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-950/30 dark:to-accent-900/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <Building2 size={32} className="text-primary-300 dark:text-primary-700" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {booking.property_name}
            </h3>
            {booking.apartment_name && (
              <p className="text-xs text-gray-400 mt-0.5">{booking.apartment_name}</p>
            )}
          </div>
          <Badge status={booking.status} size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-3">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={13} className="flex-shrink-0" />
            <span>Check-in: <strong className="text-gray-700 dark:text-gray-300">{booking.date_in}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar size={13} className="flex-shrink-0" />
            <span>Check-out: <strong className="text-gray-700 dark:text-gray-300">{booking.date_out}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Moon size={13} className="flex-shrink-0" />
            <span>{booking.num_nights} night{booking.num_nights > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              ${Number(booking.payment || 0).toFixed(0)}
              {booking.is_paid
                ? <span className="text-emerald-500 text-xs ml-1">✓ Paid</span>
                : <span className="text-amber-500 text-xs ml-1">Pending</span>}
            </span>
          </div>
        </div>

        {booking.notes && (
          <p className="text-xs text-gray-400 italic mt-2 bg-gray-50 dark:bg-surface-700 rounded-lg px-3 py-2">
            "{booking.notes}"
          </p>
        )}

        {/* Actions */}
        {canCancel && (
          <div className="mt-3 flex gap-2">
            <Button
              variant="danger"
              size="xs"
              onClick={() => onCancel(booking)}
              leftIcon={<XCircle size={13} />}
            >
              Cancel Booking
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ClientBookings = () => {
  const dispatch = useDispatch();
  const { myItems: bookings, isLoading } = useSelector((s) => s.bookings);
  const [filter, setFilter] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    const result = await dispatch(cancelBooking(cancelTarget.id));
    if (cancelBooking.fulfilled.match(result)) {
      toast.success('Booking cancelled.');
      setCancelTarget(null);
    } else {
      toast.error('Could not cancel this booking.');
    }
    setIsCancelling(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 px-4 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reservations</h1>
        <p className="text-sm text-gray-500 mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all
              ${filter === s
                ? 'gradient-primary text-white shadow-sm'
                : 'bg-white dark:bg-surface-800 text-gray-500 border border-gray-200 dark:border-gray-700'}
            `}
          >
            {s === 'all' ? 'All' : s}
            {s !== 'all' && (
              <span className="ml-1.5 opacity-60">
                ({bookings.filter((b) => b.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-5 h-36 skeleton rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-16 text-center">
          <Calendar size={56} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">
            {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            {filter === 'all'
              ? 'Browse our services to make your first reservation.'
              : 'Try a different filter above.'}
          </p>
          {filter === 'all' && (
            <Button variant="secondary" className="mt-5" onClick={() => window.location.href = '/services'}>
              Browse Services →
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={setCancelTarget} />
          ))}
        </div>
      )}

      {/* Cancel confirm modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>Keep Booking</Button>
            <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
              Yes, Cancel
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-300">
              Cancel your reservation at {cancelTarget?.property_name}?
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
              Check-in: {cancelTarget?.date_in} · {cancelTarget?.num_nights} night(s)
            </p>
            <p className="text-amber-500 text-xs mt-2">
              Only pending bookings can be self-cancelled. Confirmed bookings require staff assistance.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientBookings;
