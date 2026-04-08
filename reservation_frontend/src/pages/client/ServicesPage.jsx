import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Building2, SlidersHorizontal, X } from 'lucide-react';
import { fetchProperties } from '../../store/propertiesSlice';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const PROPERTY_TYPES = ['All', 'hotel', 'apartment', 'residence', 'villa', 'office'];

const PropertyCard = ({ property }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="glass-card overflow-hidden group cursor-pointer"
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
      {property.media?.[0] ? (
        <img
          src={property.media[0]}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Building2 size={48} className="text-primary-300" />
        </div>
      )}
      <div className="absolute top-3 left-3">
        <span className="px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full capitalize">
          {property.type}
        </span>
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <span className="text-xs font-semibold text-gray-700">{property.rating?.toFixed(1) || '—'}</span>
      </div>
    </div>

    {/* Info */}
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{property.name}</h3>
      <div className="flex items-center gap-1 text-gray-400 text-sm mt-1 mb-3">
        <MapPin size={12} />
        <span className="truncate">{property.location}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {property.apartments_count || 0} units available
        </span>
        <Link to={`/services/${property.property_id}`}>
          <Button size="xs" variant="primary">View →</Button>
        </Link>
      </div>
    </div>
  </motion.div>
);

const ServicesPage = () => {
  const dispatch = useDispatch();
  const { items: properties, isLoading } = useSelector((s) => s.properties);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProperties({ is_public: true }));
  }, [dispatch]);

  const filtered = properties.filter((p) => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || p.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen gradient-surface">
      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="relative gradient-primary overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/5 rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Find Your Perfect Stay ✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg mb-8"
          >
            Browse our curated collection of properties and book instantly
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-xl mx-auto"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-2xl text-gray-800 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              id="services-search"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${typeFilter === type
                  ? 'gradient-primary text-white shadow-glow'
                  : 'bg-white dark:bg-surface-800 text-gray-600 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}
              `}
            >
              {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Loading...' : `${filtered.length} propert${filtered.length !== 1 ? 'ies' : 'y'} found`}
          </p>
        </div>

        {/* ── Grid ──────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="h-48 skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-4 skeleton rounded-lg w-3/4" />
                  <div className="h-3 skeleton rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 size={64} className="text-gray-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500">No properties found</h3>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            <Button variant="secondary" className="mt-4" onClick={() => { setSearch(''); setTypeFilter('All'); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((property) => (
              <PropertyCard key={property.property_id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
