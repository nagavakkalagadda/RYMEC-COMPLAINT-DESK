import React from 'react';
import { motion } from 'framer-motion';

interface PebblePillProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  variant?: 'primary' | 'neutral' | 'danger';
}

export const PebblePill: React.FC<PebblePillProps> = ({
  children,
  className = '',
  onClick,
  active = false,
  variant = 'primary',
}) => {
  const variantStyles = {
    primary: active 
      ? 'bg-brand-royal text-white border-blue-500 shadow-sm' 
      : 'text-silver-300 hover:text-white hover:border-white/20',
    neutral: active 
      ? 'bg-white/15 text-white border-white/25 shadow-sm' 
      : 'text-silver-400 hover:text-silver-200',
    danger: active
      ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
      : 'text-silver-300 hover:text-rose-400 hover:border-rose-400/30'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`pebble-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide transition-all ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};
