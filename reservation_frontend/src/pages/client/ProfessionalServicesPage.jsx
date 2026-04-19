import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Star, MapPin, Building2, SlidersHorizontal, X, 
  Home, Users, Shield, Award, Clock, Heart, TrendingUp,
  Wifi, Car, Coffee, Dumbbell, Droplets, Utensils, Wind
} from 'lucide-react';
import { fetchProperties } from '../../store/propertiesSlice';
import ProfessionalAppBar from '../../components/layout/ProfessionalAppBar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import heroBg from '../../assets/images/photo1.jpg';
import aboutImage from '../../assets/images/photo2.jpg';
import placeholderImage from '../../assets/images/photo3.jpg';
import photo4 from '../../assets/images/photo4.jpg';
import photo5 from '../../assets/images/photo5.jpg';
import photo6 from '../../assets/images/photo6.jpg';
import photo7 from '../../assets/images/photo7.avif';
import photo8 from '../../assets/images/photo8.jpg';
import photo9 from '../../assets/images/photo9.jpg';
import photo10 from '../../assets/images/photo10.jpg';
import photo11 from '../../assets/images/photo11.jpg';
import photo12 from '../../assets/images/photo12.jpg';

const PROPERTY_TYPES = ['All', 'hotel', 'apartment', 'residence', 'villa', 'office'];
const AMENITIES = [
  { icon: Wifi, name: 'Free WiFi' },
  { icon: Car, name: 'Parking' },
  { icon: Coffee, name: 'Restaurant' },
  { icon: Dumbbell, name: 'Gym' },
  { icon: Droplets, name: 'Pool' },
  { icon: Utensils, name: 'Kitchen' },
  { icon: Wind, name: 'AC' },
];

const PropertyCard = ({ property, index }) => {
  const placeholderImages = [
    placeholderImage,
    photo4,
    photo5,
    photo6,
    photo7,
    photo8,
  ];
  const fallbackImage = placeholderImages[index % placeholderImages.length];
  
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8 }}
    className="property-card"
  >
    {/* Image */}
    <div className="property-image-container">
      {property.media?.[0] ? (
        <img
          src={property.media[0]}
          alt={property.name}
          className="property-image"
        />
      ) : (
        <img
          src={fallbackImage}
          alt={property.name || 'Property'}
          className="property-image"
        />
      )}
      <div className="property-overlay">
        <div className="property-type-badge">
          {property.type}
        </div>
        <div className="property-rating">
          <Star size={12} className="star-icon" />
          <span>{property.rating?.toFixed(1) || '4.5'}</span>
        </div>
        <button className="favorite-button">
          <Heart size={16} />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="property-content">
      <div className="property-header">
        <h3 className="property-name">{property.name}</h3>
        <div className="property-location">
          <MapPin size={14} />
          <span>{property.location}</span>
        </div>
      </div>
      
      <div className="property-amenities">
        {AMENITIES.slice(0, 3).map((amenity, index) => (
          <div key={index} className="amenity-item">
            <amenity.icon size={12} />
          </div>
        ))}
      </div>
      
      <div className="property-footer">
        <div className="property-info">
          <span className="property-units">{property.apartments_count || 0} units</span>
          <span className="property-price">From ${property.price_per_night || 89}/night</span>
        </div>
        <Link to={`/services/${property.property_id}`}>
          <Button size="sm" variant="primary">{t('common.view')}</Button>
        </Link>
      </div>
    </div>
  </motion.div>
  );
};

const StatsSection = () => {
  const stats = [
    { icon: Home, value: '500+', label: 'Properties' },
    { icon: Users, value: '10K+', label: 'Happy Guests' },
    { icon: Shield, value: '24/7', label: 'Support' },
    { icon: Award, value: '4.8', label: 'Average Rating' },
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const statImages = [photo9, photo10, photo11, photo12];
            const statImage = statImages[index % statImages.length];
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
              style={{ backgroundImage: `url(${statImage})` }}
            >
              <div className="stat-card-overlay">
                <div className="stat-icon">
                  <stat.icon size={24} />
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => (
  <section className="about-section">
    <div className="container">
      <div className="about-content">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="about-text"
        >
          <h2>About AIMO</h2>
          <p className="about-description">
            Welcome to AIMO, your premier destination for luxury accommodations in Algeria. 
            We specialize in providing exceptional stays that combine comfort, convenience, 
            and authentic local experiences.
          </p>
          <p className="about-description">
            Our carefully curated portfolio features handpicked properties across the most 
            desirable locations, ensuring every guest enjoys a memorable stay tailored to 
            their unique preferences.
          </p>
          <div className="about-features">
            <div className="feature">
              <Shield size={20} />
              <span>Verified Properties</span>
            </div>
            <div className="feature">
              <Clock size={20} />
              <span>24/7 Customer Support</span>
            </div>
            <div className="feature">
              <TrendingUp size={20} />
              <span>Best Price Guarantee</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="about-visual"
        >
          <img src={aboutImage} alt="About AIMO" className="about-image" />
          <div className="about-visual-card">
            <div className="about-visual-text">
              <span className="about-visual-number">500+</span>
              <span className="about-visual-label">Premium Properties</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const ProfessionalServicesPage = () => {
  const { t } = useTranslation();
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
    <div className="professional-services-page">
      <ProfessionalAppBar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-content"
          >
            <h1 className="hero-title">{t('landing.heroTitle')}</h1>
            <p className="hero-subtitle">
              {t('landing.heroSubtitle')}
            </p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hero-search"
            >
              <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder={t('landing.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="search-clear">
                    <X size={16} />
                  </button>
                )}
              </div>
              <Button size="lg" variant="primary" leftIcon={<Search size={18} />}>
                {t('landing.browseProperties')}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* About Section */}
      <AboutSection />

      {/* Properties Section */}
      <section className="properties-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="section-header"
          >
            <h2 className="section-title">{t('landing.featuredProperties')}</h2>
            <p className="section-subtitle">
              {t('landing.popularDestinations')}
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="filters-container"
          >
            <div className="filter-tabs">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`filter-tab ${typeFilter === type ? 'active' : ''}`}
                >
                  {type === 'All' ? t('common.all') : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="advanced-filters"
            >
              <SlidersHorizontal size={16} />
              {t('common.filter')}
            </button>
          </motion.div>

          {/* Results */}
          <div className="results-header">
            <p className="results-count">
              {isLoading ? t('common.loading') : `${filtered.length} ${filtered.length !== 1 ? 'properties' : 'property'} found`}
            </p>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="properties-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="property-card skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-results">
              <Building2 size={64} />
              <h3>{t('errors.failedToLoad')}</h3>
              <p>{t('landing.searchPlaceholder')}</p>
              <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter('All'); }}>
                {t('common.clear')}
              </Button>
            </div>
          ) : (
            <div className="properties-grid">
              {filtered.map((property, index) => (
                <PropertyCard key={property.property_id} property={property} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfessionalServicesPage;
