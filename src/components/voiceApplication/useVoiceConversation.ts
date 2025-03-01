
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useAudioContext } from './useAudioContext';
import { useCallTimer } from './useCallTimer';
import { useCVGeneration } from './useCVGeneration';
import { useConversationManager } from './useConversationManager';
import { VoiceConversationHook } from './types';

export const useVoiceConversation = (): VoiceConversationHook => {
  // State management
  const [isCallActive, setIsCallActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [interviewTranscript, setInterviewTranscript] = useState<string[]>([]);
  
  // Refs
  const cvGenerationAttemptedRef = useRef<boolean>(false);
  const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldGenerateCVRef = useRef<boolean>(false);
  
  // Custom hooks
  const audioContextRef = useAudioContext();
  const timerRef = useCallTimer(isCallActive, setCallDuration);
  const { 
    generatedCV, 
    setGeneratedCV, 
    generateCV 
  } = useCVGeneration();
  
  const { 
    isMuted, 
    conversationRef,
    toggleMute, 
    startConversation: initiateConversation, 
    endConversation: terminateConversation 
  } = useConversationManager(
    setIsCallActive, 
    setIsProcessing, 
    setInterviewTranscript, 
    shouldGenerateCVRef,
    audioContextRef
  );

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
      }
      if (conversationRef.current) {
        conversationRef.current.endSession();
      }
    };
  }, []);

  // Ensure CV generation after conversation ends
  useEffect(() => {
    console.log('useEffect triggered - isCallActive:', isCallActive, 'generatedCV:', !!generatedCV, 'transcript length:', interviewTranscript.length, 'shouldGenerateCV:', shouldGenerateCVRef.current);
    
    if (!isCallActive && !generatedCV && interviewTranscript.length > 0 && shouldGenerateCVRef.current) {
      console.log('End of call detected with transcript data - generating CV');
      // Add a slight delay to ensure all transcript data is processed
      const timeoutId = setTimeout(() => {
        if (!generatedCV && interviewTranscript.length > 0) {
          console.log('Executing CV generation after delay');
          generateCV(interviewTranscript, cvGenerationAttemptedRef);
        }
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isCallActive, generatedCV, interviewTranscript, generateCV]);

  // Additional check for CV generation after a fixed time
  useEffect(() => {
    // No need to setup this effect if already generated or no transcript
    if (generatedCV || interviewTranscript.length === 0) {
      return;
    }
    
    // Set a backup timer to check if CV should be generated
    const backupTimerId = setInterval(() => {
      if (!isCallActive && !generatedCV && interviewTranscript.length > 0 && shouldGenerateCVRef.current) {
        console.log('Backup timer check: CV should be generated - attempting now');
        generateCV(interviewTranscript, cvGenerationAttemptedRef);
        clearInterval(backupTimerId);
      }
    }, 3000);
    
    return () => clearInterval(backupTimerId);
  }, [isCallActive, generatedCV, interviewTranscript, generateCV]);

  // Wrapper for startConversation to reset state
  const startConversation = async (): Promise<void> => {
    // Reset CV generation state
    setGeneratedCV(null);
    cvGenerationAttemptedRef.current = false;
    shouldGenerateCVRef.current = false;
    
    await initiateConversation();
  };

  // Wrapper for endConversation to handle CV generation
  const endConversation = async (): Promise<void> => {
    // Flag CV generation before ending conversation
    shouldGenerateCVRef.current = true;
    console.log('Flagging CV generation in endConversation');
    
    await terminateConversation();
    
    // Set a timeout to force CV generation if it hasn't happened yet
    if (interviewTranscript.length > 0) {
      console.log('Setting up disconnect timeout for CV generation');
      
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
      }
      
      disconnectTimeoutRef.current = setTimeout(() => {
        if (!generatedCV && !cvGenerationAttemptedRef.current && interviewTranscript.length > 0) {
          console.log('Forcing CV generation after timeout');
          generateCV(interviewTranscript, cvGenerationAttemptedRef);
        }
      }, 2000);
    } else {
      toast.success("Interview completed.");
    }
  };

  // Reset the application
  const resetApplication = (): void => {
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
    }
    setGeneratedCV(null);
    setCallDuration(0);
    setInterviewTranscript([]);
    cvGenerationAttemptedRef.current = false;
    shouldGenerateCVRef.current = false;
    toast.info("Application reset. Ready to start again.");
  };

  return {
    isCallActive,
    isProcessing,
    generatedCV,
    callDuration,
    isMuted,
    interviewTranscript,
    startConversation,
    endConversation,
    toggleMute,
    resetApplication
  };
};
