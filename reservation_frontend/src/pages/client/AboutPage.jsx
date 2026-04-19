import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, Clock, TrendingUp, Users, Home, MapPin, Phone, Mail,
  Award, Heart, Target, Globe, Briefcase, Star, CheckCircle
} from 'lucide-react';
import ProfessionalAppBar from '../../components/layout/ProfessionalAppBar';
import Button from '../../components/common/Button';
import './AboutPage.css';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Ahmed Benali',
      role: 'CEO & Founder',
      image: '/api/placeholder/team/ahmed',
      description: 'Visionary leader with 15+ years in hospitality industry'
    },
    {
      name: 'Sarah Mohammed',
      role: 'Head of Operations',
      image: '/api/placeholder/team/sarah',
      description: 'Expert in property management and guest experience'
    },
    {
      name: 'Karim Tlemcani',
      role: 'Technical Director',
      image: '/api/placeholder/team/karim',
      description: 'Innovating our digital booking experience'
    },
    {
      name: 'Lina Boudiaf',
      role: 'Customer Success Manager',
      image: '/api/placeholder/team/lina',
      description: 'Ensuring exceptional guest satisfaction'
    }
  ];

  const milestones = [
    { year: '2018', title: 'AIMO Founded', description: 'Started with 10 properties in Algiers' },
    { year: '2019', title: 'Expansion', description: 'Grew to 50 properties across Algeria' },
    { year: '2020', title: 'Digital Launch', description: 'Launched our online booking platform' },
    { year: '2021', title: 'Quality Recognition', description: 'Received Excellence in Hospitality Award' },
    { year: '2022', title: 'Partnership Growth', description: 'Partnered with 100+ property owners' },
    { year: '2023', title: 'Innovation', description: 'Introduced AI-powered recommendations' },
    { year: '2024', title: 'Market Leader', description: 'Became Algeria\'s premier booking platform' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Verified properties and secure booking process'
    },
    {
      icon: Heart,
      title: 'Guest First',
      description: 'Your comfort and satisfaction are our priority'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Committed to delivering exceptional experiences'
    },
    {
      icon: Globe,
      title: 'Local Expertise',
      description: 'Deep knowledge of Algerian hospitality'
    }
  ];

  const stats = [
    { number: '500+', label: 'Properties' },
    { number: '50K+', label: 'Happy Guests' },
    { number: '15+', label: 'Cities' },
    { number: '4.9', label: 'Average Rating' }
  ];

  return (
    <div className="about-page">
      <ProfessionalAppBar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-content"
          >
            <h1 className="hero-title">About AIMO</h1>
            <p className="hero-subtitle">
              Your trusted partner for exceptional stays across Algeria. 
              We connect travelers with premium properties and unforgettable experiences.
            </p>
            <div className="hero-breadcrumb">
              <Link to="/services">Home</Link>
              <span>/</span>
              <span>About Us</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="stat-card"
              >
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="story-text"
            >
              <h2>Our Story</h2>
              <p>
                Founded in 2018, AIMO began with a simple mission: to revolutionize the way people 
                experience hospitality in Algeria. What started as a small team with just 10 properties 
                has grown into Algeria's premier booking platform, featuring over 500 premium properties 
                across 15+ cities.
              </p>
              <p>
                Our journey has been driven by a passion for excellence and a deep understanding of 
                what travelers truly need. We've built relationships with property owners who share 
                our commitment to quality, and we've invested in technology that makes booking seamless 
                and secure.
              </p>
              <p>
                Today, AIMO stands as a testament to what's possible when you combine local expertise 
                with global standards of service. We're not just a booking platform - we're your gateway 
                to discovering the beauty and hospitality of Algeria.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="story-image"
            >
              <img src="/api/placeholder/about-story" alt="AIMO Story" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="values-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="section-header"
          >
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </motion.div>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="value-card"
              >
                <div className="value-icon">
                  <value.icon size={32} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="section-header"
          >
            <h2>Our Journey</h2>
            <p>Milestones that shaped our success</p>
          </motion.div>
          
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
              >
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="section-header"
          >
            <h2>Meet Our Team</h2>
            <p>The passionate people behind AIMO</p>
          </motion.div>
          
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="team-card"
              >
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <p className="team-description">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="cta-content"
          >
            <h2>Ready to Experience AIMO?</h2>
            <p>
              Join thousands of satisfied guests who have discovered the perfect stay 
              through our platform. Whether you're traveling for business or leisure, 
              we have the ideal property waiting for you.
            </p>
            <div className="cta-buttons">
              <Link to="/services">
                <Button size="lg" variant="primary">
                  Browse Properties
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
