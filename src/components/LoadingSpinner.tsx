
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'muted';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  message = 'Loading authentication...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    muted: 'border-muted-foreground'
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-3" aria-busy="true">
      <div
        className={`${sizeClasses[size]} border-t-transparent rounded-full animate-spin ${colorClasses[color]}`}
        aria-hidden="true"
      />
      <div className="text-lg font-medium text-primary" aria-live="polite">{message}</div>
    </div>
  );
};
