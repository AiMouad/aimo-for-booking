import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users, Star, Heart } from "lucide-react";
import { useSelector } from "react-redux";
import { propertiesAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./HomePage.css";

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

  const filteredProperties = properties.filter((property) => {
    return (
      (searchData.location === "" ||
        property.location?.toLowerCase().includes(searchData.location.toLowerCase())) &&
      (searchData.guests === 1 || property.max_guests >= searchData.guests)
    );
  });

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
      <div className="home-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        >
          <Search className="spinner-icon" />
        </motion.div>
        <p>Loading amazing properties...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-content"
        >
          <h1 className="hero-title">
            Find Your Perfect <span className="hero-highlight">Stay</span>
          </h1>
          <p className="hero-subtitle">
            Discover amazing properties around the world with AIMO
          </p>
          
          {/* Search Bar */}
          <div className="search-bar">
            <div className="search-input-group">
              <MapPin className="search-icon" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={searchData.location}
                onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                className="search-input"
              />
            </div>
            
            <div className="search-input-group">
              <Calendar className="search-icon" />
              <input
                type="date"
                placeholder="Check-in"
                value={searchData.checkIn}
                onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                className="search-input"
              />
            </div>
            
            <div className="search-input-group">
              <Calendar className="search-icon" />
              <input
                type="date"
                placeholder="Check-out"
                value={searchData.checkOut}
                onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                className="search-input"
              />
            </div>
            
            <div className="search-input-group">
              <Users className="search-icon" />
              <select
                value={searchData.guests}
                onChange={(e) => setSearchData({ ...searchData, guests: parseInt(e.target.value) })}
                className="search-select"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4+ Guests</option>
              </select>
            </div>
            
            <button className="search-button">
              <Search className="search-button-icon" />
              Search
            </button>
          </div>
        </motion.div>
      </section>

      {/* Featured Properties */}
      <section className="featured-section">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="section-header"
        >
          <h2>Featured Properties</h2>
          <p>Handpicked accommodations for your perfect stay</p>
        </motion.div>

        <div className="properties-grid">
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="property-card"
            >
              {/* Property Image */}
              <div className="property-image-container">
                <img
                  src={property.media?.[0] || "/api/placeholder/property.jpg"}
                  alt={property.name}
                  className="property-image"
                />
                <button
                  onClick={() => toggleFavorite(property.id)}
                  className={`favorite-button ${favorites.includes(property.id) ? 'active' : ''}`}
                >
                  <Heart 
                    className={`favorite-icon ${favorites.includes(property.id) ? 'filled' : ''}`} 
                    fill={favorites.includes(property.id) ? 'currentColor' : 'none'}
                  />
                </button>
                <div className="property-type-badge">
                  {property.type}
                </div>
              </div>

              {/* Property Details */}
              <div className="property-details">
                <div className="property-header">
                  <h3 className="property-name">{property.name}</h3>
                  <div className="property-rating">
                    <Star className="rating-icon" />
                    <span>{property.rating || 'New'}</span>
                    <span className="rating-count">
                      ({property.reviews_count || 0} reviews)
                    </span>
                  </div>
                </div>

                <div className="property-location">
                  <MapPin className="location-icon" />
                  <span>{property.location}</span>
                </div>

                <div className="property-features">
                  <div className="feature">
                    <Users className="feature-icon" />
                    <span>Up to {property.max_guests} guests</span>
                  </div>
                  <div className="feature">
                    <Calendar className="feature-icon" />
                    <span>Flexible dates</span>
                  </div>
                </div>

                <div className="property-footer">
                  <div className="property-price">
                    <span className="price-amount">${property.min_price}</span>
                    <span className="price-period">/night</span>
                  </div>
                  <button className="view-property-button">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProperties.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="no-results"
          >
            <Search className="no-results-icon" />
            <h3>No properties found</h3>
            <p>Try adjusting your search filters</p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
