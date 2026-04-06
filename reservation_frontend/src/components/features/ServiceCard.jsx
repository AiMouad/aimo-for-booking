import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const ServiceCard = ({ service }) => {
  return (
    <Card hover className="h-full flex flex-col">
      {/* Image */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              €{service.price}
            </p>
            <p className="text-xs text-gray-500">
              {service.duration_minutes} min
            </p>
          </div>
          <Link to={`/services/${service.id}/book`}>
            <Button size="sm">Book Now</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;