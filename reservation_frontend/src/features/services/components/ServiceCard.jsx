import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchServiceById } from '../servicesSlice';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const ServiceCard = ({ service }) => {
  const dispatch = useDispatch();

  const handleQuickView = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(fetchServiceById(service.id)).unwrap();
    } catch (error) {
      console.error('Failed to fetch service details:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <Card hover className="h-full flex flex-col group">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Category badge */}
        {service.category_name && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
            {service.category_name}
          </div>
        )}

        {/* Rating badge */}
        {service.rating && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
            {service.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {service.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(service.price)}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{service.duration_minutes} min</span>
              {service.category_icon && (
                <span>{service.category_icon}</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleQuickView}
            >
              Quick View
            </Button>
            <Link to={`/services/${service.id}/book`}>
              <Button size="sm">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
