import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const Card: React.FC<CardProps> = ({ children, title, className = '', variant = 'default' }) => {
  const variants = {
    default: 'border-gray-100',
    success: 'border-green-500 border-t-8',
    warning: 'border-orange-500 border-t-8',
    danger: 'border-red-500 border-t-8'
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-md border ${variants[variant]} ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4 text-center">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
