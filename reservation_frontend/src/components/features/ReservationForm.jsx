import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import reservationService from '../../services/reservation.service';

const ReservationForm = ({ service, workers = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    worker: '',
    start_datetime: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        service: service.id,
        worker: parseInt(formData.worker),
        start_datetime: formData.start_datetime,
        notes: formData.notes,
      };

      await reservationService.create(data);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Worker
        </label>
        <select
          name="worker"
          value={formData.worker}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a worker...</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.full_name || worker.username}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Date & Time"
        type="datetime-local"
        name="start_datetime"
        value={formData.start_datetime}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any special requests..."
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Book Reservation
      </Button>
    </form>
  );
};

export default ReservationForm;