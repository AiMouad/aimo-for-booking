import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Pencil, Trash2, Eye, MapPin,
  Star, Home, RefreshCw, AlertCircle, ChevronDown, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propertiesAPI } from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const PROPERTY_TYPES = ['hotel', 'apartment', 'residence', 'villa', 'office'];

const emptyForm = {
  name: '', type: 'apartment', location: '', description: '',
  amenities: [], is_public: true,
};

const PropertyCard = ({ property, onEdit, onDelete, onView }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    className="glass-card overflow-hidden group"
  >
    {/* Image / placeholder */}
    <div className="relative h-44 bg-gradient-to-br from-primary-50 to-accent-100 dark:from-primary-950/30 dark:to-accent-900/20 overflow-hidden">
      {property.media?.[0] ? (
        <img src={property.media[0]} alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="flex items-center justify-center h-full">
          <Building2 size={48} className="text-primary-200 dark:text-primary-800" />
        </div>
      )}
      <div className="absolute top-3 left-3">
        <span className="text-xs px-2 py-1 bg-black/40 backdrop-blur-sm text-white rounded-full capitalize">
          {property.type}
        </span>
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-white/90 rounded-full">
        <Star size={11} className="text-amber-400 fill-amber-400" />
        <span className="text-xs font-semibold text-gray-700">{property.rating?.toFixed(1) || '—'}</span>
      </div>
      {!property.is_public && (
        <div className="absolute bottom-3 left-3 text-xs px-2 py-0.5 bg-amber-500/80 text-white rounded-full">
          Hidden
        </div>
      )}
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{property.name}</h3>
      <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
        <MapPin size={11} /><span className="truncate">{property.location}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">
          {property.apartments_count || 0} unit{(property.apartments_count || 0) !== 1 ? 's' : ''}
        </span>
        <div className="flex gap-1">
          <button onClick={() => onView(property)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="View">
            <Eye size={14} />
          </button>
          <button onClick={() => onEdit(property)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(property)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const PropertyForm = ({ form, onChange, onSubmit, isLoading, title }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <Input label="Property Name" required value={form.name}
      onChange={(e) => onChange('name', e.target.value)}
      placeholder="e.g. Grand Luxury Hotel" id="prop-name" />

    <div>
      <label className="aimo-label">Type <span className="text-red-500">*</span></label>
      <select value={form.type} onChange={(e) => onChange('type', e.target.value)}
        className="aimo-input">
        {PROPERTY_TYPES.map((t) => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>
    </div>

    <Input label="Location" required value={form.location}
      onChange={(e) => onChange('location', e.target.value)}
      placeholder="City, Country" id="prop-location"
      leftIcon={<MapPin size={15} />} />

    <div>
      <label className="aimo-label">Description</label>
      <textarea value={form.description} onChange={(e) => onChange('description', e.target.value)}
        placeholder="Brief description of the property..."
        className="aimo-input resize-none h-24" />
    </div>

    <div className="flex items-center gap-3">
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={form.is_public}
          onChange={(e) => onChange('is_public', e.target.checked)}
          className="sr-only peer" />
        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer
          peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5
          after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4
          after:transition-all peer-checked:bg-primary-600 dark:bg-gray-700" />
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Visible to public</span>
      </label>
    </div>

    <Button type="submit" fullWidth isLoading={isLoading} id="prop-submit">
      {title}
    </Button>
  </form>
);

const OwnerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modals
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await propertiesAPI.list();
      setProperties(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error('Failed to load properties.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setEditTarget(null); setFormModal(true); };
  const openEdit = (property) => {
    setEditTarget(property);
    setForm({
      name: property.name || '',
      type: property.type || 'apartment',
      location: property.location || '',
      description: property.description || '',
      is_public: property.is_public ?? true,
    });
    setFormModal(true);
  };

  const handleField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editTarget) {
        await propertiesAPI.update(editTarget.property_id, form);
        toast.success('Property updated! ✅');
      } else {
        await propertiesAPI.create(form);
        toast.success('Property created! 🏢');
      }
      setFormModal(false);
      setEditTarget(null);
      load();
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Save failed.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await propertiesAPI.delete(deleteTarget.property_id);
      toast.success('Property deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Delete failed. Check for active bookings.';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Properties</h1>
          <p className="text-sm text-gray-500 mt-0.5">{properties.length} properties managed</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={load} leftIcon={<RefreshCw size={14} />}>
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} leftIcon={<Plus size={14} />} id="add-property-btn">
            Add Property
          </Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="h-44 skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-4 skeleton rounded-lg w-3/4" />
                <div className="h-3 skeleton rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-16 text-center">
          <Building2 size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500">No properties yet</h3>
          <p className="text-gray-400 text-sm mt-2 mb-5">Create your first property to get started</p>
          <Button onClick={openCreate} leftIcon={<Plus size={15} />}>Add First Property</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {properties.map((p) => (
            <PropertyCard key={p.property_id} property={p}
              onEdit={openEdit} onDelete={setDeleteTarget} onView={setViewTarget} />
          ))}
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      <Modal
        isOpen={formModal}
        onClose={() => { setFormModal(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Property' : 'Add New Property'}
        size="md"
      >
        <PropertyForm
          form={form} onChange={handleField}
          onSubmit={handleSubmit} isLoading={isSaving}
          title={editTarget ? 'Save Changes' : 'Create Property'}
        />
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Property"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-red-700 dark:text-red-300">
              Delete "{deleteTarget?.name}"?
            </p>
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              This will also delete all apartments and booking history. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>

      {/* ── View Modal ── */}
      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Property Details"
        size="md"
      >
        {viewTarget && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Name', viewTarget.name],
                ['Type', viewTarget.type],
                ['Location', viewTarget.location],
                ['Rating', `${viewTarget.rating?.toFixed(1) || 0} / 5.0`],
                ['Units', viewTarget.apartments_count || 0],
                ['Views', viewTarget.views || 0],
                ['Visibility', viewTarget.is_public ? 'Public' : 'Hidden'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-400 font-medium">{k}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{String(v)}</p>
                </div>
              ))}
            </div>
            {viewTarget.description && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 font-medium mb-1">Description</p>
                <p className="text-gray-600 dark:text-gray-400">{viewTarget.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OwnerProperties;
