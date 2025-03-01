
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Hook for managing AudioContext
 */
export const useAudioContext = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    // Create AudioContext only when needed and only once
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        console.log('AudioContext initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AudioContext:', error);
        toast.error('Audio system initialization failed. Please try again.');
      }
    }
    
    return () => {
      // Cleanup AudioContext when component unmounts
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => console.error('Error closing AudioContext:', err));
        audioContextRef.current = null;
      }
    };
  }, []);

  return audioContextRef;
};
