
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface CallStatusProps {
  /**
   * Indicates whether a call is currently active
   */
  isCallActive: boolean;
  /**
   * The current duration of the call in seconds
   */
  callDuration: number;
  /**
   * Indicates whether screen reader mode is enabled
   */
  isScreenReaderMode?: boolean;
}

export const CallStatus: React.FC<CallStatusProps> = ({ 
  isCallActive, 
  callDuration,
  isScreenReaderMode = false
}) => {
  if (!isCallActive) return null;
  
  // Format duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formattedDuration = formatDuration(callDuration);
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" 
            aria-hidden="true" />
        <span className="text-sm font-medium">
          Call in progress ({formattedDuration})
          {isScreenReaderMode && (
            <span className="sr-only">
              Interview in progress. Current duration: {formattedDuration} minutes and seconds.
            </span>
          )}
        </span>
      </div>
      <Progress 
        value={Math.min(callDuration, 100)} 
        className="w-full" 
        aria-label={`Call duration: ${formattedDuration}`} 
      />
    </div>
  );
};
