import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, CreditCard, Phone, Mail, Eye, X, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { bookingsAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./MyBookingsPage.css";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const { user } = useSelector((state) => state.auth);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await bookingsAPI.getMyBookings();
        setBookings(response.data.results || []);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to fetch bookings");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingsAPI.cancel(bookingId);
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );
      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "cli-status-confirmed";
      case "pending":
        return "cli-status-pending";
      case "cancelled":
        return "cli-status-cancelled";
      default:
        return "cli-status-pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <AlertCircle className="status-icon confirmed" />;
      case "pending":
        return <Clock className="status-icon pending" />;
      case "cancelled":
        return <X className="status-icon cancelled" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bookings-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        >
          <Calendar className="spinner-icon" />
        </motion.div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-error">
        <AlertCircle className="error-icon" />
        <h3>Error loading bookings</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="cli-bookings-page">
      <div className="cli-bookings-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="cli-bookings-header"
        >
          <h1 className="cli-bookings-title">My Bookings</h1>
          <p className="cli-bookings-subtitle">
            Manage your reservations and view booking details
          </p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="cli-bookings-empty"
          >
            <Calendar className="cli-bookings-empty-icon" />
            <h3 className="cli-bookings-empty-title">No Bookings Yet</h3>
            <p className="cli-bookings-empty-message">
              Start exploring and book your next adventure!
            </p>
            <button 
              className="explore-button"
              onClick={() => window.location.href = "/"}
            >
              Explore Properties
            </button>
          </motion.div>
        ) : (
          <div className="cli-bookings-list">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="cli-booking-card"
              >
                <div className="cli-booking-content">
                  <div className="cli-booking-image-container">
                    <img
                      src={booking.apartment?.media?.[0] || "/api/placeholder/property.jpg"}
                      alt={booking.apartment?.name}
                      className="cli-booking-image"
                    />
                    <div className="cli-booking-overlay">
                      <span className="cli-booking-id">#{booking.id.slice(0, 8)}</span>
                      <div className="cli-booking-status-badge">
                        {getStatusIcon(booking.status)}
                      </div>
                    </div>
                  </div>

                  <div className="cli-booking-details">
                    <div className="cli-booking-header">
                      <div className="cli-booking-info">
                        <h3 className="cli-booking-room-type">
                          {booking.apartment?.name || "Apartment"}
                        </h3>
                        <p className="cli-booking-location">
                          <MapPin className="cli-location-icon" />
                          {booking.property_obj?.location || "Location"}
                        </p>
                        <div className="cli-booking-meta">
                          <span className="cli-booking-date">
                            <Calendar className="cli-meta-icon" />
                            Booked on {formatDate(booking.created_at)}
                          </span>
                          <span className="cli-booking-price">
                            ${booking.payment || 0}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`cli-booking-status ${getStatusColor(booking.status)}`}
                      >
                        {booking.status === "confirmed" ? "Confirmed" : 
                         booking.status === "pending" ? "Pending" : "Cancelled"}
                      </span>
                    </div>

                    <div className="cli-booking-dates-grid">
                      <div className="cli-booking-date-item">
                        <p className="cli-date-label">Check-in</p>
                        <p className="cli-date-value">
                          {formatDate(booking.date_in)}
                        </p>
                      </div>
                      <div className="cli-booking-date-item">
                        <p className="cli-date-label">Check-out</p>
                        <p className="cli-date-value">
                          {formatDate(booking.date_out)}
                        </p>
                      </div>
                      <div className="cli-booking-date-item">
                        <p className="cli-date-label">Nights</p>
                        <p className="cli-date-value">
                          <Clock className="cli-nights-icon" />
                          {booking.num_nights || 1}
                        </p>
                      </div>
                      <div className="cli-booking-date-item">
                        <p className="cli-date-label">Total</p>
                        <p className="cli-date-value cli-total-price">
                          ${booking.payment + (booking.rest || 0)}
                        </p>
                      </div>
                    </div>

                    {booking.transaction_id && (
                      <div className="cli-booking-transaction">
                        <p className="cli-transaction-id">
                          <strong>Transaction ID:</strong> {booking.transaction_id}
                        </p>
                      </div>
                    )}

                    <div className="cli-booking-actions">
                      <button
                        className="cli-btn cli-btn-primary"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <Eye className="cli-btn-icon" />
                        View Details
                      </button>

                      <button className="cli-btn cli-btn-secondary">
                        <Phone className="cli-btn-icon" />
                        Contact Support
                      </button>

                      {booking.status === "pending" && (
                        <button
                          className={`cli-btn cli-btn-danger ${cancellingId === booking.id ? 'loading' : ''}`}
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="btn-spinner"
                              />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <X className="cli-btn-icon" />
                              Cancel Booking
                            </>
                          )}
                        </button>
                      )}

                      {booking.status === "confirmed" && (
                        <button className="cli-btn cli-btn-outline">
                          <Calendar className="cli-btn-icon" />
                          Modify Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={handleClosePopup}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button onClick={handleClosePopup} className="modal-close">
                <X />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="booking-detail-section">
                <h3>Property Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Property:</label>
                    <span>{selectedBooking.property_obj?.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Apartment:</label>
                    <span>{selectedBooking.apartment?.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>{selectedBooking.property_obj?.location}</span>
                  </div>
                </div>
              </div>

              <div className="booking-detail-section">
                <h3>Booking Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Check-in:</label>
                    <span>{formatDate(selectedBooking.date_in)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Check-out:</label>
                    <span>{formatDate(selectedBooking.date_out)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nights:</label>
                    <span>{selectedBooking.num_nights}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Amount:</label>
                    <span className="total-amount">
                      ${selectedBooking.payment + (selectedBooking.rest || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="booking-detail-section">
                <h3>Guest Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedBooking.first_name} {selectedBooking.last_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{user?.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedBooking.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      )}
    </div>
  );
};

export default MyBookingsPage;
