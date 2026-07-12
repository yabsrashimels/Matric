import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  variant = 'default',
  style
}) => {
  const baseStyles = 'rounded-xl p-6 transition-all duration-300';
  
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
  };

  const hoverStyles = hover 
    ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' 
    : '';

  const motionProps = hover || onClick ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <motion.div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      style={style}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
