import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Star, Clock, MapPin, ArrowRight, Sparkles, Check } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const ServiceCard = ({ service }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const toggleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col group overflow-hidden hover:shadow-glow transition-all duration-300">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          {service.image ? (
            <>
              <div className={`absolute inset-0 bg-gray-100 dark:bg-surface-800 transition-opacity duration-300 ${
                imageLoaded ? 'opacity-0' : 'opacity-100'
              }`}>
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 text-primary-500"
                  >
                    <Sparkles className="w-full h-full" />
                  </motion.div>
                </div>
              </div>
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-surface flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 mx-auto mb-3 text-primary-500"
                >
                  <Sparkles className="w-full h-full" />
                </motion.div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No image available</p>
              </div>
            </div>
          )}

          {/* Overlay Elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite Button */}
          <motion.button
            onClick={toggleFavorite}
            className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-sm border transition-all duration-300 z-10 ${
              isFavorite
                ? 'bg-red-500 border-red-400 text-white'
                : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </motion.button>

          {/* Category Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary-600 text-white text-xs font-semibold backdrop-blur-sm">
            {service.category || 'Premium'}
          </div>

          {/* Quick Actions */}
          <motion.div
            className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ y: 10 }}
            whileHover={{ y: 0 }}
          >
            <motion.button
              className="flex-1 px-3 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg font-medium text-sm hover:bg-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Quick View
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                  {service.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {service.rating || '4.8'}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({service.reviews || '156'} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
              {service.description}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {service.duration_minutes && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-surface-800 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {service.duration_minutes} min
                  </span>
                </div>
              )}

              {service.location && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-surface-800 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {service.location}
                  </span>
                </div>
              )}

              {service.is_premium && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-100 dark:bg-accent-950/60 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                  <span className="text-xs font-semibold text-accent-700 dark:text-accent-300">
                    Premium
                  </span>
                </div>
              )}
            </div>

            {/* Benefits */}
            {service.benefits && (
              <div className="space-y-2 mb-4">
                {service.benefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{benefit}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <div className="flex-1">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  €{service.price}
                </span>
                {service.original_price && (
                  <span className="text-sm text-gray-400 line-through">
                    €{service.original_price}
                  </span>
                )}
              </div>

              {/* Duration */}
              {service.duration_minutes && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {service.duration_minutes} minutes session
                </p>
              )}

              {/* Savings */}
              {service.original_price && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    Save €{service.original_price - service.price}
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <motion.div
              className="ml-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={`/services/${service.id}/book`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-glow"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;