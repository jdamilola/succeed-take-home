import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'error' | 'warning' | 'success' | 'info';
  className?: string;
}

const variantStyles = {
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function Alert({ 
  children, 
  variant = 'info', 
  className = '' 
}: AlertProps) {
  return (
    <div className={`p-4 border rounded-md ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
} 