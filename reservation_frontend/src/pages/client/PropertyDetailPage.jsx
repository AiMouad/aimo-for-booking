import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  MapPin, Star, Calendar, Users, Wifi, Car, Coffee, Dumbbell, Droplets, 
  Utensils, Wind, Heart, Share2, ChevronLeft, Check, Shield, Clock,
  ArrowRight, Home, Bed, Bath, Square, Phone, Mail
} from 'lucide-react';
import { fetchPropertyDetail } from '../../store/propertiesSlice';
import { bookingsAPI } from '../../services/api';
import ProfessionalAppBar from '../../components/layout/ProfessionalAppBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './PropertyDetailPage.css';

const PropertyDetailPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selected: property, isLoading, error } = useSelector((state) => state.properties);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (propertyId) {
      dispatch(fetchPropertyDetail(propertyId));
    }
  }, [propertyId, dispatch]);

  const amenities = [
    { icon: Wifi, name: 'Free WiFi', available: true },
    { icon: Car, name: 'Parking', available: property?.has_parking },
    { icon: Coffee, name: 'Restaurant', available: property?.has_restaurant },
    { icon: Dumbbell, name: 'Gym', available: property?.has_gym },
    { icon: Droplets, name: 'Pool', available: property?.has_pool },
    { icon: Utensils, name: 'Kitchen', available: property?.has_kitchen },
    { icon: Wind, name: 'Air Conditioning', available: property?.has_ac },
  ];

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this property');
      navigate('/login');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    setIsBooking(true);
    try {
      const bookingPayload = {
        property: propertyId,
        date_in: bookingData.checkIn,
        date_out: bookingData.checkOut,
        guests: bookingData.guests,
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
        payment: calculateTotalPrice(),
        rest: 0
      };

      const response = await bookingsAPI.create(bookingPayload);
      toast.success('Booking confirmed! Check your email for details.');
      navigate('/client/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights * (property?.price_per_night || 0);
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.name,
        text: `Check out this amazing property: ${property?.name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="property-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="property-detail-error">
        <h2>Failed to Load Property</h2>
        <p>{error?.detail || 'Unable to load property details. Please try again.'}</p>
        <div className="error-actions">
          <Button onClick={() => dispatch(fetchPropertyDetail(propertyId))}>
            Retry
          </Button>
          <Button variant="outline" onClick={() => navigate('/services')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="property-detail-error">
        <h2>Property Not Found</h2>
        <p>The property you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/services')}>
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="property-detail-page">
      <ProfessionalAppBar />
      
      {/* Back Navigation */}
      <div className="back-navigation">
        <Button variant="outline" onClick={() => navigate('/services')}>
          <ChevronLeft size={16} />
          Back to Properties
        </Button>
      </div>

      {/* Property Header */}
      <section className="property-header">
        <div className="container">
          <div className="property-hero">
            <div className="property-images">
              <div className="main-image">
                <img 
                  src={property.media?.[0] || '/api/placeholder/property'} 
                  alt={property.name}
                />
              </div>
              <div className="image-gallery">
                {property.media?.slice(1, 4).map((image, index) => (
                  <div key={index} className="gallery-image">
                    <img src={image} alt={`${property.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="property-info">
              <div className="property-badges">
                <span className="property-type">{property.type}</span>
                {property.is_featured && <span className="featured-badge">Featured</span>}
              </div>
              
              <h1 className="property-title">{property.name}</h1>
              
              <div className="property-meta">
                <div className="location">
                  <MapPin size={16} />
                  <span>{property.location}</span>
                </div>
                <div className="rating">
                  <Star size={16} className="star-filled" />
                  <span>{property.rating || 4.5}</span>
                  <span className="rating-count">({property.reviews_count || 128} reviews)</span>
                </div>
              </div>
              
              <div className="property-actions">
                <button onClick={handleFavorite} className={`favorite-btn ${isFavorite ? 'active' : ''}`}>
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare} className="share-btn">
                  <Share2 size={20} />
                </button>
              </div>
              
              <div className="property-price">
                <span className="price-amount">${property.price_per_night || 89}</span>
                <span className="price-period">per night</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="booking-section">
        <div className="container">
          <div className="booking-content">
            {/* Property Details */}
            <div className="property-details">
              <div className="description-section">
                <h2>About this property</h2>
                <p>{property.description || 'Experience luxury and comfort in this beautiful property. Perfect for both business and leisure travelers, this accommodation offers modern amenities and exceptional service.'}</p>
              </div>
              
              <div className="features-section">
                <h2>Features & Amenities</h2>
                <div className="amenities-grid">
                  {amenities.map((amenity, index) => (
                    <div key={index} className={`amenity-item ${amenity.available ? 'available' : 'unavailable'}`}>
                      <amenity.icon size={20} />
                      <span>{amenity.name}</span>
                      {amenity.available && <Check size={16} />}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="property-specs">
                <h2>Property Specifications</h2>
                <div className="specs-grid">
                  <div className="spec-item">
                    <Bed size={20} />
                    <div>
                      <span className="spec-value">{property.bedrooms || 2}</span>
                      <span className="spec-label">Bedrooms</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Bath size={20} />
                    <div>
                      <span className="spec-value">{property.bathrooms || 1}</span>
                      <span className="spec-label">Bathrooms</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Square size={20} />
                    <div>
                      <span className="spec-value">{property.size || '85m²'}</span>
                      <span className="spec-label">Size</span>
                    </div>
                  </div>
                  <div className="spec-item">
                    <Users size={20} />
                    <div>
                      <span className="spec-value">{property.max_guests || 4}</span>
                      <span className="spec-label">Max Guests</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="location-section">
                <h2>Location</h2>
                <div className="location-info">
                  <div className="location-address">
                    <MapPin size={20} />
                    <span>{property.full_address || `${property.location}, Algeria`}</span>
                  </div>
                  <div className="location-highlights">
                    <div className="highlight-item">
                      <Check size={16} />
                      <span>City Center: {property.distance_to_center || '2.5'} km</span>
                    </div>
                    <div className="highlight-item">
                      <Check size={16} />
                      <span>Airport: {property.distance_to_airport || '15'} km</span>
                    </div>
                    <div className="highlight-item">
                      <Check size={16} />
                      <span>Public Transport: {property.distance_to_transport || '500'} m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Booking Card */}
            <div className="booking-card">
              <div className="booking-header">
                <h3>Book this property</h3>
                <div className="price-summary">
                  <span className="price">${property.price_per_night || 89}</span>
                  <span className="price-period">per night</span>
                </div>
              </div>
              
              <div className="booking-form">
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group">
                  <label>Check-out Date</label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group">
                  <label>Number of Guests</label>
                  <select
                    value={bookingData.guests}
                    onChange={(e) => setBookingData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  >
                    {[...Array(property.max_guests || 8)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} Guest{i + 1 > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div className="booking-summary">
                  <div className="summary-item">
                    <span>${property.price_per_night || 89} x {calculateNights()} nights</span>
                    <span>${calculateTotalPrice()}</span>
                  </div>
                  <div className="summary-item">
                    <span>Service fees</span>
                    <span>$0</span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>${calculateTotalPrice()}</span>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleBooking}
                  disabled={isBooking || !bookingData.checkIn || !bookingData.checkOut}
                  className="booking-button"
                >
                  {isBooking ? (
                    <>
                      <div className="btn-spinner"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <Calendar size={16} />
                      Book Now
                    </>
                  )}
                </Button>
                
                {!isAuthenticated && (
                  <p className="login-prompt">
                    <Link to="/login">Login</Link> to get member discounts
                  </p>
                )}
              </div>
              
              <div className="booking-guarantees">
                <div className="guarantee-item">
                  <Shield size={16} />
                  <span>Secure Booking</span>
                </div>
                <div className="guarantee-item">
                  <Clock size={16} />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PropertyDetailPage;
