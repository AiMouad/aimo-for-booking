import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AlgeriaLocationSelector - Enhanced with @dzcode-io/leblad library
 * Provides dynamic wilaya and city selection with Arabic names support
 * Supports all 58 wilayas and 1,541 communes across Algeria
 */
const AlgeriaLocationSelector = ({ value, onChange, label = 'Location', required = false }) => {
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Dynamic import for the leblad library
  const [wilayaList, setWilayaList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  useEffect(() => {
    // Import library dynamically
    import('@dzcode-io/leblad')
      .then((leblad) => {
        if (leblad) {
          setWilayaList(leblad.getWilayaList());
          setCitiesList(leblad.getCommuneList());
        }
      })
      .catch((error) => {
        console.error('Failed to load leblad library:', error);
      });
  }, []);

  // Memoize cities for selected wilaya to avoid recalculation
  const availableCities = useMemo(() => {
    if (!selectedWilaya) return [];
    return citiesList.filter(city => 
      city.wilayaCode === selectedWilaya
    );
  }, [selectedWilaya, citiesList]);

  // Parse initial value if provided (format: "City, Wilaya")
  useEffect(() => {
    if (value && !selectedWilaya) {
      const parts = value.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const cityPart = parts[0];
        const wilayaPart = parts[1];
        
        // Find wilaya by name
        const foundWilaya = wilayaList.find(w => 
          w.name.toLowerCase() === wilayaPart.toLowerCase()
        );
        
        if (foundWilaya) {
          setSelectedWilaya(foundWilaya.code);
          // Find city in this wilaya
          const foundCity = citiesList.find(c => 
            c.wilayaCode === foundWilaya.code && c.name.toLowerCase() === cityPart.toLowerCase()
          );
          if (foundCity) {
            setSelectedCity(foundCity.name);
          }
        }
      }
    }
  }, [value, wilayaList, citiesList]);

  const handleWilayaChange = (e) => {
    const wilayaCode = e.target.value;
    setSelectedWilaya(wilayaCode);
    setSelectedCity('');
    
    if (wilayaCode) {
      const wilaya = wilayaList.find(w => w.code === wilayaCode);
      if (wilaya) {
        onChange({ target: { value: `${wilaya.name}` } });
      }
    } else {
      onChange({ target: { value: '' } });
    }
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    
    if (cityName && selectedWilaya) {
      const wilaya = wilayaList.find(w => w.code === selectedWilaya);
      if (wilaya) {
        onChange({ target: { value: `${cityName}, ${wilaya.name}` } });
      }
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wilaya Selection */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wilaya (State)</span>
          <select
            value={selectedWilaya}
            onChange={handleWilayaChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={required}
          >
            <option value="">Select Wilaya</option>
            {wilayaList.map((wilaya) => (
              <option key={wilaya.code} value={wilaya.code}>
                {wilaya.code} - {wilaya.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic City Selection */}
        <AnimatePresence>
          {selectedWilaya && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Commune (City)</span>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required={required}
              >
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Display selected location */}
      {value && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Selected Location: <span className="font-semibold">{value}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AlgeriaLocationSelector;
