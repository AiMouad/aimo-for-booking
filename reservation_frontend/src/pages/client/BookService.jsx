import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import serviceService from '../../services/service.service';
import reservationService from '../../services/reservation.service';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const BookService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    worker: '',
    date_time: '',
    notes: ''
  });

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const serviceData = await serviceService.getById(id);
      setService(serviceData);
      // TODO: Fetch available workers for this service
      setWorkers([]); // Placeholder
    } catch (error) {
      console.error('Failed to fetch service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!booking.worker || !booking.date_time) {
      alert('Please select a worker and date/time');
      return;
    }

    try {
      await reservationService.create({
        service: id,
        worker: booking.worker,
        date_time: booking.date_time,
        notes: booking.notes
      });
      navigate('/my-reservations');
    } catch (error) {
      console.error('Failed to create reservation:', error);
      alert('Failed to create reservation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Service not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Service</h1>
      
      {/* Service Details */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{service.name}</h2>
        <p className="text-gray-600 mb-4">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">${service.price}</span>
          <span className="text-gray-500">{service.duration_minutes} minutes</span>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* Worker Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Worker
            </label>
            <select
              value={booking.worker}
              onChange={(e) => setBooking({ ...booking, worker: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a worker...</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.first_name} {worker.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date and Time
            </label>
            <input
              type="datetime-local"
              value={booking.date_time}
              onChange={(e) => setBooking({ ...booking, date_time: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={booking.notes}
              onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any special requests or notes..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/services')}
            >
              Cancel
            </Button>
            <Button type="submit">
              Confirm Booking
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookService;
