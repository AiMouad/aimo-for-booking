import { useState, useEffect } from 'react';
import serviceService from '../services/service.service';

export const useServices = (filters = {}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await serviceService.getAll(filters);
        setServices(data.results || data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [JSON.stringify(filters)]);

  return { services, loading, error };
};