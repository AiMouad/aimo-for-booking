import React from 'react';
import { motion } from 'framer-motion';

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'badge-pending',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'badge-confirmed',
    dot: 'bg-emerald-500',
  },
  refused: {
    label: 'Refused',
    className: 'badge-refused',
    dot: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'badge-cancelled',
    dot: 'bg-gray-400',
  },
  active: {
    label: 'Active',
    className: 'badge-confirmed',
    dot: 'bg-emerald-500',
  },
  info: {
    label: 'Info',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  warning: {
    label: 'Warning',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  success: {
    label: 'Success',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

/**
 * Badge — status indicator with animated dot.
 */
const Badge = ({ status, label, showDot = true, size = 'sm', animated = false }) => {
  const config = statusConfig[status] || {
    label: status || label,
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
    dot: 'bg-gray-400',
  };

  const sizeClass = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${config.className} ${sizeClass}
    `}>
      {showDot && (
        <span className={`
          w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}
          ${animated ? 'animate-pulse' : ''}
        `} />
      )}
      {label || config.label}
    </span>
  );
};

export default Badge;
