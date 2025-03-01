
import { useEffect, useRef } from 'react';

/**
 * Hook for managing call duration timer
 */
export const useCallTimer = (
  isCallActive: boolean,
  setCallDuration: (value: number | ((prev: number) => number)) => void
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Call duration timer
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCallActive, setCallDuration]);

  return timerRef;
};
