import React from 'react';
import { PaymentStatus } from '../../types';

interface BadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  let styleClasses = '';
  
  switch (status) {
    case 'Paid':
      styleClasses = 'bg-[#DCFCE7] text-[#16A34A]';
      break;
    case 'Partial':
      styleClasses = 'bg-[#FEF3C7] text-[#F59E0B]';
      break;
    case 'Unpaid':
    default:
      styleClasses = 'bg-red-100 text-red-600';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-full ${styleClasses} ${sizeClasses} transition-colors`}>
      {status}
    </span>
  );
};
