import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Users, Star, Heart, Sparkles, Filter, Grid, List, ArrowRight, Check } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { propertiesAPI } from "../../services/api";
import toast from "react-hot-toast";

// Import property images from assets
const propertyImages = [
  require("../../assets/images/photo.jpg"),
  require("../../assets/images/photo1.jpg"),
  require("../../assets/images/photo2.jpg"),
  require("../../assets/images/photo3.jpg"),
  require("../../assets/images/photo4.jpg"),
  require("../../assets/images/photo5.jpg"),
  require("../../assets/images/photo6.jpg"),
  require("../../assets/images/photo7.avif"),
  require("../../assets/images/photo8.jpg"),
  require("../../assets/images/photo9.jpg"),
  require("../../assets/images/photo10.jpg"),
  require("../../assets/images/photo11.jpg"),
  require("../../assets/images/photo12.jpg"),
  require("../../assets/images/photo13.jpg"),
  require("../../assets/images/photo14.jpg"),
];

const HomePage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });
  const [favorites, setFavorites] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [animatedProperties, setAnimatedProperties] = useState(new Set());

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await propertiesAPI.getAll();
        setProperties(response.data.results || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to fetch properties");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const filteredProperties = properties.filter((property, index) => {
    return (
      (searchData.location === "" ||
        property.location?.toLowerCase().includes(searchData.location.toLowerCase())) &&
      (searchData.guests === 1 || property.max_guests >= searchData.guests)
    );
  });

  // Animate properties as they come into view
  useEffect(() => {
    const timer = setTimeout(() => {
      const newAnimated = new Set(filteredProperties.slice(0, 6).map(p => p.id));
      setAnimatedProperties(newAnimated);
    }, 100);
    return () => clearTimeout(timer);
  }, [filteredProperties]);

  const toggleFavorite = (propertyId) => {
    const newFavorites = favorites.includes(propertyId)
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    if (newFavorites.includes(propertyId)) {
      toast.success("Added to favorites");
    } else {
      toast.success("Removed from favorites");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-surface flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <div className="w-full h-full rounded-full bg-gradient-primary flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.h2 
            className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Discovering Amazing Properties
          </motion.h2>
          <p className="text-gray-600 dark:text-gray-400">Finding your perfect stay...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 gradient-primary">
          <div className="absolute inset-0 bg-black/20" />
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 40% 50%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"
          animate={{ y: [0, -15, 0], x: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm"
          animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              animate={{ opacity: [0, 1], scale: [0.9, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-medium">Premium Stays Worldwide</span>
            </motion.div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect
              <motion.span 
                className="block text-yellow-300"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Dream Stay
              </motion.span>
            </h1>
            
            <motion.p 
              className="text-xl lg:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover extraordinary properties around the world with AIMO — where luxury meets comfort
            </motion.p>
          </motion.div>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className={`glass-card p-6 lg:p-8 transition-all duration-300 ${
              searchFocused ? 'shadow-glow scale-[1.02]' : ''
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Location Input */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchData.location}
                    onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </motion.div>

                {/* Check-in Date */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" />
                  <input
                    type="date"
                    placeholder="Check-in"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </motion.div>

                {/* Check-out Date */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" />
                  <input
                    type="date"
                    placeholder="Check-out"
                    value={searchData.checkOut}
                    onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </motion.div>

                {/* Guests Select */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" />
                  <select
                    value={searchData.guests}
                    onChange={(e) => setSearchData({ ...searchData, guests: parseInt(e.target.value) })}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4+ Guests</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </motion.div>

                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full lg:w-auto px-8 py-4 gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-glow transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <Search className="w-5 h-5" />
                  <span>Search Properties</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-3 mt-6">
                {['Beachfront', 'City Center', 'Mountain View', 'Luxury Villa'].map((filter) => (
                  <motion.button
                    key={filter}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200"
                  >
                    {filter}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Featured Properties</span>
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Handpicked Accommodations
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our curated selection of extraordinary properties for your perfect stay
            </p>
          </motion.div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredProperties.length} amazing properties found
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Grid className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <List className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Properties Grid/List */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
            >
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ 
                    opacity: animatedProperties.has(property.id) ? 1 : 0,
                    y: animatedProperties.has(property.id) ? 0 : 30
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: animatedProperties.has(property.id) ? index * 0.1 : 0,
                    ease: "easeOut"
                  }}
                  className={`group ${
                    viewMode === 'list' ? 'flex gap-6' : ''
                  }`}
                >
                  <div className={`glass-card overflow-hidden hover:shadow-glow transition-all duration-300 ${
                    viewMode === 'list' ? 'flex-1 flex' : ''
                  }`}>
                    {/* Property Image */}
                    <div className={`relative overflow-hidden ${
                      viewMode === 'list' ? 'w-80 h-60' : 'h-64'
                    }`}>
                      <img
                        src={propertyImages[index % propertyImages.length]}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Favorite Button */}
                      <motion.button
                        onClick={() => toggleFavorite(property.id)}
                        className={`absolute top-4 right-4 w-12 h-12 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                          favorites.includes(property.id)
                            ? 'bg-red-500 border-red-400 text-white'
                            : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart 
                          className="w-5 h-5" 
                          fill={favorites.includes(property.id) ? 'currentColor' : 'none'}
                        />
                      </motion.button>
                      
                      {/* Property Type Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary-600 text-white text-xs font-semibold backdrop-blur-sm">
                        {property.type || 'Premium'}
                      </div>
                      
                      {/* Quick Actions Overlay */}
                      <motion.div
                        className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ y: 10 }}
                        whileHover={{ y: 0 }}
                      >
                        <motion.button
                          className="flex-1 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg font-medium text-sm hover:bg-white transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Quick View
                        </motion.button>
                        <motion.button
                          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Book Now
                        </motion.button>
                      </motion.div>
                    </div>

                    {/* Property Details */}
                    <div className={`p-6 ${
                      viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''
                    }`}>
                      <div className={viewMode === 'list' ? 'flex-1' : ''}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {property.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                  {property.rating || '4.8'}
                                </span>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400 text-sm">
                                ({property.reviews_count || '128'} reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          <span className="text-sm">{property.location || 'Amazing Location'}</span>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-3 mb-6">
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-surface-800 rounded-lg">
                            <Users className="w-4 h-4 text-primary-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Up to {property.max_guests || 6} guests
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-surface-800 rounded-lg">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Flexible dates
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                              ${property.min_price || 299}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">/night</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Check className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Free cancellation</span>
                          </div>
                        </div>
                        <motion.div
                          className="flex gap-2"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Link
                            to={`/properties/${property.id}`}
                            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* No Results State */}
          <AnimatePresence>
            {filteredProperties.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-surface-800 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search filters or browse all properties
                </p>
                <motion.button
                  onClick={() => setSearchData({ location: '', checkIn: '', checkOut: '', guests: 1 })}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
