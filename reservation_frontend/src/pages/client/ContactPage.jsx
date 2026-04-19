import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, Send, MessageCircle, Building2,
  Users, Headphones, HelpCircle, Star, CheckCircle
} from 'lucide-react';
import ProfessionalAppBar from '../../components/layout/ProfessionalAppBar';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone Support',
      value: '+213 123 456 789',
      description: 'Available 24/7 for urgent inquiries',
      action: 'tel:+213123456789'
    },
    {
      icon: Mail,
      title: 'Email Support',
      value: 'info@aimo-dz.com',
      description: 'We respond within 24 hours',
      action: 'mailto:info@aimo-dz.com'
    },
    {
      icon: MapPin,
      title: 'Head Office',
      value: 'Algiers, Algeria',
      description: 'Visit us for in-person support',
      action: '#'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Mon-Sat: 9AM-6PM',
      description: '24/7 Emergency Support Available',
      action: '#'
    }
  ];

  const supportCategories = [
    {
      icon: Building2,
      title: 'Property Issues',
      description: 'Problems with your booked property',
      email: 'properties@aimo-dz.com'
    },
    {
      icon: Users,
      title: 'Account Support',
      description: 'Login, registration, profile issues',
      email: 'accounts@aimo-dz.com'
    },
    {
      icon: Headphones,
      title: 'Technical Support',
      description: 'Website or app technical problems',
      email: 'tech@aimo-dz.com'
    },
    {
      icon: HelpCircle,
      title: 'General Inquiries',
      description: 'Other questions and feedback',
      email: 'info@aimo-dz.com'
    }
  ];

  const faqs = [
    {
      question: 'How do I book a property?',
      answer: 'Simply browse our properties, select your dates, and follow the booking process. Payment is secure and instant.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel up to 24 hours before check-in for a full refund. Check our cancellation policy for details.'
    },
    {
      question: 'Are the properties verified?',
      answer: 'All our properties are verified by our team to ensure quality and safety standards.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards, debit cards, and popular digital payment methods.'
    },
    {
      question: 'How do I contact the property owner?',
      answer: 'After booking, you\'ll receive the property owner\'s contact details in your confirmation email.'
    }
  ];

  const testimonials = [
    {
      name: 'Mohamed Ben',
      role: 'Business Traveler',
      content: 'Excellent service! The booking process was smooth and the property exceeded expectations.',
      rating: 5
    },
    {
      name: 'Sara Lamine',
      role: 'Tourist',
      content: 'AIMO made my Algeria trip unforgettable. Great properties and amazing customer support.',
      rating: 5
    },
    {
      name: 'Karim T.',
      role: 'Property Owner',
      content: 'Partnering with AIMO has been great for my business. Professional and reliable platform.',
      rating: 5
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We\'ll respond within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <ProfessionalAppBar />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-content"
          >
            <h1 className="hero-title">Contact Us</h1>
            <p className="hero-subtitle">
              We're here to help you with any questions or concerns. 
              Reach out to our dedicated support team.
            </p>
            <div className="hero-breadcrumb">
              <Link to="/services">Home</Link>
              <span>/</span>
              <span>Contact</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="container">
          <div className="contact-info-grid">
            {contactInfo.map((info, index) => (
              <motion.a
                key={index}
                href={info.action}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="contact-info-card"
              >
                <div className="contact-icon">
                  <info.icon size={24} />
                </div>
                <h3>{info.title}</h3>
                <p className="contact-value">{info.value}</p>
                <p className="contact-description">{info.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="main-contact-section">
        <div className="container">
          <div className="contact-content">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="contact-form-container"
            >
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and we'll get back to you soon.</p>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+213 123 456 789"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="property">Property Question</option>
                      <option value="payment">Payment Issue</option>
                      <option value="technical">Technical Support</option>
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  disabled={isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Support Categories */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="support-categories"
            >
              <h2>How Can We Help?</h2>
              <p>Choose the right support category for faster assistance.</p>
              
              <div className="categories-grid">
                {supportCategories.map((category, index) => (
                  <div key={index} className="category-card">
                    <div className="category-icon">
                      <category.icon size={20} />
                    </div>
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                    <a href={`mailto:${category.email}`} className="category-email">
                      {category.email}
                    </a>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="section-header"
          >
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </motion.div>
          
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="faq-card"
              >
                <div className="faq-question">
                  <MessageCircle size={20} />
                  <h3>{faq.question}</h3>
                </div>
                <p className="faq-answer">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="section-header"
          >
            <h2>What Our Customers Say</h2>
            <p>Real experiences from our valued customers</p>
          </motion.div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="testimonial-card"
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="star-filled" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Support */}
      <section className="emergency-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="emergency-content"
          >
            <div className="emergency-icon">
              <Phone size={32} />
            </div>
            <h2>24/7 Emergency Support</h2>
            <p>
              For urgent issues during your stay, call our emergency hotline for immediate assistance.
            </p>
            <div className="emergency-contact">
              <a href="tel:+213123456789" className="emergency-phone">
                +213 123 456 789
              </a>
              <span className="emergency-label">Emergency Hotline</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
