
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface CallStatusProps {
  isCallActive: boolean;
  callDuration: number;
}

export const CallStatus: React.FC<CallStatusProps> = ({ 
  isCallActive, 
  callDuration 
}) => {
  if (!isCallActive) return null;
  
  // Format duration as mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" 
            aria-hidden="true" />
        <span className="text-sm font-medium">Call in progress ({formatDuration(callDuration)})</span>
      </div>
      <Progress value={Math.min(callDuration, 100)} 
              className="w-full" 
              aria-label="Call duration" />
    </div>
  );
};
