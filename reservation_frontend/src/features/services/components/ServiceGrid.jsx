import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchServices, clearSearchResults } from '../servicesSlice';
import ServiceCard from './ServiceCard';
import Loader from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

const ServiceGrid = ({ filters = [], showSearch = true }) => {
  const dispatch = useDispatch();
  const { services, isLoading, error, searchResults, isSearching } = useSelector((state) => state.services);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [localFilters, setLocalFilters] = React.useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
  });

  React.useEffect(() => {
    dispatch(fetchServices(localFilters));
  }, [dispatch, localFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchServices(searchQuery));
    } else {
      dispatch(clearSearchResults());
      dispatch(fetchServices(localFilters));
    }
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...localFilters, [filterName]: value };
    setLocalFilters(newFilters);
  };

  const displayServices = searchQuery.trim() ? searchResults : services;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Our Services</h1>
        
        {/* Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="flex-1"
              />
              <Button type="submit" loading={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {/* Categories will be loaded from API */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price
            </label>
            <Input
              type="number"
              value={localFilters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price
            </label>
            <Input
              type="number"
              value={localFilters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="1000"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="price">Price (Low to High)</option>
              <option value="-price">Price (High to Low)</option>
              <option value="duration_minutes">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        {searchQuery.trim() 
          ? `Found ${displayServices.length} results for "${searchQuery}"`
          : `Showing ${displayServices.length} services`
        }
      </div>

      {/* Services Grid */}
      {displayServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No services found</div>
          <p className="text-gray-400">
            {searchQuery.trim() 
              ? 'Try adjusting your search terms or filters'
              : 'Try adjusting your filters or check back later'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceGrid;
