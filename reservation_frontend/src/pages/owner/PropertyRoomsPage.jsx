import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Building2, MapPin, Star, Plus, Pencil, Trash2,
  Bed, Users, DollarSign, Eye, Home, CheckCircle, XCircle,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propertiesAPI, apartmentsAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const PropertyRoomsPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modals
  const [apartmentModal, setApartmentModal] = useState(false);
  const [apartmentEditTarget, setApartmentEditTarget] = useState(null);
  const [apartmentDeleteTarget, setApartmentDeleteTarget] = useState(null);
  
  const [apartmentForm, setApartmentForm] = useState({
    name: '', capacity: 2, price_per_night: 0, description: '',
    amenities: [], is_available: true,
  });

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    setIsLoading(true);
    try {
      const [propertyRes, apartmentsRes] = await Promise.all([
        propertiesAPI.get(propertyId),
        apartmentsAPI.list(propertyId)
      ]);
      setProperty(propertyRes.data);
      setApartments(Array.isArray(apartmentsRes.data) ? apartmentsRes.data : apartmentsRes.data.results || []);
    } catch (err) {
      toast.error('Failed to load property details.');
      navigate('/owner/properties');
    } finally {
      setIsLoading(false);
    }
  };

  const openApartmentCreate = () => {
    setApartmentForm({ name: '', capacity: 2, price_per_night: 0, description: '', amenities: [], is_available: true });
    setApartmentEditTarget(null);
    setApartmentModal(true);
  };

  const openApartmentEdit = (apartment) => {
    setApartmentEditTarget(apartment);
    setApartmentForm({
      name: apartment.name || '',
      capacity: apartment.capacity || 2,
      price_per_night: apartment.price_per_night || 0,
      description: apartment.description || '',
      amenities: apartment.amenities || [],
      is_available: apartment.is_available ?? true,
    });
    setApartmentModal(true);
  };

  const handleApartmentSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (apartmentEditTarget) {
        await apartmentsAPI.update(apartmentEditTarget.id, apartmentForm);
        toast.success('Room updated!');
      } else {
        await apartmentsAPI.create(propertyId, apartmentForm);
        toast.success('Room created!');
      }
      setApartmentModal(false);
      setApartmentEditTarget(null);
      loadProperty();
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Save failed.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApartmentDelete = async () => {
    if (!apartmentDeleteTarget) return;
    try {
      await apartmentsAPI.delete(apartmentDeleteTarget.id);
      toast.success('Room deleted.');
      setApartmentDeleteTarget(null);
      loadProperty();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Delete failed.';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Property not found</p>
          <Button onClick={() => navigate('/owner/properties')} className="mt-4">
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-surface pb-8">
      {/* Header */}
      <div className="glass border-b border-white/30 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/owner/properties')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{property.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} />
                <span>{property.location}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{property.type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Property Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Home size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{apartments.length}</p>
                <p className="text-xs text-gray-500">Total Rooms</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {apartments.filter(a => a.is_available).length}
                </p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Star size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {property.rating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Eye size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{property.views || 0}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rooms & Apartments</h2>
              <p className="text-sm text-gray-500">Manage your property units</p>
            </div>
            <Button onClick={openApartmentCreate} leftIcon={<Plus size={18} />}>
              Add Room
            </Button>
          </div>

          {apartments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <Bed size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">No rooms yet</h3>
              <p className="text-sm text-gray-400 mt-2 mb-6">Add your first room to start receiving bookings</p>
              <Button onClick={openApartmentCreate} leftIcon={<Plus size={18} />}>
                Add First Room
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apartments.map((apt) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Bed size={24} className="text-gray-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openApartmentEdit(apt)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setApartmentDeleteTarget(apt)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{apt.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{apt.description || 'No description'}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Users size={14} />
                        {apt.capacity}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <DollarSign size={14} />
                        {apt.price_per_night}/night
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      apt.is_available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {apt.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apartment Form Modal */}
      <Modal
        isOpen={apartmentModal}
        onClose={() => { setApartmentModal(false); setApartmentEditTarget(null); }}
        title={apartmentEditTarget ? 'Edit Room' : 'Add New Room'}
        size="md"
      >
        <form onSubmit={handleApartmentSubmit} className="space-y-4">
          <Input
            label="Room Name"
            required
            value={apartmentForm.name}
            onChange={(e) => setApartmentForm({ ...apartmentForm, name: e.target.value })}
            placeholder="e.g. Room 101, Deluxe Suite"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Capacity"
              type="number"
              required
              min="1"
              value={apartmentForm.capacity}
              onChange={(e) => setApartmentForm({ ...apartmentForm, capacity: parseInt(e.target.value) })}
              placeholder="2"
            />
            <Input
              label="Price per Night ($)"
              type="number"
              required
              min="0"
              value={apartmentForm.price_per_night}
              onChange={(e) => setApartmentForm({ ...apartmentForm, price_per_night: parseFloat(e.target.value) })}
              placeholder="100"
            />
          </div>
          <div>
            <label className="aimo-label">Description</label>
            <textarea
              value={apartmentForm.description}
              onChange={(e) => setApartmentForm({ ...apartmentForm, description: e.target.value })}
              placeholder="Brief description of the room..."
              className="aimo-input resize-none h-20"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={apartmentForm.is_available}
                onChange={(e) => setApartmentForm({ ...apartmentForm, is_available: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer
                peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5
                after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4
                after:transition-all peer-checked:bg-primary-600 dark:bg-gray-700" />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Available for booking</span>
            </label>
          </div>
          <Button type="submit" fullWidth isLoading={isSaving}>
            {apartmentEditTarget ? 'Save Changes' : 'Create Room'}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!apartmentDeleteTarget}
        onClose={() => setApartmentDeleteTarget(null)}
        title="Delete Room"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setApartmentDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleApartmentDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete "{apartmentDeleteTarget?.name}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default PropertyRoomsPage;
