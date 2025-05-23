import { cn } from '../../lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'large';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-10 w-10 border-3',
    large: 'h-12 w-12 border-4'
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-b-transparent border-primary-600',
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
    />
  );
} 