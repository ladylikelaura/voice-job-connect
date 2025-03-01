
import React from 'react';

interface LoadingOverlayProps {
  /**
   * Indicates whether the application is currently processing data
   */
  isProcessing: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isProcessing }) => {
  if (!isProcessing) return null;
  
  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
          role="status"
          aria-label="Loading"
        ></div>
        <p className="text-sm font-medium">Processing...</p>
      </div>
    </div>
  );
};
