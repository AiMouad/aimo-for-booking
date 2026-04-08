import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Plus, Pencil, Trash2, Building2, Mail,
  Phone, Check, AlertCircle, RefreshCw, UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, workersAPI, propertiesAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

const emptyWorkerForm = {
  username: '', email: '', first_name: '', last_name: '',
  phone: '', password: '', password_confirm: '',
};

const WorkerCard = ({ worker, properties, onAssign, onEdit }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-5"
  >
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white font-bold text-lg">
          {(worker.username || 'W')[0].toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">{worker.full_name || worker.username}</p>
        <p className="text-xs text-gray-400">@{worker.username}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          {worker.email && (
            <span className="flex items-center gap-1">
              <Mail size={11} />{worker.email}
            </span>
          )}
        </div>
      </div>
      <Badge status={worker.role === 'worker' ? 'confirmed' : 'pending'}
        label={worker.role} size="sm" />
    </div>

    {/* Assigned properties */}
    <div className="mt-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Assigned Properties</p>
      {properties.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No properties assigned</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {properties.map((p) => (
            <span key={p.property_id}
              className="text-xs px-2 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 rounded-lg">
              {p.name}
            </span>
          ))}
        </div>
      )}
    </div>

    <div className="mt-4 flex gap-2">
      <Button variant="secondary" size="xs" onClick={() => onAssign(worker)}
        leftIcon={<Building2 size={12} />} className="flex-1">
        Assign Properties
      </Button>
    </div>
  </motion.div>
);

const OwnerWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [workerProfiles, setWorkerProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null); // worker obj
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [form, setForm] = useState(emptyWorkerForm);
  const [formErrors, setFormErrors] = useState({});

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [wRes, pRes, wpRes] = await Promise.all([
        authAPI.getWorkers(),
        propertiesAPI.list(),
        workersAPI.list(),
      ]);
      setWorkers(Array.isArray(wRes.data) ? wRes.data : []);
      setAllProperties(Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || []);
      setWorkerProfiles(Array.isArray(wpRes.data) ? wpRes.data : wpRes.data?.results || []);
    } catch {
      toast.error('Failed to load workers data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getWorkerProperties = (worker) => {
    const profile = workerProfiles.find((p) => p.user?.id === worker.id);
    if (!profile) return [];
    const assignedIds = profile.assigned_properties || [];
    return allProperties.filter((p) =>
      assignedIds.includes(p.property_id) || assignedIds.includes(String(p.property_id))
    );
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!form.username) errors.username = 'Username is required';
    if (!form.password || form.password.length < 8) errors.password = 'Min 8 characters';
    if (form.password !== form.password_confirm) errors.password_confirm = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setIsSaving(true);
    try {
      await authAPI.register({ ...form, role: 'worker' });
      toast.success('Worker account created! 👷');
      setCreateModal(false);
      setForm(emptyWorkerForm);
      setFormErrors({});
      load();
    } catch (err) {
      const data = err.response?.data;
      if (data?.details) {
        setFormErrors(data.details);
      } else {
        toast.error(data?.error || 'Failed to create worker account.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!assignModal) return;
    const profile = workerProfiles.find((p) => p.user?.id === assignModal.id);
    if (!profile) { toast.error('Worker profile not found.'); return; }
    setIsSaving(true);
    try {
      await workersAPI.assignProperties(profile.id, selectedProperties);
      toast.success('Properties assigned! ✅');
      setAssignModal(null);
      load();
    } catch {
      toast.error('Failed to assign properties.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProperty = (propId) => {
    setSelectedProperties((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
  };

  const openAssign = (worker) => {
    const current = getWorkerProperties(worker).map((p) => p.property_id);
    setSelectedProperties(current);
    setAssignModal(worker);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{workers.length} staff member{workers.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={load} leftIcon={<RefreshCw size={14} />}>Refresh</Button>
          <Button size="sm" onClick={() => setCreateModal(true)} leftIcon={<UserPlus size={14} />} id="add-worker-btn">
            Add Worker
          </Button>
        </div>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="glass-card p-5 h-48 skeleton rounded-2xl" />)}
        </div>
      ) : workers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-16 text-center">
          <Users size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500">No workers yet</h3>
          <p className="text-gray-400 text-sm mt-2 mb-5">Add your first team member</p>
          <Button onClick={() => setCreateModal(true)} leftIcon={<UserPlus size={15} />}>Add Worker</Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workers.map((w) => (
            <WorkerCard key={w.id} worker={w}
              properties={getWorkerProperties(w)}
              onAssign={openAssign} onEdit={() => {}} />
          ))}
        </div>
      )}

      {/* ── Create Worker Modal ── */}
      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); setFormErrors({}); }}
        title="Add New Worker" size="md">
        <form onSubmit={handleCreateWorker} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="Ahmed" id="w-fname" />
            <Input label="Last Name" value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="Benali" id="w-lname" />
          </div>
          <Input label="Username" required value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="ahmed.worker" error={formErrors.username} id="w-username" />
          <Input label="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="ahmed@example.com" leftIcon={<Mail size={14} />} id="w-email" />
          <Input label="Phone" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+213 555 000 000" leftIcon={<Phone size={14} />} id="w-phone" />
          <Input label="Password" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 8 characters" error={formErrors.password} id="w-pass" />
          <Input label="Confirm Password" type="password" required value={form.password_confirm}
            onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
            placeholder="Repeat password" error={formErrors.password_confirm} id="w-passconf" />
          <Button type="submit" fullWidth isLoading={isSaving} id="create-worker-submit">
            Create Worker Account
          </Button>
        </form>
      </Modal>

      {/* ── Assign Properties Modal ── */}
      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={`Assign Properties — ${assignModal?.username}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
            <Button onClick={handleAssign} isLoading={isSaving}>
              Save Assignments ({selectedProperties.length})
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">Select which properties this worker can manage:</p>
          {allProperties.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No properties available to assign.</p>
          ) : (
            allProperties.map((p) => (
              <button key={p.property_id} onClick={() => toggleProperty(p.property_id)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left
                  ${selectedProperties.includes(p.property_id)
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <Building2 size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.location}</p>
                  </div>
                </div>
                {selectedProperties.includes(p.property_id) && (
                  <Check size={16} className="text-primary-500 flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OwnerWorkers;
