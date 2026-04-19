import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon } from 'lucide-react';
import { toggleTheme, selectTheme } from '../../store/themeSlice';

const ThemeToggle = ({ variant = 'icon' }) => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const isDark = theme === 'dark';

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  if (variant === 'switch') {
    return (
      <button
        onClick={handleToggle}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        style={{ backgroundColor: isDark ? '#087592' : '#e2e8f0' }}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
