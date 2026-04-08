import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Calendar, Search, Filter, Check, X, Eye,
  RefreshCw, ChevronDown, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchBookings, confirmBooking,
} from '../../store/bookingsSlice';
import { bookingsAPI } from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'refused', label: 'Refused' },
  { key: 'cancelled', label: 'Cancelled' },
];

const BookingRow = ({ booking, onConfirm, onRefuse, onView }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-gray-800"
  >
    <td className="py-3.5 px-4">
      <div>
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {booking.guest_name || `${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'Guest'}
        </p>
        <p className="text-xs text-gray-400">{booking.phone || '—'}</p>
      </div>
    </td>
    <td className="py-3.5 px-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{booking.property_name}</p>
      <p className="text-xs text-gray-400">{booking.apartment_name || '—'}</p>
    </td>
    <td className="py-3.5 px-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.date_in}</p>
      <p className="text-xs text-gray-400">{booking.num_nights} night{booking.num_nights > 1 ? 's' : ''}</p>
    </td>
    <td className="py-3.5 px-4">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        ${Number(booking.payment || 0).toFixed(0)}
      </p>
      {booking.is_paid
        ? <span className="text-xs text-emerald-500">✓ Paid</span>
        : <span className="text-xs text-amber-500">Pending</span>
      }
    </td>
    <td className="py-3.5 px-4">
      <Badge status={booking.status} size="sm" />
    </td>
    <td className="py-3.5 px-4">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onView(booking)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          title="View details"
        >
          <Eye size={15} />
        </button>
        {booking.status === 'pending' && (
          <>
            <button
              onClick={() => onConfirm(booking.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Confirm"
            >
              <Check size={15} />
            </button>
            <button
              onClick={() => onRefuse(booking)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Refuse"
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>
    </td>
  </motion.tr>
);

const OwnerBookings = () => {
  const dispatch = useDispatch();
  const { items: bookings, isLoading } = useSelector((s) => s.bookings);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refuseModal, setRefuseModal] = useState(null);
  const [refuseNote, setRefuseNote] = useState('');
  const [isRefusing, setIsRefusing] = useState(false);

  const load = useCallback(() => {
    const params = {};
    if (activeTab !== 'all') params.status = activeTab;
    dispatch(fetchBookings(params));
  }, [dispatch, activeTab]);

  useEffect(() => { load(); }, [load]);

  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.first_name?.toLowerCase().includes(q) ||
      b.last_name?.toLowerCase().includes(q) ||
      b.property_name?.toLowerCase().includes(q) ||
      b.guest_name?.toLowerCase().includes(q) ||
      b.phone?.includes(q)
    );
  });

  const handleConfirm = async (id) => {
    const result = await dispatch(confirmBooking(id));
    if (confirmBooking.fulfilled.match(result)) {
      toast.success('Booking confirmed! ✅');
    } else {
      toast.error('Failed to confirm booking.');
    }
  };

  const handleRefuse = async () => {
    if (!refuseModal) return;
    setIsRefusing(true);
    try {
      await bookingsAPI.refuse(refuseModal.id, { notes: refuseNote });
      toast.success('Booking refused.');
      setRefuseModal(null);
      setRefuseNote('');
      load();
    } catch {
      toast.error('Failed to refuse booking.');
    } finally {
      setIsRefusing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all reservations</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={load}
          leftIcon={<RefreshCw size={14} />}
        >
          Refresh
        </Button>
      </div>

      {/* Main card */}
      <div className="glass-card p-0 overflow-hidden">
        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700">
          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                  ${activeTab === tab.key
                    ? 'gradient-primary text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'}
                `}
              >
                {tab.label}
                {tab.key !== 'all' && (
                  <span className="ml-1.5 text-[10px] opacity-70">
                    ({bookings.filter((b) => b.status === tab.key).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest, property..."
              className="aimo-input pl-9 py-2 text-sm w-full sm:w-64"
              id="bookings-search"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60 dark:bg-surface-800/60">
              <tr>
                {['Guest', 'Property', 'Check-in', 'Amount', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 skeleton rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No bookings found</p>
                    <p className="text-sm mt-1">Try changing the filters or refreshing</p>
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onConfirm={handleConfirm}
                    onRefuse={(b) => setRefuseModal(b)}
                    onView={(b) => setSelectedBooking(b)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!isLoading && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        )}
      </div>

      {/* ── View Booking Modal ── */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Guest', selectedBooking.guest_name || `${selectedBooking.first_name} ${selectedBooking.last_name}`],
                ['Phone', selectedBooking.phone || '—'],
                ['Property', selectedBooking.property_name],
                ['Apartment', selectedBooking.apartment_name || '—'],
                ['Check-in', selectedBooking.date_in],
                ['Check-out', selectedBooking.date_out],
                ['Nights', `${selectedBooking.num_nights} night(s)`],
                ['Payment', `$${Number(selectedBooking.payment || 0).toFixed(2)}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{value}</p>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <Badge status={selectedBooking.status} size="md" />
              {selectedBooking.notes && (
                <p className="text-xs text-gray-500 italic">"{selectedBooking.notes}"</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Refuse Modal ── */}
      <Modal
        isOpen={!!refuseModal}
        onClose={() => { setRefuseModal(null); setRefuseNote(''); }}
        title="Refuse Booking"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRefuseModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleRefuse} isLoading={isRefusing}>
              Confirm Refusal
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-medium">Refuse booking for {refuseModal?.guest_name || 'Guest'}?</p>
              <p className="text-xs mt-1 opacity-80">This will restore the apartment's availability.</p>
            </div>
          </div>
          <div>
            <label className="aimo-label">Reason (optional)</label>
            <textarea
              value={refuseNote}
              onChange={(e) => setRefuseNote(e.target.value)}
              placeholder="Enter a reason for the refusal..."
              className="aimo-input resize-none h-24"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OwnerBookings;
